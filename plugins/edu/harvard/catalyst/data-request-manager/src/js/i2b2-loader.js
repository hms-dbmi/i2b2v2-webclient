/**
 * This is the loader library that handshakes with its iframe parent to get locations for additional library files
 * and handles the initialization process (and state restoration)
 */

var i2b2 = {};
i2b2.model = {};
i2b2.h = {};
i2b2.MSG_TYPES = {};


// send init messages to newly loaded i2b2 support libraries
// =====================================================================================================================
i2b2.h.initPlugin = function(initData) {
    // listen for ready replies from the loaded i2b2 support libraries
    const funcReplyHandler = function(signalName, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(reject, timeout);
            window.addEventListener(signalName, () => {
                clearTimeout(timer);
                resolve();
            });
        })
    };
    const timeoutMS = 2000; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<< how long to wait for the support library to initialize
    const replies = [];
    let eventsToSend = [];
    let codes = [];
    for (let code in initData.libs) {
        codes.push(code);
        replies.push(funcReplyHandler("I2B2_" + code + "_READY", timeoutMS));
        let sendData = initData[code.toLowerCase()];
        if (sendData === undefined) sendData = {};
        eventsToSend.push(new CustomEvent('I2B2_INIT_' + code, {detail: sendData}));
    }

    // send signal to all the support libraries that they should begin loading
    eventsToSend.forEach((event) => { window.dispatchEvent(event); });

    // wait for all "ready" replies from all then send the main "i2b2 ready" signal to the plugin's for it to start
    Promise.allSettled(replies).then((results)=>{
        let passed = true;
        results.forEach((result, idx) => {
            if (result.status === "rejected") {
                passed = false;
                let code = codes[idx];
                console.error("Plugin failed to initialize support library: [" + code + "] at " + initData.libs[code]);
            }
        });
        if (!passed) console.warn("A support library was not initialized correctly, attempting to continue anyways...");
        window.dispatchEvent(new Event('I2B2_READY'));
    });
};


// loads i2b2 support libraries into the DOM (returns Promise)
// =====================================================================================================================
i2b2.h.getScript = function(url) {
    return new Promise((resolve, reject) => {
        // SECURITY: Enforce same-origin urls
        if (url.indexOf(document.location.origin) !== 0) {
            console.error("SECURITY FAULT! Plugin was asked to load non-orign script => " + url);
            reject();
            return;
        }

        let head	= document.getElementsByTagName("head")[0];
        let script	= document.createElement("script");
        let done 	= false;

        script.setAttribute("defer", ""); // this seems to prevent run conditions cause by scripts getting interpreted out of order
        script.src	= url;
        script.onload = script.onreadystatechange = function() { // Attach handlers for all browsers
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                script.onload = script.onreadystatechange = null; // Handle memory leak in IE
                setTimeout(resolve(), 10);
            }
        };
        script.onerror = script.ontimeout = script.onabort = function() {
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                script.onerror = script.ontimeout = script.onabort = null; // Handle memory leak in IE
                reject();
            }
        };
        head.appendChild(script);
    });
};


// When entire plugin page is loaded, automatically fire the INIT msg to the parent Plugin Mgr window
//======================================================================================================================
window.addEventListener("load", function() {
    window.parent.postMessage({"msgType":"INIT"}, "/");
});


// handler for loading of i2b2 dependency scripts
//======================================================================================================================
window.addEventListener("message", (event) => {
    if (event.origin === window.location.origin) {
        switch (event.data.msgType) {
            case "INIT_REPLY":
                let scripts = [];
                let codes = [];
                for (let code in event.data.libs) {
                    codes.push(code);
                    scripts.push(i2b2.h.getScript(event.data.libs[code]));
                }
                Promise.allSettled(scripts).then((results) => {
                    let passed = true;
                    results.forEach((result, idx) => {
                        if (result.status === "rejected") {
                            passed = false;
                            let code = codes[idx];
                            console.error("Plugin failed to load support library: [" + code + "] at " + event.data.libs[code]);
                        }
                    });
                    if (passed) i2b2.h.initPlugin(event.data);
                });
                break;
        }
    }
});
