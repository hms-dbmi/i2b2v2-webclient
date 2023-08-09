/**
 * @projectDescription	The Asynchronous Query Status controller (GUI-only controller).
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QueryMgr
 * @author		Nick Benik
 * @version 	1.8
 * ----------------------------------------------------------------------------------------
 */

// create and save the view objects
i2b2.CRC.view.QryMgr = new i2b2Base_cellViewController(i2b2.CRC, 'QryMgr');


// This is done once the entire cell has been loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
        if (cell.cellCode === 'CRC') {
            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.QryMgr",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    cell.view.QryMgr.lm_view = container;

                    // add the cellWhite flare
                    cell.view.QryMgr.containerDiv = $('<div class="CRC_QS_view"></div>').appendTo(container._contentElement);
                    cell.view.QryMgr.containerDiv.append('<div id="infoQueryStatus"></div>');
                    cell.view.QryMgr.containerDiv.append('<div id="infoQueryStatusGraph"></div>');
                    cell.view.QryMgr.containerDiv.append('<div id="infoQueryStatusTable"></div>');

                    $.ajax("js-i2b2/cells/CRC/templates/QueryResultBreakdownGraph.html", {
                        success: (template, status, req) => {
                            //Handlebars.registerPartial("QueryResultBreakdownGraph", req.responseText);
                            let breakdownGraph = $("#infoQueryStatusGraph").hide();
                            $((Handlebars.compile(template))()).appendTo(breakdownGraph);
                            i2b2.CRC.view.QryMgr.render();
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
