/**
 * @projectDescription	View controller for CRC Query Status window.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QS
 * @author		Nick Benik
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 * updated 2-3-2022: Relaunch [Marc-Danie]
 */

// create and save the view objects
i2b2.CRC.view['QS'] = new i2b2Base_cellViewController(i2b2.CRC, 'QS');

// ================================================================================================== //
i2b2.CRC.view.QS.renderStart = function() {
    $("#infoQueryStatusGraph").hide();
};

// ================================================================================================== //
i2b2.CRC.view.QS.render = function(breakdowns) {
    let status = $("#infoQueryStatus").empty();
    let statusTable = $("#infoQueryStatusTable").empty();

    $((Handlebars.compile("{{> QueryResultStatus}}"))(breakdowns)).appendTo(status);
    $((Handlebars.compile("{{> QueryResultBreakdownTable}}"))(breakdowns)).appendTo(statusTable);

    if (!i2b2.CRC.ctrlr.QS.isRunning) {
        // switch the display of query cancel button and the query report button
        $(".CRC_QT_runbar .button-run").show();
        $(".CRC_QT_runbar .button-cancel").hide();

        if (i2b2.CRC.model.runner?.deleteCurrentQuery) {
            $("#infoQueryStatusText .statusButtons").addClass("cancelled");
        } else {
            $("#infoQueryStatusText .statusButtons").addClass("done");
        }
    }else{
        $(".CRC_QT_runbar .button-run").hide();
        $(".CRC_QT_runbar .button-cancel").show();
    }
};

// ================================================================================================== //
i2b2.CRC.view.QS.clearStatus = function() {
    $("#infoQueryStatus").empty();
    $("#infoQueryStatusTable").empty();
    $("#infoQueryStatusGraph").hide();
};

// This is done once the entire cell has been loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
        if (cell.cellCode === 'CRC') {
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.QS",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    cell.view.QS.lm_view = container;

                    // add the cellWhite flare
                    cell.view.QS.containerDiv = $('<div class="CRC_QS_view"></div>').appendTo(cell.view.QS.lm_view._contentElement);
                    cell.view.QS.containerDiv.append('<div id="infoQueryStatus"></div>');
                    cell.view.QS.containerDiv.append('<div id="infoQueryStatusGraph"></div>');
                    cell.view.QS.containerDiv.append('<div id="infoQueryStatusTable"></div>');

                    $.ajax("js-i2b2/cells/CRC/templates/QueryResultBreakdownGraph.html", {
                        success: (template, status, req) => {
                            //Handlebars.registerPartial("QueryResultBreakdownGraph", req.responseText);
                            let breakdownGraph = $("#infoQueryStatusGraph").hide();
                            $((Handlebars.compile(template))()).appendTo(breakdownGraph);
                            i2b2.CRC.view.QS.render();
                        },
                        error: (error) => { console.error("Error (retrieval or structure) with template: QueryResultBreakdownGraph.html"); }
                    });
                    // Show initial screen
                }).bind(this)
            );

            // load the templates (TODO: Refactor this to loop using a varname/filename list)
            // ---------------------------------------------------------
            $.ajax("js-i2b2/cells/CRC/templates/QueryResultBreakdownTable.html", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryResultBreakdownTable", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryResultBreakdownTable.html"); }
            });

            $.ajax("js-i2b2/cells/CRC/templates/QueryResultStatus.html", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryResultStatus", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryResultStatus.html"); }
            });
        }
    }
);
// ================================================================================================== //
i2b2.CRC.view.QS.timerTick = function() {
    i2b2.CRC.model.runner.elapsedTime = Math.round((new Date() - i2b2.CRC.model.runner.startTime) / 100) / 10;
};
