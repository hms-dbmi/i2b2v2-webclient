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

    // update the INTERNAL_SUMMARY data and update display of the Query Summary visualization module in the QueryStatus engine
    i2b2.CRC.QueryStatus.updateFromQueryMgr();

    // in the Query Tool: hide/show run and cancel buttons
    if (i2b2.CRC.model.runner.finished || i2b2.CRC.model.runner.queued) {
        $(".CRC_QT_runbar .button-run").show();
        $(".CRC_QT_runbar .button-cancel").hide();
    } else if (i2b2.CRC.model.runner.isRunning) {
        $(".CRC_QT_runbar .button-run").hide();
        $(".CRC_QT_runbar .button-cancel").show();
    }
};


i2b2.CRC.view.QueryMgr.clearStatus = function() {
    if (!i2b2.CRC.model.runner.isLoading && !i2b2.CRC.model.runner.finished) {
        i2b2.CRC.ctrlr.QueryMgr.stopQuery();
        i2b2.CRC.ctrlr.QueryMgr.tick();
    }

    // clear the query status window
    i2b2.CRC.QueryStatus.clear();
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

                    // add the root DIV for display
                    cell.view.QueryMgr.containerDiv = $('<div class="CRC_QS_view"></div>').appendTo(container._contentElement);
                }).bind(this)
            );
        }
    }
);
