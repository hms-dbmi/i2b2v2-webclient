/**
 * @projectDescription	Event controller for CRC's Query Runner.
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.QR
 * @author		Nick Benik
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 * updated 2-3-2022: Relaunch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > ctrlr > QueryRunner');
console.time('execute time');


i2b2.CRC.ctrlr.QR = new QueryRunner();
function QueryRunner() {
    this.doRunQuery = function(queryName, queryDefinition) {

        i2b2.CRC.model.runner = {
            name: queryName,
            definition: queryDefinition,
            elapsedTime: "0",
            startTime: new Date(),
            status: "Running",
            abortable: true,
            finished: false,
            breakdowns: {}
        };

        i2b2.CRC.view.QR.timerID = setInterval(i2b2.CRC.view.QR.timerTick, 100);

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
            clearInterval(i2b2.CRC.view.QR.timerID);
            i2b2.CRC.view.QR.timerTick();

            // see if error
            if (results.error) {
                i2b2.CRC.model.runner.status = "ERROR";
                i2b2.CRC.view.QR.render();
                alert(results.errorMsg);
                return;
            }

            // refresh the query history window
            i2b2.CRC.view.history.doRefreshAll();

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
            i2b2.CRC.view.QR.render();
            i2b2.CRC.ctrlr.QueryStatus.updateStatus(results);
        };

        // process the results to get the query resultInstance
        // ==========================================================
        callbackQueryResultInstance.callback = function(results) {
            // see if error
            if (results.error) {
                i2b2.CRC.model.runner.status = "ERROR RETRIEVING RESULTS";
                i2b2.CRC.view.QR.render();
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
            i2b2.CRC.view.QR.render();
        };

        i2b2.CRC.ctrlr.QueryStatus.startTime = new Date();
        //i2b2.CRC.ctrlr.QueryStatus.private_refreshInterrupt = setInterval("i2b2.CRC.ctrlr.QueryStatus.refreshStatus()", 100);
        //i2b2.CRC.ctrlr.QueryStatus.QM.name = queryName;

        // run query using the passed query definition
        // ==========================================================
        i2b2.CRC.ajax.runQueryInstance_fromQueryDefinition("CRC:QueryRunner", i2b2.CRC.model.runner.definition, callbackQueryDef);
    };
    this.doAbortQuery = function() {
        // TODO: Aborts query run
        alert('abort query');
    };
    this.doQueryFinished = function() {
        // TODO: query is done running

    };
}


console.timeEnd('execute time');
console.groupEnd();
