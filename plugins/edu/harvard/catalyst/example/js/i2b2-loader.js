/**
 * This is the loader library that handshakes with its iframe parent to get locations for additional library files
 * and handles the initialization process (and state restoration)
 */

i2b2 = {};
i2b2.h = {};
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






//==========================================================================
// handler for loading and initialization
//==========================================================================
window.addEventListener("message", (event) => {
    switch (event.data.msgType) {
        case "INIT_REPLY":
            let scripts = [];
            event.data.libs.forEach((url) => { scripts.push(i2b2.h.getScript(url)); });
            Promise.all(scripts).then(() => {
                console.error("IFRAME: Initialize Plugin Start!");
                console.dir(event);
            });
            break;
    }
});
