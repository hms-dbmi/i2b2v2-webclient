/**
 * @projectDescription	Initialize the i2b2 framework & load the hive configuration information for the core I2B2 Framework.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @version 	2.0
 **/


// build the global i2b2.hive namespace
var i2b2 = {sdx:{TypeControllers:{},Master:{_sysData:{}}},events:{},hive:{cfg:{},helpers:{},base_classes:{},model:{}},h:{}};
if (undefined==i2b2) { i2b2 = {}; }
if (undefined==i2b2.sdx) { i2b2.sdx = {}; }	
if (undefined==i2b2.events) { i2b2.events = {}; }
if (undefined==i2b2.hive) { i2b2.hive = {}; }
if (undefined==i2b2.hive.model) { i2b2.hive.model = {}; }
if (undefined==i2b2.hive.cfg) { i2b2.hive.cfg = {}; }
if (undefined==i2b2.h) { i2b2.h = {}; }
if (undefined==i2b2.hive.base_classes) { i2b2.hive.base_classes = {}; }

i2b2.ClientVersion = "1.8.2";


// ================================================================================================== //
i2b2.Init = function() {
    //load the (user configured) i2b2Hive configuration via JSON config file

    function promise_i2b2_configs() {
        var no_cache = '?____=' + Math.floor(Math.random() * 50000) + 10000;
        return $.when(
            $.getJSON("i2b2_config_domains.json" + no_cache),
            $.getJSON("i2b2_config_cells.json" + no_cache)
        ).done(function (hive_json, cells_json) {
            // success in loading and parsing JSON config file containing all configured cells
            console.warn("SUCCESS: Loaded the i2b2_domains and i2b2_cells configuration files")
            cells_json = cells_json[0]
            i2b2.hive.cfg = hive_json[0]
            i2b2.hive.cfg.lstCells = {}
            // process the list of cells that the web client deployment has configured
            var l = cells_json.length
            for (var i = 0; i < l; i++) {
                var cell_code = cells_json[i].code
                i2b2.hive.cfg.lstCells[cell_code] = cells_json[i]
                if (typeof cells_json[i].forceConfigMsg == "undefined") {
                    i2b2.hive.cfg.lstCells[cell_code].forceConfigMsg = false
                }
                if (typeof cells_json[i].roles !== "object") {
                    i2b2.hive.cfg.lstCells[cell_code].roles = ["DATA_OBFSC"]
                }
                i2b2.hive.cfg.lstCells[cell_code].params = {}
            }
        }).fail(function() {
            console.error("FAILED Loading the i2b2_domains and/or i2b2_cells configuration files");
            console.warn("FAILED URL: " + this.url);
        });
    }


    function promise_i2b2_hive_load() {
        var no_cache = '?____=' + Math.floor(Math.random() * 50000) + 10000;
        return $.getJSON(
            i2b2.hive.cfg.urlFramework + "hive/hive_config_data.json" + no_cache
        ).done(function (hive_cfg_json) {
            console.warn("Loaded i2b2_hive configuration file");
            // use the i2b2 hive configuration file to load all the script files that i2b2 framework requires
            var t = i2b2.hive.cfg.urlFramework;
            i2b2.hive.frameworkFiles = hive_cfg_json.files.map(function(file) {
                return t + "hive/" + file;
            });

            var frameworkFiles = hive_cfg_json.files.map(function(file) {
                $.Deferred(function( defer ) {
                    i2b2.h.getScript( t + "hive/" + file ).then( defer.resolve, defer.reject );
                });
            });

            return $.when(
                frameworkFiles
            ).fail(function() {
                console.error("FAILED loading an i2b2 framework file");
            }).promise();

        }).fail(function() {
            console.error("FAILED loading i2b2_hive configuration file");
            console.warn("FAILED URL: " + this.url);
        });
    }

    // give the browser some time to breathe and load the external JS files before starting the PM cell
    i2b2.events.afterFrameworkInit.add(function(){
        // implement a polling loader to eliminate a race condition with loading of hive_globals.js file
        let closure_timeout_id = null;
        const func_loader = function() {
            // exit if our required object is not yet loaded an parsed
            if (typeof i2b2_BaseCell !== 'function' || typeof i2b2.h !== 'object') return false;

            // stop polling our loader
            clearInterval(closure_timeout_id);

            // Load the hive cells
            for (var cellKey in i2b2.hive.cfg.lstCells) {
                i2b2[cellKey] = new i2b2_BaseCell(i2b2.hive.cfg.lstCells[cellKey]);
            }
            // we must always fully initialize the PM cell
            if (i2b2['PM']) {
                // the project manager cell must fire the afterProjMngtInit event signal
                i2b2['PM'].Init();
            }
            // trigger user events after everything is loaded
            window.setTimeout(function() {
                console.info("EVENT FIRED i2b2.events.afterHiveInit");
                i2b2.events.afterHiveInit.fire();
            }, 100);
        };
        closure_timeout_id = setInterval(func_loader, 25);
    });


    // =============================
    //    LOAD THE i2b2 FRAMEWORK
    // =============================
    promise_i2b2_configs().then(promise_i2b2_hive_load).then(
        function (result) {
            // SUCCESS
            console.info("EVENT FIRED i2b2.events.afterFrameworkInit");
            window.setTimeout(i2b2.events.afterFrameworkInit.fire, 100);
        }, function (result) {
            // FAILURE
            console.error("i2b2 Framework failed to load");
            alert("i2b2 Framework file failed to load!");
        }
    );
}


// create our custom events
// ================================================================================================== //
i2b2.events.afterFrameworkInit = $.Callbacks();
i2b2.events.afterHiveInit = $.Callbacks("once memory unique");
i2b2.events.afterCellInit = $.Callbacks();
i2b2.events.afterLogin = $.Callbacks("once memory unique");
i2b2.events.afterAllCellsLoaded = $.Callbacks("once memory unique");


// A Promise-returning script loader that allows scripts to show up in browser debug tools
// ================================================================================================== //
i2b2.h.getScript = function(url) {
    return $.Deferred(function( defer ) {
        var head	= document.getElementsByTagName("head")[0];
        var script	= document.createElement("script");
        var done 	= false;

        script.setAttribute("defer", ""); // this seems to prevent run conditions cause by scripts getting interpreted out of order
        script.src	= url;
        script.onload = script.onreadystatechange = function() { // Attach handlers for all browsers
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                script.onload = script.onreadystatechange = null; // Handle memory leak in IE
                defer.resolve();
            }
        };
        script.onerror = script.ontimeout = script.onabort = function() {
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                script.onerror = script.ontimeout = script.onabort = null; // Handle memory leak in IE
                defer.reject();
            }
        }
        head.appendChild(script);
    }).promise();
};