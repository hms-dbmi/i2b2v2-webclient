/**
 * @projectDescription	View controller for ONT's "Terms" tab.
 * @inherits 	i2b2.PLUGIN
 * @namespace	i2b2.PLUGIN.
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	2.0
 **/
console.group('Load & Execute component file: PLUGIN');
console.time('execute time');




i2b2.events.afterAllCellsLoaded.add((function() {
    // Build the configure object that goes to the plugin-side i2b2 libraries
    // Get cells and their known AJAX calls
    let ajaxTree = {};
    for (let idx in i2b2) {
        if (!idx.includes("PLUGIN") && i2b2[idx].ajax !== undefined) {
            // found a cell
            ajaxTree[idx] = [];
            console.log(idx);
            for (let funcName in i2b2[idx].ajax) {
                if (funcName.substr(0,1) !== '_' && typeof i2b2[idx].ajax[funcName] === 'function') {
                    ajaxTree[idx].push(funcName);
                }
            }
        }
    }
    i2b2.PLUGIN.model.config = {};
    i2b2.PLUGIN.model.config.ajax = ajaxTree;

    // add the list of all known SDX data types
    i2b2.PLUGIN.model.config.sdx = Object.keys(i2b2.sdx.TypeControllers);


    // create the event listener for all IFrame to parent messages
    window.addEventListener("message", (event) => {
        // TODO: find out which window the message came from (ignore if unknown)
        let found = false;
        for (let i in i2b2.PLUGIN.view.windows) {
            if (i2b2.PLUGIN.view.windows[i].window === event.source) {
                found = true;
                break;
            }
        }
        if (!found) {
            console.log("NOT FOUND IN WINDOWS ARRAY");
            return false;
        }
        console.warn("Received by Parent");
        console.dir(event);

        // main processing of incoming messages
        switch (event.data.msgType) {
            case "INIT":
                i2b2.PLUGIN._handleInitMsg(event);
                break;
            case "AJAX":
                i2b2.PLUGIN._handleAjaxMsg(event);
                break;
        }
    });
}));


i2b2.PLUGIN._handleInitMsg = function(msgEvent) {
    msgEvent.source.postMessage({"msgType":"INIT_REPLY", "libs":i2b2.PLUGIN.model.libs}, '/');
};


i2b2.PLUGIN._handleAjaxMsg = function(msgEvent) {

};













// Below code is executed once the entire cell has been loaded
//================================================================================================== //
i2b2.events.afterCellInit.add((function(cell) {
    if (cell.cellCode === "PLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');

        // load a list of all plugins
        i2b2.PLUGIN.model.plugins = {};
        $.getJSON("plugins/plugins.json", (data) => {
            data.forEach((id)=>{
                const loc = id.replaceAll('.', '/');
                $.getJSON("plugins/" + loc + "/plugin.json", (pluginJson) => {
                    i2b2.PLUGIN.model.plugins[id] = pluginJson;
                    i2b2.PLUGIN.model.plugins[id].url = "plugins/" + loc + '/' + pluginJson.base;
                });
            });
        });

        // define the dependacy files that are to be load  b
        const baseUrl = window.location.href + "js-i2b2/cells/PLUGIN/libs/";
        i2b2.PLUGIN.model.libs = [];
        i2b2.PLUGIN.model.libs.push(baseUrl + "i2b2-ajax.js");
        i2b2.PLUGIN.model.libs.push(baseUrl + "i2b2-sdx.js");
        i2b2.PLUGIN.model.libs.push(baseUrl + "i2b2-state.js");
    }
}));


// ================================================================================================== //
console.timeEnd('execute time');
console.groupEnd();