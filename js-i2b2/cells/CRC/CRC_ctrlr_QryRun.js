/**
 * @projectDescription	Event controller for CRC's Query Runner.
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.QR
 * @author		Nick Benik
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 * updated 2-3-2022: Relaunch [Nick Benik]
 */

i2b2.CRC.ctrlr.QR = new QueryRunner();
function QueryRunner() {
    this._tick = function() {
        if (!i2b2.CRC.ctrlr.QS.isRunning) clearInterval(i2b2.CRC.model.runner.intervalTimer);

        if (i2b2.CRC.model.runner?.deleteCurrentQuery) {
            // delete the query master
            let qmId = i2b2.CRC.ctrlr.QS?.QM.id;
            if (qmId !== undefined) i2b2.CRC.ctrlr.history.queryDeleteNoPrompt(qmId);
        }

    };

    this.doRunQuery = function(queryName, queryDefinition) {

        i2b2.CRC.model.runner = {
            name: i2b2.h.Escape(queryName),
            definition: queryDefinition,
            elapsedTime: "0",
            startTime: new Date(),
            status: "Running",
            abortable: true,
            finished: false,
            deleteCurrentQuery: false,
            breakdowns: {},
            intervalTimer: null
        };



        i2b2.CRC.view.QS.timerID = setInterval(i2b2.CRC.view.QS.timerTick, 100);

        // our internal "master" timer
        i2b2.CRC.model.runner.intervalTimer = setInterval(this._tick, 100);

        // define the 2 scoped callbacks that query runner uses
        let callbackQueryDef = new i2b2_scopedCallback();
        callbackQueryDef.scope = this;
        let callbackQueryResultInstance = new i2b2_scopedCallback();
        callbackQueryResultInstance.scope = this;

        // process query run results
        // ==========================================================
        callbackQueryDef.callback = function(results) {
            //		"results" object contains the following attributes:
            //			refXML: xmlDomObject <--- for data processing
            //			msgRequest: xml (string)
            //			msgResponse: xml (string)
            //			error: boolean
            //			errorStatus: string [only with error=true]
            //			errorMsg: string [only with error=true]
            i2b2.CRC.model.QueryResults = results;
            i2b2.CRC.model.runner.status = "Finished";
            i2b2.CRC.model.runner.abortable = false;
            i2b2.CRC.model.runner.finished = true;

            // stop the run timer
            clearInterval(i2b2.CRC.view.QS.timerID);
            i2b2.CRC.view.QS.timerTick();

            // see if error
            if (results.error) {
                i2b2.CRC.model.runner.status = "ERROR";
                //i2b2.CRC.view.QR.render();
                alert(results.errorMsg);
                return;
            }

            // refresh the query history window if it was not deleted
            if (!i2b2.CRC.model.runner.deleteCurrentQuery) i2b2.CRC.view.history.doRefreshAll();

            // get the query instance id
            let qiList = results.refXML.getElementsByTagName('query_instance');
            let qiID = false;
            if (qiList.length > 0) {
                i2b2.CRC.model.runner.idQueryMaster = i2b2.h.XPath(qiList[0], 'descendant-or-self::query_master_id')[0].firstChild.nodeValue;
                qiID = i2b2.h.XPath(qiList[0], 'descendant-or-self::query_instance_id')[0].firstChild.nodeValue;
                i2b2.CRC.model.runner.idQueryInstance = qiID;
                // run the second request to get the result set
                i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("CRC:QueryRunner", {qi_key_value: qiID}, callbackQueryResultInstance);
            }
            i2b2.CRC.ctrlr.QS.updateStatus(results);

            // one last tick to process deleting of canceled query
            i2b2.CRC.ctrlr.QR._tick();
        };

        // process the results to get the query resultInstance
        // ==========================================================
        callbackQueryResultInstance.callback = function(results) {
            // see if error
            if (results.error) {
                i2b2.CRC.model.runner.status = "ERROR RETRIEVING RESULTS";
               // i2b2.CRC.view.QR.render();
                alert(results.errorMsg);
                return;
            }

            // get the QRS information
            let qrsList = results.refXML.getElementsByTagName('query_result_instance');
            let qrsID = false;
            if (qrsList.length > 0) {
                qrsID = i2b2.h.XPath(qrsList[0], 'descendant-or-self::result_instance_id')[0].firstChild.nodeValue;
                i2b2.CRC.model.runner.idQueryResultSet = qrsID;
                i2b2.CRC.model.runner.patientCount = i2b2.h.getXNodeVal(qrsList[0], 'set_size');
            }
            // rerender the results
            //i2b2.CRC.view.QR.render();
        };

        i2b2.CRC.ctrlr.QS.startTime = new Date();

        i2b2.CRC.ctrlr.QS.startStatus(queryName);
        i2b2.CRC.ctrlr.QS.refreshInterrupt = setInterval(i2b2.CRC.ctrlr.QS.refreshStatus, 100);

        // run query using the passed query definition
        // ==========================================================
        i2b2.CRC.ajax.runQueryInstance_fromQueryDefinition("CRC:QueryRunner", i2b2.CRC.model.runner.definition, callbackQueryDef);
    };

    this.doAbortQuery = function() {
        // Aborts a running query
        i2b2.CRC.ctrlr.QS.isRunning = false;
        i2b2.CRC.model.runner.deleteCurrentQuery = true;

        // one last tick to process deleting of canceled query
        i2b2.CRC.ctrlr.QR._tick();

        // clear the query timer's interval
        clearInterval(i2b2.CRC.model.runner.intervalTimer);
        clearInterval(i2b2.CRC.view.QS.timerID);
        clearInterval(i2b2.CRC.ctrlr.QS.refreshInterrupt);

        $(".CRC_QT_runbar .button-run").show();
        $(".CRC_QT_runbar .button-cancel").hide();

        // update the screen to show status as cancelled
        i2b2.CRC.ctrlr.QS.breakdowns.isCancelled = true;
        i2b2.CRC.view.QS.render({breakdowns: i2b2.CRC.ctrlr.QS.breakdowns});
    };

    this.doQueryFinished = function() {
        // TODO: query is done running

        // clear the query timer's interval
        clearInterval(i2b2.CRC.view.QS.timerID);
        clearInterval(i2b2.CRC.ctrlr.QS.refreshInterrupt);

    };
}
