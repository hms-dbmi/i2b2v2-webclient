/**
 * This file is the library that is loaded into a plugin to allow
 * communications with the i2b2 cells.
 **/

i2b2.ajax = {};
i2b2.ajax._msgDb = {};

//======================================================================================================================
i2b2.ajax._sendMsg = function(cell, func, data) {
    let msgId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    i2b2.ajax._msgDb[msgId] = {};
    return new Promise((resolve, reject) => {
        // save the resolve/reject functions in the main msg db
        i2b2.ajax._msgDb[msgId].resolve = resolve;
        i2b2.ajax._msgDb[msgId].reject = reject;
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


//======================================================================================================================
i2b2.ajax._receiveMsg = function(eventData) {
    console.dir(eventData);

    // check to see if the message is in the DB
    const msgId = eventData.msgId;
    if (msgId === undefined || i2b2.ajax._msgDb[eventData.msgId] === undefined) return false;
    // see if it is an error
    if (eventData.msgType === "AJAX_ERROR") {
        // reject the promise
        i2b2.ajax._msgDb[eventData.msgId].reject(eventData);
    } else {
        // resolve the promise
        i2b2.ajax._msgDb[eventData.msgId].resolve(eventData.ajaxReply);
    }
    // remove msg from database to prevent memory leaks
    delete i2b2.ajax._msgDb[eventData.msgId];
};


//======================================================================================================================
window.addEventListener("I2B2_INIT_AJAX", function(evt) {
    // console.log("Initialize AJAX routines");
    // console.dir(evt.detail);

    // create the ajax.CELL.FUNCTION namespaces for API access
    for (let cell in evt.detail) {
        i2b2.ajax[cell] = {};
        evt.detail[cell].forEach((func) => {
            // create a closure to remember the target cell+function when invoked
            i2b2.ajax[cell][func] = function(data) {
                // send execution to the main router function
                return i2b2.ajax._sendMsg(cell, func, data);
            }
        });
    }

    // once initialized, sent the ready signal to the plugin's i2b2 loader
    window.dispatchEvent(new Event('I2B2_AJAX_READY'));
});


//======================================================================================================================
window.addEventListener("message", (event) => {
    if (event.data.msgType === "AJAX_REPLY" || event.data.msgType === "AJAX_ERROR") {
        i2b2.ajax._receiveMsg(event.data);
    }
});
