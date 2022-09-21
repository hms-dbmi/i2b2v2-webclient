/**
 * This file is the library that is loaded into a plugin to allow
 * plugins to access protected variables and functions in the parent UI.
 **/

window.addEventListener("I2B2_INIT_TUNNEL", function(event) {

    i2b2.authorizedTunnel = {};

    // USE CLOSEURE VARIABLES TO KEEP TRACK OF SENT/RECEIVED MESSAGES
    let cl_messageDB = {};

    // USING CLOSURE FUNCTION FOR SENDING
    // ----------------------------------------------------------------------
    const cl_func_tunnelSetVariable = function(varPath, newValue) {
        let msgId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        cl_messageDB[msgId] = {};
        return new Promise((resolve, reject) => {
            // save the resolve/reject functions in the main msg db
            cl_messageDB[msgId].resolve = resolve;
            cl_messageDB[msgId].reject = reject;
            // now send the message
            let msg = {
                msgType: "TUNNEL_VAR",
                msgId: msgId,
                variablePath: varPath,
                variableNewValue: newValue
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
                case "TUNNEL_VAR_VALUE":
                    cl_messageDB[eventData.msgId].resolve(eventData.variableValue);
                    break;
            }
        }
        // remove msg from database to prevent memory leaks
        delete cl_messageDB[eventData.msgId];
    };


    // data model to save authorized var/func
    i2b2.authorizedTunnel.authorized = {
        variables: [],
        functions: []
    };

    // run a function call
    i2b2.authorizedTunnel.function = function(funcName) {
    };

    // get/set a variable
    i2b2.authorizedTunnel.variable = function(variableName, newValue) {
        return cl_func_tunnelSetVariable(variableName,  newValue);
    };


    // EVENT LISTENER TO ROUTE RETURNED MESSAGES FOR PROCESSING
    // ----------------------------------------------------------------------
    window.addEventListener("message", (event) => {
        if (event.origin === window.location.origin) {
            if (["TUNNEL_VAR_REPLY", "TUNNEL_VAR_ERROR", "TUNNEL_VAR_VALUE"].includes(event.data.msgType)) {
                cl_func_receiveMsg(event.data);
            }
        }
    });


    // once initialized, sent the ready signal to the plugin's i2b2 loader
    // ----------------------------------------------------------------------
    window.dispatchEvent(new Event('I2B2_TUNNEL_READY'));
});


