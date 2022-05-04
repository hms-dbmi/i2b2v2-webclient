/**
 * This file is the library that is loaded into a plugin to allow
 * communications with the i2b2 cells.
 **/
i2b2.plugin = {};
i2b2.plugin.lib = {};
i2b2.plugin.lib.routeFunc = function(cell, funcName, params){
    alert("routing function cell " + cell + "\tfuncName:\t" + funcName + "\tparams\t" + params);
}

i2b2.plugin.lib.init = function(cellFuncMap) {
  let cells = Object.keys(cellFuncMap);
    cells.forEach(cell => {
      let functionNames = cellFuncMap[cell];
      i2b2[cell]  = {};
      functionNames.forEach(func => {
          i2b2[cell][func] = function(params) {
              i2b2.plugin.lib.routeFunc(cell, func, params);
          }
      })
  });
};

//======================================================================================================================
window.addEventListener("I2B2_INIT_AJAX", function(evt) {
    console.log("Initializing AJAX");
    i2b2.plugin.lib.init(evt.detail);

    //try running a typical function in i2b2
    i2b2.PM.getUserAuth("test");
});
