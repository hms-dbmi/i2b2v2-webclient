/**
 * @projectDescription	Message Sniffer subsystem.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Nick Benik
 * @version 	2
 **/

// location for our data to be stored
i2b2.hive.model.msgSniffer = {};
i2b2.hive.model.msgSniffer.msgLog = [];
i2b2.hive.model.msgSniffer.sources = [];

// reference to the Msg Log's UI window
i2b2.hive.model.loggingWindow = null;


i2b2.hive.msgSniffer = {
    show: () => {
        if (i2b2.hive.model.loggingWindow === null || i2b2.hive.model.loggingWindow.closed) {
            try {
                // spawn new
                i2b2.hive.model.loggingWindow = window.open('js-i2b2/hive/logger/index.html', 'i2b2_msgsniffer', 'toolbar=no,resizable=yes,scrollbars=yes,height=490,width=840', false);
                i2b2.hive.model.loggingWindow.focus();
            } catch(e) {
                alert('Could not display the Message Log.\n Please disable any popup blockers and try again.');
                return;
            }

            i2b2.hive.model.loggingWindow.addEventListener("dump-request", (event) => {
                i2b2.hive.model.loggingWindow.dispatchEvent(new CustomEvent("dump-response", {
                    detail: {
                        source: i2b2.hive.model.msgSniffer.sources,
                        msgLog: i2b2.hive.model.msgSniffer.msgLog
                    }
                }));
            });
            i2b2.hive.model.loggingWindow.addEventListener("clear-request", (event) => {
                i2b2.hive.msgSniffer.clear();
            });
        }
        else{
            i2b2.hive.model.loggingWindow.focus();
        }
    },
    close: () => {
        let uiWindow = i2b2.hive.model.loggingWindow;
        if (uiWindow && !uiWindow.closed) uiWindow.close();
        i2b2.hive.model.loggingWindow = null;
    },
    add: (msg) => {
        // add to our storage
        i2b2.hive.model.msgSniffer.msgLog.push(msg);
        // notify the window if it is present
        let uiWindow = i2b2.hive.model.loggingWindow;
        if (uiWindow && !uiWindow.closed) {
            try {
                uiWindow.dispatchEvent(new CustomEvent("add-response", {detail: msg}));
            } catch (e) {}
        }
    },
    clear: () => {
        i2b2.hive.model.msgSniffer.msgLog = [];
        let uiWindow = i2b2.hive.model.loggingWindow;
        if (uiWindow && !uiWindow.closed) {
            try {
                uiWindow.dispatchEvent(new CustomEvent("clear-response"));
            } catch (e) {}
        }
    },
    registerMessageSource: (regMsg) =>  {
        // expected data format: {
        //    channelName: "CELLNAME",
        //    channelActions: ["the names", "of the", "Cell's server calls"],
        // }
        if (!regMsg.channelName || !regMsg.channelActions){
            console.error('MsgSniffer: bad message source registration info / '+Object.inspect(regMsg));
            return false;
        }

        let channelName = regMsg.channelName;
        regMsg.channelCode = channelName;
        if (i2b2[channelName]) {
            if (i2b2[channelName].cfg.config.name) {
                regMsg.channelName = i2b2[channelName].cfg.config.name;

            }
        }
        let was_found = false;
        for (let i = 0; i < i2b2.hive.model.msgSniffer.sources.length; i++) {
            if (i2b2.hive.model.msgSniffer.sources[i].channelName === regMsg.channelName) {
                was_found = true;
                let t = i2b2.hive.model.msgSniffer.sources[i].channelActions.concat(regMsg.channelActions);
                t =  [...new Set( t.map(obj => obj)) ];
                //t.uniq();
                i2b2.hive.model.msgSniffer.sources[i].channelActions = t;
            }
        }
        if (!was_found) {
            i2b2.hive.model.msgSniffer.sources.push(regMsg);
        }
        return true;
    },
};


