/**
 * @projectDescription	View controller for ONT's "Terms" tab.
 * @inherits 	i2b2
 * @namespace	i2b2.PLUGIN
 * @version 	2.0
 **/
console.group('Load & Execute component file: PLUGIN');
console.time('execute time');

// ====[ msg handling for the plugin's INIT message ]===================================================================
i2b2.PLUGIN.ctrlr._handleInitMsg = function(msgEvent, windowInstance) {
    msgEvent.source.postMessage({
        "msgType":"INIT_REPLY",
        "libs": i2b2.PLUGIN.model.libs,
        "sdx": i2b2.PLUGIN.model.config.sdx,
        "ajax": i2b2.PLUGIN.model.config.ajax,
        "state": windowInstance.state
    }, '/');
};


// ====[ msg handling for the plugin's AJAX messages ]==================================================================
i2b2.PLUGIN.ctrlr._handleAjaxMsg = function(msgEvent, instanceRef) {
    // define error handling function
    const funcSendError = function(msgEvent, errorMsg, errorData) {
        let msg = {"msgType":"AJAX_ERROR", "msgId":msgEvent.data.msgId, "error": true, "errorMsg": errorMsg};
        if (errorData !== undefined) msg.errorData = errorData;
        msgEvent.source.postMessage(msg, '/');
    };
    // verify that the cell+function is valid
    const cell = msgEvent.data.ajaxCell;
    const func = msgEvent.data.ajaxFunc;
    if (i2b2.PLUGIN.model.config.ajax[cell] === undefined) {
        funcSendError(msgEvent, "Requested cell does not exist or was blocked by security settings");
        return false;
    }
    if (!i2b2.PLUGIN.model.config.ajax[cell].includes(func)) {
        funcSendError(msgEvent, "Cell's requested function does not exist or was blocked by security settings");
        return false;
    }
    // create the scoped callback function
    const scopeCB = function(i2b2CellMsg) {
        if (i2b2CellMsg.error) {
            funcSendError(msgEvent, "An error was detected with transport", i2b2CellMsg.msgResponse);
            return false;
        }
        // relay message
        let msg = {
            msgType: "AJAX_REPLY",
            msgId: msgEvent.data.msgId,
            ajaxReply: i2b2CellMsg.msgResponse
        };
        msgEvent.source.postMessage(msg, '/');
    };
    // fire the function call
    i2b2[cell].ajax[func]("PluginMgr:" + instanceRef.data.code, msgEvent.data.ajaxData, scopeCB);
};


// ====[ msg handling for the plugin's AJAX messages ]==================================================================
i2b2.PLUGIN.ctrlr._handleStateMsg = function(msgEvent, instanceRef) {
    instanceRef.state = msgEvent.data.stateData;
};



// Below code is executed once the entire cell has been loaded
//======================================================================================================================
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

        // define the dependency files that are to be load by the plugins
        const baseUrl = window.location.href + "js-i2b2/cells/PLUGIN/libs/";
        i2b2.PLUGIN.model.libs = {};
        i2b2.PLUGIN.model.libs["AJAX"] = baseUrl + "i2b2-ajax.js";
        i2b2.PLUGIN.model.libs["SDX"] = baseUrl + "i2b2-sdx.js";
        i2b2.PLUGIN.model.libs["STATE"] = baseUrl + "i2b2-state.js";
    }
}));

// Once all cells are loaded we crawl the i2b2 namespace to extract information for AJAX and SDX operations
//======================================================================================================================
i2b2.events.afterAllCellsLoaded.add((function() {
    // Build the configure object that goes to the plugin-side i2b2 libraries
    // Get cells and their known AJAX calls
    let ajaxTree = {};
    for (let idx in i2b2) {
        if (!idx.includes("PLUGIN") && i2b2[idx].ajax !== undefined) {
            // found a cell
            ajaxTree[idx] = [];
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
        let foundInstance = undefined;
        for (let i in i2b2.PLUGIN.view.windows) {
            let iframe = $("iframe", i2b2.PLUGIN.view.windows[i].lm_view._contentElement);
            if (iframe.length > 0) {
                if (iframe[0].contentWindow === event.source) {
                    foundInstance = i2b2.PLUGIN.view.windows[i];
                    break;
                }
            }
        }
        if (foundInstance === undefined) {
            console.warn("PluginMgr: MESSAGE FROM UNKNOWN WINDOW");
            return false;
        }

        // main processing of incoming messages
        switch (event.data.msgType) {
            case "INIT":
                i2b2.PLUGIN.ctrlr._handleInitMsg(event, foundInstance);
                break;
            case "AJAX":
                i2b2.PLUGIN.ctrlr._handleAjaxMsg(event, foundInstance);
                break;
            case "STATE":
                i2b2.PLUGIN.ctrlr._handleStateMsg(event, foundInstance);
        }
    });
}));


// =====================================================================================================================
console.timeEnd('execute time');
console.groupEnd();