/**
 * This file is the library that is loaded into a plugin to allow
 * plugins to manage a state which solves iframe contents destruction
 * upon iframe movement within the DOM (as performed by Golden Layout)
 **/

if (i2b2 === undefined) i2b2 = {};
// ----- Magic Strings -----
if (i2b2.MSG_TYPES === undefined) i2b2.MSG_TYPES = {};
i2b2.MSG_TYPES.STATE = {};
i2b2.MSG_TYPES.STATE.LIB_INIT = "I2B2_INIT_STATE";
i2b2.MSG_TYPES.STATE.LIB_READY = "I2B2_STATE_READY";
i2b2.MSG_TYPES.STATE.REQ = "STATE";

//======================================================================================================================
window.addEventListener(i2b2.MSG_TYPES.STATE.LIB_INIT, function(event) {

    if (i2b2.model === undefined) i2b2.model = {};
    // move the previously saved state back into i2b2.model namespace
    i2b2.model = event.detail;


    // this function sends all data in the "i2b2.model" namespace to the parent window
    i2b2.state = {};
    i2b2.state.save = function() {
        try {
            window.parent.postMessage({
                msgType: i2b2.MSG_TYPES.STATE.REQ,
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
    window.dispatchEvent(new Event(i2b2.MSG_TYPES.STATE.LIB_READY));
});


