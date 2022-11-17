/**
 * This file is the library that is loaded into a plugin to allow
 * communications with the i2b2 cells.
 **/

// ----- Magic Strings -----
i2b2.MSG_TYPES.AJAX = {};
i2b2.MSG_TYPES.AJAX.LIB_INIT = "I2B2_INIT_AJAX";
i2b2.MSG_TYPES.AJAX.LIB_READY = "I2B2_AJAX_READY";
i2b2.MSG_TYPES.AJAX.REQ = "AJAX";
i2b2.MSG_TYPES.AJAX.RESULT = "AJAX_REPLY";
i2b2.MSG_TYPES.AJAX.ERROR = "AJAX_ERROR";
i2b2.MSG_TYPES.AJAX.RAW_REQ = "AJAX-RAW";
// -------------------------


//======================================================================================================================
window.addEventListener(i2b2.MSG_TYPES.AJAX.LIB_INIT, function(evt) {

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
                msgType: i2b2.MSG_TYPES.AJAX.REQ,
                msgId: msgId,
                ajaxCell: cell,
                ajaxFunc: func,
                ajaxData: data
            };
            window.parent.postMessage(msg, "/");
        });
    };

    // USING CLOSURE FUNCTION FOR RECEIVING MSGS
    // ----------------------------------------------------------------------
    const cl_func_receiveMsg = function(eventData) {
        // check to see if the message is in the DB
        const msgId = eventData.msgId;
        if (msgId === undefined || cl_messageDB[eventData.msgId] === undefined) return false;
        // see if it is an error
        if (eventData.msgType === i2b2.MSG_TYPES.AJAX.ERROR) {
            // reject the promise
            cl_messageDB[eventData.msgId].reject(eventData);
        } else {
            // resolve the promise
            cl_messageDB[eventData.msgId].resolve(eventData.ajaxReply);
        }
        // remove msg from database to prevent memory leaks
        delete cl_messageDB[eventData.msgId];
    };

    const cl_func_rawSend = function(url, rawMsg) {
        let msgId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        cl_messageDB[msgId] = {};
        return new Promise((resolve, reject) => {
            // save the resolve/reject functions in the main msg db
            cl_messageDB[msgId].resolve = resolve;
            cl_messageDB[msgId].reject = reject;
            // now send the message
            let msg = {
                msgType: i2b2.MSG_TYPES.AJAX.RAW_REQ,
                msgId: msgId,
                ajaxCell: this+'', // convert to string (a little type hacking)
                ajaxURL: url,
                ajaxMsg: rawMsg
            };
            console.dir(msg);
            window.parent.postMessage(msg, "/");
        });
    };


    // EVENT LISTENER TO ROUTE RETURNED MESSAGES FOR PROCESSING
    // ----------------------------------------------------------------------
    window.addEventListener("message", (event) => {
        if (event.origin === window.location.origin) {
            if (event.data.msgType === i2b2.MSG_TYPES.AJAX.RESULT || event.data.msgType === i2b2.MSG_TYPES.AJAX.ERROR) {
                cl_func_receiveMsg(event.data);
            }
        }
    });

    // create the ajax.CELL.FUNCTION namespaces for API access
    // ----------------------------------------------------------------------
    i2b2.ajax = {};
    for (let cell in evt.detail) {
        i2b2.ajax[cell] = {"_RawSent": cl_func_rawSend.bind(cell)};
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
    window.dispatchEvent(new Event(i2b2.MSG_TYPES.AJAX.LIB_READY));
});