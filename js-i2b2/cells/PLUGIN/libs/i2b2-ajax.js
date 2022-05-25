/**
 * This file is the library that is loaded into a plugin to allow
 * communications with the i2b2 cells.
 **/

//======================================================================================================================
window.addEventListener("I2B2_INIT_AJAX", function(evt) {

    // USE CLOSEURE VARIABLES TO KEEP TRACK OF SENT/RECEIVED MESSAGES
    let cl_messageDB = {};

    // USING CLOSURE FUNCTION FOR SENDING MSGS
    // ----------------------------------------------------------------------
    const cl_func_sendMsg = function(cell, func, data) {
        let msgId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        cl_messageDB[msgId] = {};
        return new Promise((resolve, reject) => {
            // save the resolve/reject functions in the main msg db
            cl_messageDB[msgId].resolve = resolve;
            cl_messageDB[msgId].reject = reject;
            // now send the message
            let msg = {
                msgType: "AJAX",
                msgId: msgId,
                ajaxCell: cell,
                ajaxFunc: func,
                ajaxData: data
            };
            console.dir(msg);
            window.parent.postMessage(msg, "/");
        });
    };

    // USING CLOSURE FUNCTION FOR RECEIVING MSGS
    // ----------------------------------------------------------------------
    const cl_func_receiveMsg = function(eventData) {
        console.dir(eventData);
        // check to see if the message is in the DB
        const msgId = eventData.msgId;
        if (msgId === undefined || cl_messageDB[eventData.msgId] === undefined) return false;
        // see if it is an error
        if (eventData.msgType === "AJAX_ERROR") {
            // reject the promise
            cl_messageDB[eventData.msgId].reject(eventData);
        } else {
            // resolve the promise
            cl_messageDB[eventData.msgId].resolve(eventData.ajaxReply);
        }
        // remove msg from database to prevent memory leaks
        delete cl_messageDB[eventData.msgId];
    };

    // EVENT LISTENER TO ROUTE RETURNED MESSAGES FOR PROCESSING
    // ----------------------------------------------------------------------
    window.addEventListener("message", (event) => {
        if (event.origin === window.location.origin) {
            if (event.data.msgType === "AJAX_REPLY" || event.data.msgType === "AJAX_ERROR") {
                cl_func_receiveMsg(event.data);
            }
        }
    });

    // create the ajax.CELL.FUNCTION namespaces for API access
    // ----------------------------------------------------------------------
    i2b2.ajax = {};
    for (let cell in evt.detail) {
        i2b2.ajax[cell] = {};
        evt.detail[cell].forEach((func) => {
            // create a closure to remember the target cell+function when invoked
            i2b2.ajax[cell][func] = function(data) {
                // send execution to the main router function
                return cl_func_sendMsg(cell, func, data);
            }
        });
    }

    // once initialized, sent the ready signal to the plugin's i2b2 loader
    // ----------------------------------------------------------------------
    window.dispatchEvent(new Event('I2B2_AJAX_READY'));
});