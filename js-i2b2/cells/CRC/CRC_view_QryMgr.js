/**
 * @projectDescription	The Asynchronous Query Status controller (GUI-only controller).
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QueryMgr
 * @author		Nick Benik
 * @version 	1.8
 * ----------------------------------------------------------------------------------------
 */

// create and save the view objects
i2b2.CRC.view.QueryMgr = new i2b2Base_cellViewController(i2b2.CRC, 'QueryMgr');


i2b2.CRC.view.QueryMgr.updateStatus = function() {
    // this function does the initial render of the query run status
    let statusDiv = $("#infoQueryStatus", i2b2.CRC.view.QueryMgr.containerDiv).empty();
    $((Handlebars.compile("{{> QueryResultStatus}}"))(i2b2.CRC.model.runner)).appendTo(statusDiv);


    // in the Query Tool: hide/show run and cancel buttons
    if (i2b2.CRC.model.runner.finished) {
        $(".CRC_QT_runbar .button-run").show();
        $(".CRC_QT_runbar .button-cancel").hide();
    } else if (i2b2.CRC.model.runner.isRunning) {
        $(".CRC_QT_runbar .button-run").hide();
        $(".CRC_QT_runbar .button-cancel").show();
    }


};


i2b2.CRC.view.QueryMgr.clearStatus = function() {
    $("#infoQueryStatus", i2b2.CRC.view.QueryMgr.containerDiv).empty();
    $("#infoQueryReport", i2b2.CRC.view.QueryMgr.containerDiv).empty();
}



// This is done once the entire cell has been loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
        if (cell.cellCode === 'CRC') {
            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.QueryMgr",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    cell.view.QueryMgr.lm_view = container;

                    // add the cellWhite flare
                    cell.view.QueryMgr.containerDiv = $('<div class="CRC_QS_view"></div>').appendTo(container._contentElement);
                    cell.view.QueryMgr.containerDiv.append('<div id="infoQueryStatus"></div>');
                    cell.view.QueryMgr.containerDiv.append('<div id="infoQueryReport"></div>');

                    container.on('resize',function() {
                        // rerender result graphs if needed
                        if (i2b2.CRC.view.QueryReport.breakdowns) i2b2.CRC.view.graphs.rerenderGraphs();
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

            $.ajax("js-i2b2/cells/CRC/templates/QueryResult.html", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryResult", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryResult.html"); }
            });

            $.ajax("js-i2b2/cells/CRC/templates/QueryResultBreakdownGraph.html", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryResultBreakdownGraph", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryResultBreakdownGraph.html"); }
            });
        }
    }
);
