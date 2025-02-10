/**
 * @projectDescription	View controller for ONT's "Terms" tab.
 * @inherits 	i2b2
 * @namespace	i2b2.PLUGIN
 * @version 	2.0
 **/

// ====[ msg handling for the plugin's INIT message ]===================================================================
i2b2.PLUGIN.ctrlr._handleInitMsg = function(msgEvent, windowInstance) {
    let state = windowInstance.state;
    if (windowInstance.data.state) {
        if (state === undefined) {
            state = windowInstance.data.state;
        } else {
            state = {...windowInstance.state, ...windowInstance.data.state};
        }
    }
    msgEvent.source.postMessage({
        "msgType": i2b2.PLUGIN.model.MSG_TYPES.INIT_REPLY,
        "libs": i2b2.PLUGIN.model.libs,
        "sdx": i2b2.PLUGIN.model.config.sdx,
        "ajax": i2b2.PLUGIN.model.config.ajax,
        "state": state,
        "tunnel": windowInstance.data.authorizedTunnel // TODO: Filter this list based on a deployment-level security config
    }, '/');
};


// ====[ msg handling for the plugin's AJAX messages ]==================================================================
i2b2.PLUGIN.ctrlr._handleAjaxMsg = function(msgEvent, instanceRef) {
    // define error handling function
    const funcSendError = function(msgEvent, errorMsg, errorData) {
        let msg = {"msgType":i2b2.PLUGIN.model.MSG_TYPES.AJAX.ERROR, "msgId":msgEvent.data.msgId, "error": true, "errorMsg": errorMsg};
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
            msgType: i2b2.PLUGIN.model.MSG_TYPES.AJAX.RESULT,
            msgId: msgEvent.data.msgId,
            ajaxReply: i2b2CellMsg.msgResponse
        };
        msgEvent.source.postMessage(msg, '/');
    };
    // fire the function call
    i2b2[cell].ajax[func]("PluginMgr:" + instanceRef.data.code, msgEvent.data.ajaxData, scopeCB);
};


// ====[ msg handling for the plugin's AJAX messages ]==================================================================
i2b2.PLUGIN.ctrlr._handleRawAjaxMsg = function(msgEvent, instanceRef) {
    // define error handling function
    const funcSendError = function(msgEvent, errorMsg, errorData) {
        let msg = {"msgType":i2b2.PLUGIN.model.MSG_TYPES.AJAX.ERROR, "msgId":msgEvent.data.msgId, "error": true, "errorMsg": errorMsg};
        if (errorData !== undefined) msg.errorData = errorData;
        msgEvent.source.postMessage(msg, '/');
    };
    // verify that the cell is valid
    const cell = msgEvent.data.ajaxCell;
    if (i2b2.PLUGIN.model.config.ajax[cell] === undefined) {
        funcSendError(msgEvent, "Requested cell does not exist or was blocked by security settings");
        return false;
    }
    // build the URL
    const url = i2b2[cell].cfg.cellURL + msgEvent.data.ajaxURL;
    // get the regular params
    let sMsgValues = {
        proxy_info: "<proxy><redirect_url>" + url + "</redirect_url></proxy>",
        sec_user: i2b2.h.getUser(),
        sec_pass_node: i2b2.h.getPass(),
        sec_domain: i2b2.h.getDomain(),
        sec_project: i2b2.h.getProject(),
        header_msg_id: i2b2.h.GenerateAlphaNumId(20),
        header_msg_datetime: luxon.DateTime.now().toISO({includeOffset: true}),
        result_wait_time: "180"
    };
    // populate the raw Msg's template tags
    let rawMsg = msgEvent.data.ajaxMsg;
    for (var tag in sMsgValues) {
        rawMsg = rawMsg.replace(new RegExp("{{{"+tag+"}}}", 'g'), sMsgValues[tag]);
    }
    $.ajax({
        type: "POST",
        url:  i2b2.h.getProxy(),
        data: rawMsg
    }).done((response, status, xhr)=>{
        msgEvent.source.postMessage({
            msgType: i2b2.PLUGIN.model.MSG_TYPES.AJAX.RESULT,
            msgId: msgEvent.data.msgId,
            ajaxReply: xhr.responseText
        }, '/');
    }).fail((xhr, status, error)=>{
        let response;
        try {
            // handle JSON returned with erroneous text/xml MIME header
            response = JSON.parse(xhr.responseText);
            msgEvent.source.postMessage({
                msgType: i2b2.PLUGIN.model.MSG_TYPES.AJAX.RESULT,
                msgId: msgEvent.data.msgId,
                ajaxReply: xhr.responseText // send the raw string, not objects
            }, '/');
        } catch(e) {
            funcSendError(msgEvent, "AJAX ERROR:" + status);
        }
    });
};


