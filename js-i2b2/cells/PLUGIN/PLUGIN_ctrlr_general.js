/**
 * @projectDescription	View controller for ONT's "Terms" tab.
 * @inherits 	i2b2.PLUGIN
 * @namespace	i2b2.PLUGIN.
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	2.0
 **/
console.group('Load & Execute component file: PLUGIN');
console.time('execute time');




i2b2.events.afterAllCellsLoaded.add((function() {
    // Build the configure object that goes to the plugin-side i2b2 libraries
    // Get cells and their known AJAX calls
    let ajaxTree = {};
    for (let idx in i2b2) {
        if (!idx.includes("PLUGIN") && i2b2[idx].ajax !== undefined) {
            // found a cell
            ajaxTree[idx] = [];
            console.log(idx);
            for (let funcName in i2b2[idx].ajax) {
                if (funcName.substr(0,1) !== '_' && typeof i2b2[idx].ajax[funcName] === 'function') {
                    ajaxTree[idx].push(funcName);
                }
            }
        }
    }
    i2b2.PLUGIN.model.config = {};
    i2b2.PLUGIN.model.config.ajax = ajaxTree;

    // add the list of all known SDX data types
    i2b2.PLUGIN.model.config.sdx = Object.keys(i2b2.sdx.TypeControllers);
}));
















// Below code is executed once the entire cell has been loaded
//================================================================================================== //
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode === "PLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.PLUGIN.view",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                i2b2.PLUGIN.view.lm_view = container;

                // add the cellWhite flare
                let treeTarget = $('<div class="cellWhite" id="i2b2TreeviewOntNav"></div>').appendTo(container._contentElement);

            }).bind(this)
        );
    }
}));


// ================================================================================================== //
console.timeEnd('execute time');
console.groupEnd();