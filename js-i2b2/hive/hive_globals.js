/**
 * @projectDescription	Various objects/classes used by the i2b2 Framework.
 * @namespace	
 * @inherits 	
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: hive > globals');
console.time('execute time');

// View Controllers
// ================================================================================================== //
function i2b2Base_cellViewController(parentObj, viewName) { 
    // attributes
    this.cellRoot = parentObj;
    this.viewName = viewName;
    this.params = {};
    // functions
    this.showOptions = _showOptions;
    this.Render = _doRender;
    this.Resize = _doResize;
    function _doRender() {			alert("[Cell:"+this.cellRoot.cellCode+"] DEFAULT doRender() function for '"+this.viewName+"' View");	}
    function _doResize(width,height) {	alert("[Cell:"+this.cellRoot.cellCode+"] DEFAULT Resize("+width+","+height+") function for '"+this.viewName+"' View");	}
    function _showOptions(subScreen) {	alert("[Cell:"+this.cellRoot.cellCode+"] DEFAULT showOptions() function for '"+this.viewName+"' View (request subscreen:'"+subScreen+"')");	}
    function _saveOptions(subScreen) {	alert("[Cell:"+this.cellRoot.cellCode+"] DEFAULT saveOptions() function for '"+this.viewName+"' View (request subscreen:'"+subScreen+"')");	}
    function _cancelOptions(subScreen) {	alert("[Cell:"+this.cellRoot.cellCode+"] DEFAULT cancelOptions() function for '"+this.viewName+"' View (request subscreen:'"+subScreen+"')");	}
};


// base class for sending re-scoped callbacks
// ================================================================================================== //
function i2b2_scopedCallback(refFunction, refScope) {
    console.warn("i2b2_scopedCallback() is depreciated!");
    this.callback = refFunction;
    this.scope = refScope;
}


// base class for all cells
// ================================================================================================== //
function i2b2_BaseCell(configObj) {
    // this function expects the configuration object to have at least a "code" attribute

    if (!configObj || !configObj.code) { return false; }
    this.cellCode = configObj.code;

    // build out the default structure for the cell
    this.cfg = {};
    this.cfg.params = {};
    this.model = {};
    this.view = {};
    this.view.modal = {};
    this.ctrlr = {};
    this.ajax = {};
    this.sdx = {};
    this.isLoaded = null;
    this.initTimer = false;

    // To manage clean loading the following are valid values of the FSM design (loadState var)
    // ---------------------------------------------------------------------------------------
    // -1 = FATAL FAILURE
    // 0 = In memory - blank cell
    // 1 = In memory - minimal cell (waiting JSON cfg)
    // 2 = In memory - waiting initialization (config loaded by JSON)
    // 3 = initializing (via PM configuration)
    // 4 = added CSS files to <head>
    // 5 = loading script files
    // 6 = fully loaded
    this.loadState = 0;
    var stateMachine = {
        state: 0,
        doLoad: false,
        timer: false,
    };

    // =========================================================================
    if (!configObj.name) { 	this.name = configObj.name; }
    // special processing for data in the cell registry (from.js)
    var baseDir = i2b2.hive.cfg.urlFramework;
    if (configObj.forceDir) {
        baseDir += configObj.forceDir+'/'+this.cellCode+'/';
    } else {
        baseDir += 'cells/'+this.cellCode+'/';
    }
    // default directory that the Cell's assets would be in
    var assetDir = baseDir + 'assets/';

    // create an initialization function which will load all of the cell's files (lazy Loader pattern)
    this.Init = (function(inURL, inParams) {
        if (this.isLoaded === true) {
            return
        }

        if (this.loadState < 2) {
            // === cell has NOT loaded its configuration via JSON ===
            if (this.initTimer === false) {
                // attempting full cell load before its configuration JSON has loaded, queue it for later execution
                this.initTimer = setInterval((function () {
                    var cl_inURL = inURL;
                    var cl_inParams = cl_inParams;
                    this.Init.call(this, inURL, inParams);
                }).bind(this), 50); // retry initialization in 50ms
            }
            // we are still awaiting JSON arrival and parsing, wait another tick
            return;
        }
        // === cell has loaded its configuration via JSON ===
        console.debug('i2b2_BaseCell superclass Initialize function for Cell [' + this.cellCode + ']');

        // clear delayed initialization timer if active
        if (this.initTimer !== false) {
            clearInterval(this.initTimer);
        }
        delete this.initTimer;

        // save the passed arguments (giving by PM cell during login)
        if (i2b2.h.isUndefined(inParams)) {
            inParams = [];
        }
        if (i2b2.h.isUndefined(this.cfg.config.assetDir)) {
            this.cfg.config.assetDir = this.cfg.assetDir;
        }
        delete this.cfg.assetDir;


        // save configuration info
        this.cfg.cellURL = inURL;
        this.cfg.cellParams = inParams;

        // load any external CSS files needed ====================================
        this.loadState = 4;
        if (this.cfg.css) {
            for (var i = 0; i < this.cfg.css.length; i++) {
                var attr_list = {
                    type: 'text/css',
                    rel: 'stylesheet',
                    href: this.cfg.config.assetDir + this.cfg.css[i]
                };
                $('<link>')
                    .attr(attr_list)
                    .appendTo('head');
            }
        }

        // load the script files ================================================
        this.loadState = 5;
        // [load the script files]
        var scripts = [];
        for (var i = 0; i < this.cfg.files.length; i++) {
            scripts.push(i2b2.h.getScript(this.cfg.baseDir + this.cfg.files[i]));
        }
        $.when.apply($, scripts) // passing an array of Promises to jQuery
            .done((function () {
                // [onSucess handler function]
                var cellCode = configObj.code;
                var cellParams = inParams;
                // copy all params to all View Controllers
                for (var i in i2b2[cellCode].view) {
                    if (i2b2.h.getObjectClass(i2b2[cellCode].view[i]) == 'i2b2Base_cellViewController') {
                        i2b2[cellCode].view[i].params = $.extend({}, i2b2[cellCode].cfg.params);
                    }
                }
                // send the signal that the Cell is now loaded
                console.info('EVENT FIRED i2b2.events.afterCellInit[' + cellCode + ']');
                i2b2.events.afterCellInit.fire(i2b2[cellCode]);
                this.loadState = 6;
                this.isLoaded = true;
            }).bind(this))
            .fail((function () {
                // [onFailure handler function]
                console.error(this.cellCode + " Cell Failed to load all files in it's configuration file!");
            }).bind(this))
            .catch(console.log.bind(console));


        // [preload the images]
        if (this.cfg.preload !== undefined) {
            for (var i = 0; i < this.cfg.preload.length; i++) {
                var t = this.cfg.preload[i];
                t = t.substring(t.lastIndexOf(".")).toLowerCase();
                switch (t) {
                    case ".gif":
                    case ".png":
                    case ".jpg":
                    case ".jpeg":
                    case ".svg":
                        var attr_lst = { as: 'image',
                                        rel: 'preload',
                                        href: this.cfg.baseDir + this.cfg.preload[i]
                        };
                        $('<link>')
                            .attr(attr_lst)
                            .appendTo('head');
                        break;
                    default:
                        break;
                }
            }
        }


    });


    // load the cell's configuration info into the base cell object being constructed
    this.loadState = 1;
    $.getJSON(baseDir+'cell_config_data.json')
        .done((function(config_data){
            this.cfg = config_data;
            this.cfg.baseDir = baseDir;
            this.cfg.config.assetDir = assetDir;
            // set state of this cell that is has it's JSON configuration loaded
            this.isLoaded = false;
            this.loadState = 2;
        }).bind(this))
        .fail((function(){
            console.error("The " + this.cellCode + " Cell's configuration file is invalid");
            this.Init = function() {
                console.error('i2b2_BaseCell superclass Initialize for Cell [' + this.cellCode + '] cannot occured because of invalid configuration file!');
                this.isLoaded = undefined;
                this.loadState = -1;
            }
            // set state of this cell that it cannot be loaded
            this.isLoaded = undefined;
            this.loadState = -1;
        }).bind(this))
        .catch(console.log.bind(console));
}


// ================= handlebars helper to manage SELECT option selection ==================
Handlebars.registerHelper('select', function(value, options) {
    // Create a select element
    var select = document.createElement('select');

    // Populate it with the option HTML
    select.innerHTML = options.fn(this);

    // Set the value
    select.value = value;

    // Find the selected node, if it exists, add the selected attribute to it
    if (select.children[select.selectedIndex])
        select.children[select.selectedIndex].setAttribute('selected', 'selected');

    return select.innerHTML;
});


console.timeEnd('execute time');
console.groupEnd();