// ====[ msg handling for the plugin's State messages ]=================================================================
i2b2.PLUGIN.ctrlr._handleStateMsg = function(msgEvent, instanceRef) {
    instanceRef.state = msgEvent.data.stateData;
};



// ====[ msg handling for the plugin's AuthorizedTunnel function execution messages ]===================================
i2b2.PLUGIN.ctrlr._handleTunnelFuncExec = function(msgEvent, instanceRef) {
    // define error handling function
    const funcSendError = function(msgEvent, errorMsg, errorData) {
        let msg = {"msgType":i2b2.PLUGIN.model.MSG_TYPES.TUNNEL.FUNC_ERROR, "msgId":msgEvent.data.msgId, "error": true, "errorMsg": errorMsg};
        if (errorData !== undefined) msg.errorData = errorData;
        msgEvent.source.postMessage(msg, '/');
    };

    // remove invalid path characters []()'",
    let temp = msgEvent.data.functionPath;
    temp = ["[","]","(",")", "'", '"', ','].reduce((acc, val)=> { return acc.replaceAll(val, ''); }, temp);
    msgEvent.data.functionPath = temp;

    // Check the function in the authorization list
    if (!instanceRef.data.authorizedTunnel ||
        !instanceRef.data.authorizedTunnel.functions ||
        !instanceRef.data.authorizedTunnel.functions.includes(msgEvent.data.functionPath)) {
        funcSendError(msgEvent, "No authorization to run the requested function", "REF_ERROR");
        return;
    }

    try {
        // Check to see if the path is navigatible and ends in a function
        let pathArray = msgEvent.data.functionPath.split(".");
        let lastPoint = window;
        while (pathArray.length) {
            lastPoint = lastPoint[pathArray.shift()];
            if (!["object", "function"].includes(typeof lastPoint)) {
                funcSendError(msgEvent, "Function path is non-navigatable", "REF_ERROR");
                return;
            }
        }

        // call the function and get the results, send them via window msg (for now)
        if (typeof lastPoint !== 'function') {
            funcSendError(msgEvent, "Function path is non-navigatable", "REF_ERROR");
            return;
        }
        let origResults = lastPoint(...msgEvent.data.functionArguments);

        // see if function returns a Promise, wait for promise to resolve or reject and send proper window msg based on that
        let msg = {"msgType":i2b2.PLUGIN.model.MSG_TYPES.TUNNEL.FUNC_RESULT, "msgId":msgEvent.data.msgId, "error": false};
        let func_sendResults = function(result) {
            if (typeof result === 'object') result = JSON.parse(JSON.stringify(result));
            msg.functionResults = result;
            msgEvent.source.postMessage(msg, '/');
        }
        if (typeof origResults === 'object' && typeof origResults.then === 'function') {
            // we have a promise wait for resolution to sent back data (or error)
            origResults.then((result)=>{
                func_sendResults(result);
            }).catch(()=>{
                funcSendError(msgEvent, msgEvent.data.functionPath+"() returned a Promise that rejected!");
            });
        } else {
            func_sendResults(origResults);
        }
    } catch(e) {
        funcSendError(msgEvent,"Variable path traversal error!");
        return;
    }

}



