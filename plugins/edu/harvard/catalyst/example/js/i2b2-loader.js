/**
 * This is the loader library that handshakes with its iframe parent to get locations for additional library files
 * and handles the initialization process (and state restoration)
 */

i2b2 = {};
i2b2.model = {};
i2b2.h = {};

// send init messages to newly loaded i2b2 support libraries
// =====================================================================================================================
i2b2.h.initPlugin = function(initData) {
    const eventAJAX = new CustomEvent('I2B2_INIT_AJAX', {detail: initData.ajax});
    const eventSDX = new CustomEvent('I2B2_INIT_SDX', {detail: initData.sdx});
    const eventSTATE = new CustomEvent('I2B2_INIT_STATE', {detail: initData.state});
    window.dispatchEvent(eventAJAX);
    window.dispatchEvent(eventSDX);
    window.dispatchEvent(eventSTATE);
};

// loads i2b2 support libraries into the DOM (returns Promise)
// =====================================================================================================================
i2b2.h.getScript = function(url) {
    return new Promise((resolve, reject) => {
        var head	= document.getElementsByTagName("head")[0];
        var script	= document.createElement("script");
        var done 	= false;

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
    switch (event.data.msgType) {
        case "INIT_REPLY":
            let scripts = [];
            event.data.libs.forEach((url) => { scripts.push(i2b2.h.getScript(url)); });
            Promise.all(scripts).then(() => {
//                console.error("IFRAME: Initialize Plugin Start!");
//                console.dir(event);
                setTimeout(()=>{ i2b2.h.initPlugin(event.data); }, 5);
            });
            break;
    }
});
