/**
 * @projectDescription	Event controller for CRC's Query Tool.
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.QT
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: CRC > ctrlr > QueryTool');
console.time('execute time');
 
 
i2b2.CRC.ctrlr.QT = new QueryToolController();
function QueryToolController() {
    i2b2.CRC.model.queryCurrent = {};
    this.queryIsDirty = true;
    this.queryNameDefault = 'New Query';

// ================================================================================================== //
    this.doSetQueryName = function(inName) {
        this.queryIsDirty = true;
        i2b2.CRC.model.queryCurrent.name = inName;
    };


// ================================================================================================== //
    this.doQueryLoad = function(qm_id) {  // function to load query from history
    };

// ================================================================================================== //
    this.doQueryRun = function() {
        // function to build and run query
        if (i2b2.CRC.ctrlr.currentQueryStatus != false && i2b2.CRC.ctrlr.currentQueryStatus.isQueryRunning()) {
            i2b2.CRC.ctrlr.deleteCurrentQuery.cancelled = true;
            i2b2.CRC.ctrlr.currentQueryStatus.cancelQuery();
            i2b2.CRC.ctrlr.currentQueryStatus = false;
            //alert('A query is already running.\n Please wait until the currently running query has finished.');
            return void(0);
        }

        if (i2b2.CRC.model.queryCurrent.panels[i2b2.CRC.ctrlr.QT.temporalGroup].length < 1) {
            alert('You must enter at least one concept to run a query.');
            return void(0);
        }

        // callback for dialog submission
        var handleSubmit = function() {
            // submit value(s)
            if(this.submit()) {
                // run the query
                //if(jQuery("input:checkbox[name=queryType]:checked").length > 0){ // WEBCLIENT-170
                    var t = $('dialogQryRun');
                    var queryNameInput = t.select('INPUT.inputQueryName')[0];
                    var options = {};
                    var t2 = t.select('INPUT.chkQueryType');
                    for (var i=0;i<t2.length; i++) {
                        if (t2[i].checked == true) {
                            options['chk_'+t2[i].value] = t2[i].checked;
                        }
                    }
                    $('queryName').innerHTML = queryNameInput.value;
                    i2b2.CRC.model.queryCurrent.name = queryNameInput.value;
                    i2b2.CRC.ctrlr.QT._queryRun(queryNameInput.value, options);
                //} else {
                //	alert('You must select one query result type to run.');
                //}
            }
        };
        // display the query name input dialog
        this._queryPromptRun(handleSubmit);
        // autogenerate query name
        var myDate=new Date();


        var hours = myDate.getHours();
        if (hours < 10){
            hours = "0" + hours
        }
        var minutes = myDate.getMinutes();
        if (minutes < 10){
            minutes = "0" + minutes
        }
        var seconds = myDate.getSeconds();
        if (seconds < 10){
            seconds = "0" + seconds
        }
        //var ds = myDate.toLocaleString();
        var ts = hours + ":" + minutes + ":" + seconds; //ds.substring(ds.length-5,ds.length-13);
        var defQuery = this._getQueryXML.call(this);
        var qn = defQuery.queryAutoName+'@'+ts;
        // display name
        var queryNameInput = $('dialogQryRun').select('INPUT.inputQueryName')[0];
        queryNameInput.value = qn;
    }


// ================================================================================================== //
    this.runQuery = function(queryTypes) {
        var params = {
            result_wait_time: i2b2.CRC.view.QT.params.queryTimeout,
            psm_query_definition: "",
            psm_result_output: "",
            shrine_topic: ""
        };

        // query outputs
        params.psm_result_output = "<result_output_list>";
        queryTypes.forEach((rec, idx) => {
            params.psm_result_output += '<result_output priority_index="' + (idx + 1) + '" name="' + rec.toLowerCase() + '"/>';
        });
        params.psm_result_output += "</result_output_list>";
        console.log(params.psm_result_output);

        // query definition
        params.psm_query_definition = (Handlebars.compile("{{> Query}}"))(i2b2.CRC.model.transformedQuery)
        console.log(params.psm_query_definition);

        callbackQueryDef = new i2b2_scopedCallback();
        callbackQueryDef.scope = this;
        callbackQueryDef.callback = function(results) {
            //		"results" object contains the following attributes:
            //			refXML: xmlDomObject <--- for data processing
            //			msgRequest: xml (string)
            //			msgResponse: xml (string)
            //			error: boolean
            //			errorStatus: string [only with error=true]
            //			errorMsg: string [only with error=true]
            i2b2.CRC.model.QueryResults = results;
            // refresh the query history window
            i2b2.CRC.view.history.doRefreshAll();
        };

        // run query
        i2b2.CRC.ajax.runQueryInstance_fromQueryDefinition("CRC:QueryTool", params, callbackQueryDef);
    };


    // ================================================================================================== //
    this._processModel = function() {
        let funcTranslateDate = function(trgtdate) {
            // this does proper setting of the timezone based on the browser's current timezone
            return String(trgtdate.getFullYear())+"-"+String(trgtdate.getMonth()+1).padStart(2, "0")+"-"+String(trgtdate.getDate()).padStart(2, "0")+"T00:00:00.00-"+String(trgtdate.getUTCHours()).padStart(2, "0")+":"+String(trgtdate.getUTCMinutes()).padStart(2, "0");
        };

        let transformedModel = {};
        transformedModel.name = i2b2.CRC.model.query.name;
        transformedModel.specificity = "0";
        transformedModel.queryTiming = "ANY";
        transformedModel.useShrine = false;
        transformedModel.panels = [];
        for (let qgIdx=0; qgIdx < i2b2.CRC.model.query.groups.length; qgIdx++) {
            let qgData = i2b2.CRC.model.query.groups[qgIdx];
            let tempPanel = {};
            tempPanel.number = String(qgIdx+1);
            tempPanel.invert = "0";
            if (qgData.without === true) tempPanel.invert = "1";
            tempPanel.timing = "ANY";
            tempPanel.occursCount = qgData.events[0].instances;
            switch (qgData.display) {
                case "when":
                    // TODO: Handle "when" processing
                    break;
                case "without":
                case "with":
                    if (qgData.events[0].dateRange !== undefined) {
                        if (qgData.events[0].dateRange.start !== undefined && qgData.events[0].dateRange.start !== "") tempPanel.dateFrom = funcTranslateDate(new Date(qgData.events[0].dateRange.start));
                        if (qgData.events[0].dateRange.end !== undefined && qgData.events[0].dateRange.end !== "") tempPanel.dateTo = funcTranslateDate(new Date(qgData.events[0].dateRange.end));
                    }
                    break;
            }
            // Process ontology terms
            tempPanel.items = [];
            qgData.events[0].concepts.forEach((item) => {
                let tempItem = {};
                // TODO: how/if we need to handle "<constrain_by_date><date_from/><date_to/></>"
                tempItem.key = i2b2.h.Escape(item.origData.key);
                tempItem.name = i2b2.h.Escape(item.origData.name);
                if (item.origData.tooltip) tempItem.tooltip = i2b2.h.Escape(item.origData.tooltip);
                tempItem.hlevel = item.origData.level;
                tempItem.class = "ENC";
                tempItem.icon = item.origData.hasChildren;
                if (item.origData.synonym_cd !== undefined) {
                    if (item.origData.synonym_cd === true || item.origData.synonym_cd === "Y") {
                        tempItem.isSynonym = "true";
                    } else {
                        tempItem.isSynonym = "false";
                    }
                } else {
                    tempItem.isSynonym = "false";
                }
                // TODO: Handle processing of lab values
                tempPanel.items.push(tempItem);
            });
            if (tempPanel.items.length > 0) transformedModel.panels.push(tempPanel);
        }

        // generate the initial name for query
        if (transformedModel.panels.length > 0) {
            let queryDate = new Date();
            queryDate = String(queryDate.getHours()) + ":" + String(queryDate.getMinutes()) + ":" + String(queryDate.getSeconds());
            let names = transformedModel.panels.map((rec)=>{ return rec.items[0].name.trim()});
            let adjuster = 1 / ((names.map((rec) => rec.length ).reduce((acc, val) => acc + val) + names.length - 1) / 120);
            if (adjuster > 1) adjuster = 1;
            names = names.map((rec) => rec.substr(0, Math.floor(rec.length * adjuster)));
            transformedModel.name  = names.join("-") + "@" + queryDate;
        } else {
            transformedModel.name  = "";
        }

        i2b2.CRC.model.transformedQuery = transformedModel;
    };


    this.getValues = function(lvd) {
                            var s = '\t\t\t<constrain_by_value>\n';
                            //var lvd = sdxData.LabValues;
                            switch(lvd.MatchBy) {
                                case "FLAG":
                                    s += '\t\t\t\t<value_type>FLAG</value_type>\n';
                                    s += '\t\t\t\t<value_operator>EQ</value_operator>\n';
                                    s += '\t\t\t\t<value_constraint>'+i2b2.h.Escape(lvd.ValueFlag)+'</value_constraint>\n';
                                    break;
                                case "VALUE":
                                    if (lvd.GeneralValueType=="ENUM") {
                                        var sEnum = [];
                                        for (var i2=0;i2<lvd.ValueEnum.length;i2++) {
                                            sEnum.push(i2b2.h.Escape(lvd.ValueEnum[i2]));
                                        }
                                        //sEnum = sEnum.join("\", \"");
                                        sEnum = sEnum.join("\',\'");
                                        sEnum = '(\''+sEnum+'\')';
                                        s += '\t\t\t\t<value_type>TEXT</value_type>\n';
                                        s += '\t\t\t\t<value_constraint>'+sEnum+'</value_constraint>\n';
                                        s += '\t\t\t\t<value_operator>IN</value_operator>\n';
                                     } else if ((lvd.GeneralValueType=="STRING") || (lvd.GeneralValueType=="TEXT")){
                                        s += '\t\t\t\t<value_type>TEXT</value_type>\n';
                                        s += '\t\t\t\t<value_operator>'+lvd.StringOp+'</value_operator>\n';
                                        s += '\t\t\t\t<value_constraint><![CDATA['+i2b2.h.Escape(lvd.ValueString)+']]></value_constraint>\n';
                                    } else if (lvd.GeneralValueType=="LARGESTRING") {
                                        if (lvd.DbOp) {
                                            s += '\t\t\t\t<value_operator>CONTAINS[database]</value_operator>\n';
                                        } else {
                                            s += '\t\t\t\t<value_operator>CONTAINS</value_operator>\n';
                                        }
                                        s += '\t\t\t\t<value_type>LARGETEXT</value_type>\n';
                                        s += '\t\t\t\t<value_constraint><![CDATA['+lvd.ValueString+']]></value_constraint>\n';
                                    } else {
                                        s += '\t\t\t\t<value_type>'+lvd.GeneralValueType+'</value_type>\n';
                                        s += '\t\t\t\t<value_unit_of_measure>'+lvd.UnitsCtrl+'</value_unit_of_measure>\n';
                                        s += '\t\t\t\t<value_operator>'+lvd.NumericOp+'</value_operator>\n';
                                        if (lvd.NumericOp == 'BETWEEN') {
                                            s += '\t\t\t\t<value_constraint>'+i2b2.h.Escape(lvd.ValueLow)+' and '+i2b2.h.Escape(lvd.ValueHigh)+'</value_constraint>\n';
                                        } else {
                                            s += '\t\t\t\t<value_constraint>'+i2b2.h.Escape(lvd.Value)+'</value_constraint>\n';
                                        }
                                    }
                                    break;
                                case "":
                                    break;
                            }
                            s += '\t\t\t</constrain_by_value>\n';
        return s;
    }

// ================================================================================================== //
    this._loadTreeDataForNode = function(node, onCompleteCallback) {
        i2b2.sdx.Master.LoadChildrenFromTreeview(node, onCompleteCallback);
    }


}

console.timeEnd('execute time');
console.groupEnd();
