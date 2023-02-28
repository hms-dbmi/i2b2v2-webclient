/**
 * @projectDescription	Message Sniffer subsystem.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Nick Benik
 * @version 	2
 **/

// location for our data to be stored
i2b2.hive.model.msgLog = [];

// reference to the Msg Log's UI window
i2b2.hive.model.loggingWindow = null;


i2b2.hive.msgSniffer = {
    show: () => {
        let uiWindow = window.open("js-i2b2/hive/logger/index.html");
        i2b2.hive.model.loggingWindow = uiWindow;
        uiWindow.addEventListener("dump-request", (event) => {
            uiWindow.dispatchEvent(new CustomEvent("dump-response", {detail: i2b2.hive.model.msgLog}));
        });
        uiWindow.addEventListener("clear-request", (event) => {
            i2b2.hive.msgSniffer.clear();
        });
    },
    close: () => {
        let uiWindow = i2b2.hive.model.loggingWindow;
        if (uiWindow && !uiWindow.closed) uiWindow.close();
        i2b2.hive.model.loggingWindow = null;
    },
    add: (msg) => {
        // add to our storage
        i2b2.hive.model.msgLog.push(msg);
        // notify the window if it is present
        let uiWindow = i2b2.hive.model.loggingWindow;
        if (uiWindow && !uiWindow.closed) {
            try {
                uiWindow.dispatchEvent(new CustomEvent("add-response", {detail: msg}));
            } catch (e) {}
        }
    },
    clear: () => {
        i2b2.hive.model.msgLog = [];
        let uiWindow = i2b2.hive.model.loggingWindow;
        if (uiWindow && !uiWindow.closed) {
            try {
                uiWindow.dispatchEvent(new CustomEvent("clear-response"));
            } catch (e) {}
        }
    }
};


