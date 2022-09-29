/**
 * This file is the library that is loaded into a plugin to allow
 * plugins to access protected variables and functions in the parent UI.
 **/

window.addEventListener("I2B2_INIT_TUNNEL", function(event) {

    i2b2.authorizedTunnel = {};
    i2b2.authorizedTunnel.MSG_TYPES = {
        VAR_REQ: "TUNNEL_VAR",
        VAR_RESULT: "TUNNEL_VAR_VALUE",
        VAR_ERROR: "TUNNEL_VAR_ERROR",
        FUNC_REQ:  "TUNNEL_FUNC",
        FUNC_RESULT: "TUNNEL_FUNC_RESULT",
        FUNC_ERROR: "TUNNEL_FUNC_ERROR"
    };
    // data model to save authorized var/func
    let tempAuths= {
        functions: [],
        variables: {}
    };
    // TODO SECURITY: limit function and variables to only entries that start with 'i2b2.'
    if (Array.isArray(event.detail.functions)) tempAuths.functions = event.detail.functions;
    if (typeof event.detail.variables === 'object') {
        Object.entries(event.detail.variables).forEach((entry) => {
            let entryPermission = entry[1].toUpperCase();
            // filter to only correct permissions
            let permissions = "";
            ['O','R','W'].forEach((permission) => {
                if (entryPermission.includes(permission)) permissions += permission;
            });
            tempAuths.variables[entry[0]] = permissions;
        });
    }
    i2b2.authorizedTunnel.authorizedList = tempAuths;



    // USE CLOSURE VARIABLES TO KEEP TRACK OF SENT/RECEIVED MESSAGES
    let cl_messageDB = {};

    // USING CLOSURE FUNCTION FOR SENDING
    // ----------------------------------------------------------------------
    const cl_func_tunnelSendVariableReq = function(varPath, action, newValue) {
        let msgId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        cl_messageDB[msgId] = {};
        return new Promise((resolve, reject) => {
            // save the resolve/reject functions in the main msg db
            cl_messageDB[msgId].resolve = resolve;
            cl_messageDB[msgId].reject = reject;
            // now send the message
            let msg = {
                msgType: i2b2.authorizedTunnel.MSG_TYPES.VAR_REQ,
                msgId: msgId,
                variablePath: varPath,
                variableAction: action
            };
            if (action === "WRITE") msg.variableNewValue = newValue;
            window.parent.postMessage(msg, "/");
        });
    };


    const cl_func_tunnelExecuteFunction = function(funcPath, argumentsArray) {
        let msgId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        cl_messageDB[msgId] = {};
        return new Promise((resolve, reject) => {
            // save the resolve/reject functions in the main msg db
            cl_messageDB[msgId].resolve = resolve;
            cl_messageDB[msgId].reject = reject;
            // now send the message
            let msg = {
                msgType: i2b2.authorizedTunnel.MSG_TYPES.FUNC_REQ,
                msgId: msgId,
                functionPath: funcPath,
                functionArguments: argumentsArray
            };
            window.parent.postMessage(msg, "/");
        });
    };

    const cl_func_receiveMsg = function(eventData) {
        // check to see if the message is in the DB
        const msgId = eventData.msgId;
        if (msgId === undefined || cl_messageDB[eventData.msgId] === undefined) return false;
        // see if it is an error

        if (["TUNNEL_VAR_ERROR", "TUNNEL_FUNC_ERROR"].includes(eventData.msgType)) {
            // reject the promise
            cl_messageDB[eventData.msgId].reject(eventData);
        } else {
            // resolve the promise
            switch (eventData.msgType) {
                case i2b2.authorizedTunnel.MSG_TYPES.VAR_RESULT:
                    cl_messageDB[eventData.msgId].resolve(eventData.variableValue);
                    break;
                case i2b2.authorizedTunnel.MSG_TYPES.FUNC_RESULT:
                    cl_messageDB[eventData.msgId].resolve(eventData);
                    break;
            }
        }
        // remove msg from database to prevent memory leaks
        delete cl_messageDB[eventData.msgId];
    };

    // run a function call
    i2b2.authorizedTunnel.function = new Proxy({}, {
        get: function (target, prop, reciever) {
            if (!i2b2.authorizedTunnel.authorizedList.functions.includes(prop)) {
                // failed preauthorized for read permission
                throw new ReferenceError("AuthorizedTunnel cannot find or access the main UI function: " + prop + "()");
            }
            // return an anonymous function that puts its passed params in an array and passes it on
            return (function () {
                let passedArgs = [];
                for (let i=0; i<arguments.length; i++) passedArgs.push(arguments[i]);
                return new Promise((resolve, reject) => {
                    cl_func_tunnelExecuteFunction(prop, passedArgs).then((resultMsg)=>{
                        resolve(resultMsg.functionResults);
                    }).catch((resultMsg) => {
                        // TODO: Meaningful error message generated here
                        console.error(resultMsg.errorMsg);
                        reject();
                    });
                })
            });
        }
    });

    i2b2.authorizedTunnel.variable = new Proxy({}, {
        // === Get a remote variable value ===
        get: (target, prop, reciever) => {
            let authed_vars = i2b2.authorizedTunnel.authorizedList.variables;
            if (!authed_vars[prop] || !authed_vars[prop].includes('R')) {
                // failed preauthorized for read permission
                throw new ReferenceError("AuthorizedTunnel cannot find or access the main UI variable: " + prop);
            }
            // generate the request and return a nested promise
            return new Promise((resolve, reject) => {
                cl_func_tunnelSendVariableReq(prop,"READ").then((tunnelMsg) => {
                    resolve(tunnelMsg);
                }).catch((tunnelMsg) => {
                    console.error("I am not done yet");
                });
            });
        },
        // === Set a remote variable value ===
        set: (target, prop, value) => {
            let authed_vars = i2b2.authorizedTunnel.authorizedList.variables;
            if (!authed_vars[prop] && !authed_vars[prop].includes('W')) {
                // failed preauthorized for write permission
                throw new ReferenceError("AuthorizedTunnel cannot find or access the main UI variable: " + prop);
            }
            // check if we are setting an object as value
            if (typeof value === 'object' && !authed_vars[prop].includes('O')) {
                // failed preauthorization for writing of Object type to a valid variable
                throw new TypeError("AuthorizedTunnel cannot set the main UI variable '" + prop +"' to an object type");
            }
            // run the SetVar request, assume success, throw error if promise rejects one
            cl_func_tunnelSendVariableReq(prop, "WRITE", value).catch((errEvent) => {
                if (errEvent.errorData) console.error(errEvent.errorData);
                throw new Error("AuthorizedTunnel:SetVariable['"+prop+"'] operation generated the error: " +errEvent.errorMsg);
            });
        }
    });


    // EVENT LISTENER TO ROUTE RETURNED MESSAGES FOR PROCESSING
    // ----------------------------------------------------------------------
    window.addEventListener("message", (event) => {
        if (event.origin === window.location.origin) {
            let MSG_TYPES = i2b2.authorizedTunnel.MSG_TYPES;
            if ([MSG_TYPES.VAR_RESULT, MSG_TYPES.FUNC_RESULT, MSG_TYPES.VAR_ERROR, MSG_TYPES.FUNC_ERROR].includes(event.data.msgType)) {
                cl_func_receiveMsg(event.data);
            }
        }
    });


    // once initialized, sent the ready signal to the plugin's i2b2 loader
    // ----------------------------------------------------------------------
    window.dispatchEvent(new Event('I2B2_TUNNEL_READY'));
});


