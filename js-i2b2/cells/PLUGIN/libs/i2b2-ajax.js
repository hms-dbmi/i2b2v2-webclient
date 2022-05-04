/**
 * This file is the library that is loaded into a plugin to allow
 * communications with the i2b2 cells.
 **/

//======================================================================================================================
window.addEventListener("I2B2_INIT_AJAX", function(evt) {
    console.log("Initialize AJAX");
    console.dir(evt.detail);
});
