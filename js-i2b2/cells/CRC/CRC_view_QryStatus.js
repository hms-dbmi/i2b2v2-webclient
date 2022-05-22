/**
 * @projectDescription	View controller for CRC Query Status window.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QS
 * @author		Nick Benik
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 * updated 2-3-2022: Relaunch [Marc-Danie]
 */
console.group('Load & Execute component file: CRC > view > Query Status');
console.time('execute time');

// create and save the view objects
i2b2.CRC.view['QS'] = new i2b2Base_cellViewController(i2b2.CRC, 'QS');


// ================================================================================================== //
i2b2.CRC.view.QS.render = function(breakdowns) {
    $(i2b2.CRC.view.QS.containerDiv).empty();

    $((Handlebars.compile("{{> QueryResultBreakdown}}"))(breakdowns)).appendTo(i2b2.CRC.view.QS.containerDiv);
};

// ================================================================================================== //
// This is done once the entire cell has been loaded
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
i2b2.events.afterCellInit.add(
    function (cell) {
        if (cell.cellCode === 'CRC') {
// ================================================================================================== //
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');

            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.QS",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    cell.view.QS.lm_view = container;

                    // add the cellWhite flare
                    cell.view.QS.containerDiv = $('<div class="CRC_QS_view"></div>').appendTo(cell.view.QS.lm_view._contentElement);

                    // Show initial screen
                    i2b2.CRC.view.QS.render();
                }).bind(this)
            );

            // load the templates (TODO: Refactor this to loop using a varname/filename list)
            // ---------------------------------------------------------
            $.ajax("js-i2b2/cells/CRC/templates/QueryResultBreakdown.html", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryResultBreakdown", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryResultBreakdown.html"); }
            });

        }
    }
);

console.timeEnd('execute time');
console.groupEnd();