// ====[ msg handling for the plugin's AuthorizedTunnel variable messages ]=============================================
i2b2.PLUGIN.ctrlr._handleTunnelVarMsg = function(msgEvent, instanceRef) {
    // define error handling function
    const funcSendError = function(msgEvent, errorMsg, errorData) {
        let msg = {"msgType":i2b2.PLUGIN.model.MSG_TYPES.TUNNEL.VAR_ERROR, "msgId":msgEvent.data.msgId, "error": true, "errorMsg": errorMsg};
        if (errorData !== undefined) msg.errorData = errorData;
        msgEvent.source.postMessage(msg, '/');
    };

    // remove invalid path characters []'",
    let temp = msgEvent.data.variablePath;
    temp = ["[","]", "'", '"', ','].reduce((acc, val)=> { return acc.replaceAll(val, ''); }, temp);
    msgEvent.data.variablePath = temp;

    // see if the variable path has definition with valid security bits
    let securityBits = false;
    if (instanceRef.data.authorizedTunnel &&
        instanceRef.data.authorizedTunnel.variables &&
        Object.keys(instanceRef.data.authorizedTunnel.variables).includes(msgEvent.data.variablePath)) {
        securityBits = String(instanceRef.data.authorizedTunnel.variables[msgEvent.data.variablePath]).toUpperCase();
    } else {
        funcSendError(msgEvent,"Variable path is not defined/allowed", "REF_ERROR");
        return;
    }

    try {
        let pathArray = msgEvent.data.variablePath.split(".");
        let lastPoint = window;
        while (pathArray.length) {
            lastPoint = lastPoint[pathArray.shift()];
            if (!["object","string","number","boolean"].includes(typeof lastPoint)) {
                funcSendError(msgEvent,"Variable path is non-navigatable",  "REF_ERROR");
                return;
            }
        }

        // we have the correct variable, confirm that we can return its value,
        let retValue;
        switch(typeof lastPoint) {
            case "string":
            case "number":
            case "boolean":
                retValue = lastPoint;
                break;
            case "object":
                // confirm object read permission
                if (!securityBits.includes("O")) {
                    funcSendError(msgEvent,"Variable path object is not allowed!", "TYPE_ERROR");
                    return;
                } else {
                    // safely strip all functions and other references that cannot be passed by windowMessage
                    retValue = JSON.parse(JSON.stringify(lastPoint));
                }
                break;
        }

        // do we read or write?
        if (msgEvent.data.variableAction === "READ") {
            // READ REQUEST! Confirm permission
            if (!securityBits.includes("R")) {
                funcSendError(msgEvent, "Attempting to read variable without permission!", "REF_ERROR");
                return;
            } else {
                let msg = {"msgType":i2b2.PLUGIN.model.MSG_TYPES.TUNNEL.VAR_RESULT, "msgId":msgEvent.data.msgId, "error": false, "variableValue": retValue};
                msgEvent.source.postMessage(msg, '/');
            }
        } else {
            // WRITE REQUEST! Confirm permission
            if (!securityBits.includes("W")) {
                funcSendError(msgEvent, "Attempting to write variable without permission!", "REF_ERROR");
                return;
            } else {
                lastPoint = msgEvent.data.variableNewValue;
                let msg = {"msgType":i2b2.PLUGIN.model.MSG_TYPES.TUNNEL.VAR_RESULT, "msgId":msgEvent.data.msgId, "error": false, "variableValue": msgEvent.data.variableNewValue};
                msgEvent.source.postMessage(msg, '/');
            }
        }
    } catch(e) {
        funcSendError(msgEvent,"Variable path traversal error!");
        return;
    }
};



