/**
 * This file is the library that is loaded into a plugin to allow
 * plugins to manage a state which solves iframe contents destruction
 * upon iframe movement within the DOM (as performed by Golden Layout)
 **/


window.addEventListener("I2B2_INIT_STATE", function(event) {
    // only respond to same-origin messages
    if (evt.origin !== window.location.origin) return;

    if (i2b2.model === undefined) i2b2.model = {};
    // move the previously saved state back into i2b2.model namespace
    i2b2.model = event.detail;


    // this function sends all data in the "i2b2.model" namespace to the parent window
    i2b2.state = {};
    i2b2.state.save = function() {
        try {
            window.parent.postMessage({
                msgType: "STATE",
                stateData: i2b2.model
            }, "/");
            return true;
        } catch (e) {
            console.error("Could not save state (i2b2.model namespace)!");
            console.log("Is a function or non-serializable object in i2b2.model?");
            console.dir(i2b2.model);
            return false;
        }
    };

    // once initialized, sent the ready signal to the plugin's i2b2 loader
    // ----------------------------------------------------------------------
    window.dispatchEvent(new Event('I2B2_STATE_READY'));
});


