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
        $("#infoQueryStatusText .statusButtons").removeClass("running");
        if (i2b2.CRC.model.runner?.deleteCurrentQuery) {
            $("#infoQueryStatusText .statusButtons").addClass("cancelled");
        } else {
            $("#infoQueryStatusText .statusButtons").addClass("done");
        }
    }
};

// ================================================================================================== //
i2b2.CRC.view.QS.clearStatus = function() {
    $("#infoQueryStatus").empty();
    $("#infoQueryStatusTable").empty();
    $("#infoQueryStatusGraph").hide();
};

// ================================================================================================== //
i2b2.CRC.view.QS.timerTick = function() {
    i2b2.CRC.model.runner.elapsedTime = Math.round((new Date() - i2b2.CRC.model.runner.startTime) / 100) / 10;
};
