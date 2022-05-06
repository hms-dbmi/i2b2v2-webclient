/**
 * This file is the library that is loaded into a plugin to allow
 * SDX-style drag and drop with the main i2b2 UI.
 **/


window.addEventListener("I2B2_INIT_SDX", function(evt) {

    // once initialized, sent the ready signal to the plugin's i2b2 loader
    // ----------------------------------------------------------------------
    window.dispatchEvent(new Event('I2B2_SDX_READY'));
});