// Below code is executed once the entire cell has been loaded
//======================================================================================================================
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "PLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

        // load a list of all plugins
        i2b2.PLUGIN.model.plugins = {};
        $.getJSON("plugins/plugins.json", (data) => {
            data.forEach((id)=>{
                const loc = id.replaceAll('.', '/');
                $.getJSON("plugins/" + loc + "/plugin.json", (pluginJson) => {
                    if (pluginJson !== undefined) {
                        let pluginAllowed = true;
                        if (pluginJson.roles !== undefined && pluginJson.roles.length > 0){
                            pluginAllowed = pluginJson.roles.some((role) => i2b2.PM.model.userRoles.indexOf(role) !== -1);
                        }

                        if (pluginJson.admin_only && !i2b2.PM.model.isAdmin){
                            pluginAllowed = false;
                        }

                        if (pluginAllowed) {
                            i2b2.PLUGIN.model.plugins[id] = pluginJson;
                            i2b2.PLUGIN.model.plugins[id].url = "plugins/" + loc + '/' + pluginJson.base;
                        }
                    }
                });
            });
        });

        // BUG FIX: I2B2UI-152 "#" gets included in baseUrl
        const {origin, pathname} = window.location;
        const baseUrl = origin + pathname + "js-i2b2/cells/PLUGIN/libs/";
        // define the dependency files that are to be load by the plugins
        i2b2.PLUGIN.model.libs = {};
        i2b2.PLUGIN.model.libs["AJAX"] = baseUrl + "i2b2-ajax.js";
        i2b2.PLUGIN.model.libs["SDX"] = baseUrl + "i2b2-sdx.js";
        i2b2.PLUGIN.model.libs["STATE"] = baseUrl + "i2b2-state.js";
        i2b2.PLUGIN.model.libs["TUNNEL"] = baseUrl + "i2b2-auth-tunnel.js";
    }
});

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

    // different message types that can be sent between plugin iframes and plugin control window
    i2b2.PLUGIN.model.MSG_TYPES = {
        INIT_REQ: "INIT",
        INIT_REPLY: "INIT_REPLY",
        STATE: {
            REQ: "STATE"
        },
        AJAX: {
            REQ: "AJAX",
            RESULT: "AJAX_REPLY",
            ERROR: "AJAX_ERROR",
            RAW_REQ: "AJAX-RAW",
        },
        TUNNEL: {
            VAR_REQ: "TUNNEL_VAR",
            FUNC_REQ:  "TUNNEL_FUNC",
            VAR_RESULT: "TUNNEL_VAR_VALUE",
            FUNC_RESULT: "TUNNEL_FUNC_RESULT",
            VAR_ERROR: "TUNNEL_VAR_ERROR",
            FUNC_ERROR: "TUNNEL_FUNC_ERROR"
        }
    }

    i2b2.PLUGIN.model.config = {};
    i2b2.PLUGIN.model.config.ajax = ajaxTree;

    // add the list of all known SDX data types
    i2b2.PLUGIN.model.config.sdx = Object.keys(i2b2.sdx.TypeControllers);

    // create the event listener for all IFrame to parent messages
    window.addEventListener("message", (event) => {
        if (event.origin === window.location.origin) {
            // TODO: find out which window the message came from (ignore if unknown)
            let foundInstance = undefined;
            for (let i in i2b2.PLUGIN.view.windows) {
                let iframe = $("iframe", i2b2.PLUGIN.view.windows[i].lm_view.element);
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
                case i2b2.PLUGIN.model.MSG_TYPES.INIT_REQ:
                    i2b2.PLUGIN.ctrlr._handleInitMsg(event, foundInstance);
                    break;
                case i2b2.PLUGIN.model.MSG_TYPES.AJAX.REQ:
                    i2b2.PLUGIN.ctrlr._handleAjaxMsg(event, foundInstance);
                    break;
                case i2b2.PLUGIN.model.MSG_TYPES.AJAX.RAW_REQ:
                    i2b2.PLUGIN.ctrlr._handleRawAjaxMsg(event, foundInstance);
                    break;
                case i2b2.PLUGIN.model.MSG_TYPES.STATE.REQ:
                    i2b2.PLUGIN.ctrlr._handleStateMsg(event, foundInstance);
                    break;
                case i2b2.PLUGIN.model.MSG_TYPES.TUNNEL.VAR_REQ:
                    i2b2.PLUGIN.ctrlr._handleTunnelVarMsg(event, foundInstance);
                    break;
                case i2b2.PLUGIN.model.MSG_TYPES.TUNNEL.FUNC_REQ:
                    i2b2.PLUGIN.ctrlr._handleTunnelFuncExec(event, foundInstance);
                    break;
            }
        }
    });
}));
