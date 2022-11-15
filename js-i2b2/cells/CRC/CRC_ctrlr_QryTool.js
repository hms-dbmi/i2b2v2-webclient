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
    this.queryNameDefault = 'New Query';

// ================================================================================================== //
    this.doSetQueryName = function(inName) {
        i2b2.CRC.model.queryCurrent.name = inName;
    };

// ================================================================================================== //
    this.clearQuery = function() {
        i2b2.CRC.model.query = {
            name: 'default query name',
            groups: []
        };
    };

// ================================================================================================== //
    this.doQueryLoad = function(qm_id) {  // function to reload query from Query History or Workspace
        // clear existing query
        i2b2.CRC.view.QT.clearAll();
        // show on GUI that work is being done
        //i2b2.h.LoadingMask.show();

        // callback processor
        let scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        scopedCallback.callback = function(results) {
            // THIS function is used to process the AJAX results of the getChild call
            //		results data object contains the following attributes:
            //			refXML: xmlDomObject <--- for data processing
            //			msgRequest: xml (string)
            //			msgResponse: xml (string)
            //			error: boolean
            //			errorStatus: string [only with error=true]
            //			errorMsg: string [only with error=true]
            i2b2.CRC.view.QT.queryRequest = results.msgRequest;
            i2b2.CRC.view.QT.queryResponse = results.msgResponse;

            // did we get a valid query definition back?
            let qd = i2b2.h.XPath(results.refXML, 'descendant::query_name/..');
            if (qd.length !== 0) {
                let queryName = i2b2.h.getXNodeVal(results.refXML,'name');
                this.doSetQueryName(queryName);

                function reformatDate(date) {
                    let year = date.substring(0,4);
                    let month = date.substring(5,7);
                    let day = date.substring(8,10);
                    return [month,day,year].join("/");
                }

                for (let j=0; j <qd.length; j++) {
                    let qp;
                    if (j===0)
                        qp = i2b2.h.XPath(qd[j], 'panel');
                    else
                        qp = i2b2.h.XPath(qd[j], 'descendant::panel');

                    let total_panels = qp.length;
                    for (let i1=0; i1<total_panels; i1++) {

                        let sdxDataNodeList = [];
                        let without = i2b2.h.getXNodeVal(qp[i1],'invert') === "1";
                        let occurs = i2b2.h.getXNodeVal(qp[i1],'total_item_occurrences');
                        let instances = (1*occurs);

                        let metadata = {};
                        metadata.without = without;
                        metadata.instances = instances;

                        let panelFromDate = i2b2.h.getXNodeVal(qp[i1],'panel_date_from');
                        if (panelFromDate) {
                            metadata.startDate = reformatDate(panelFromDate);
                        }

                        let panelToDate = i2b2.h.getXNodeVal(qp[i1],'panel_date_to');
                        if (panelToDate) {
                            metadata.endDate = reformatDate(panelToDate);
                        }

                        let pi = i2b2.h.XPath(qp[i1], 'descendant::item[item_key]');
                        for (let i2=0; i2<pi.length; i2++) {
                            let renderOptions = {};

                            // get the item's details from the ONT Cell
                            let ckey = i2b2.h.getXNodeVal(pi[i2],'item_key');

                            // Determine what item this is
                            let sdxDataNode;
                            if (ckey.toLowerCase().startsWith("query_master_id")) {
                                let o = {};
                                o.name =i2b2.h.getXNodeVal(pi[i2],'item_name');
                                o.id = ckey.substring(16);
                                sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM',o);
                                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                            } else 	if (ckey.toLowerCase().startsWith("masterid")) {
                                let o = {};
                                o.name =i2b2.h.getXNodeVal(pi[i2],'item_name');
                                o.id = ckey.substring(9);
                                sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM',o);
                                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                            } else  if (ckey.toLowerCase().startsWith("folder")) {
                                let o = {};
                                o.titleCRC =  i2b2.h.getXNodeVal(pi[i2],'item_name');
                                o.PRS_id = ckey.substring(19);
                                o.result_instance_id = o.PRS_id ;
                                o.id = ckey;
                                sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRS',o);
                                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                            } else if (ckey.toLowerCase().startsWith("patient_set_coll_id")) {
                                let o = {};
                                o.titleCRC =i2b2.h.getXNodeVal(pi[i2],'item_name');
                                o.PRS_id = ckey.substring(20);
                                o.result_instance_id = o.PRS_id ;
                                sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRS',o);
                                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                            } else if (ckey.toLowerCase().startsWith("patient_set_enc_id")) {
                                let o = {};
                                o.titleCRC =i2b2.h.getXNodeVal(pi[i2],'item_name');
                                o.PRS_id = ckey.substring(19);
                                o.result_instance_id = o.PRS_id ;
                                sdxDataNode = i2b2.sdx.Master.EncapsulateData('PR',o);
                                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                            } else {
                                let o = {};
                                o.level = i2b2.h.getXNodeVal(pi[i2],'hlevel');
                                o.name = i2b2.h.getXNodeVal(pi[i2],'item_name');
                                o.tooltip = i2b2.h.getXNodeVal(pi[i2],'tooltip');

                                // nw096 - If string starts with path \\, lookup path in Ontology cell
                                if(o.name.slice(0, 2) === '\\\\'){
                                    let results = i2b2.ONT.ajax.GetTermInfo("ONT", {ont_max_records:'max="1"', ont_synonym_records:'false', ont_hidden_records: 'false', concept_key_value: o.name}).parse();
                                    if(results.model.length > 0){
                                        o.name = results.model[0].origData.name;
                                        o.tooltip = results.model[0].origData.tooltip;
                                    }
                                }

                                o.key = i2b2.h.getXNodeVal(pi[i2],'item_key');
                                o.synonym_cd = i2b2.h.getXNodeVal(pi[i2],'item_is_synonym');
                                o.hasChildren = i2b2.h.getXNodeVal(pi[i2],'item_icon');

                                // build sdx packet
                                sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',o);

                                // Date constraint processing
                                let dateConstraint = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date');
                                if(dateConstraint.length >0)
                                {
                                    sdxDataNode.dateRange = {};
                                    let dateStart = i2b2.h.getXNodeVal(i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date')[0], "date_from");
                                    if(dateStart !== undefined){
                                        sdxDataNode.dateRange.start = reformatDate(dateStart);
                                    }
                                    let dateEnd = i2b2.h.getXNodeVal(i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date')[0], "date_to");
                                    if(dateEnd !== undefined){
                                        sdxDataNode.dateRange.end = reformatDate(dateEnd);
                                    }
                                }

                                // Lab Values processing
                                let lvd = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_value');

                                //Check whether this is a lab term
                                if ((lvd.length > 0) && (i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier').length === 0))
                                {
                                   sdxDataNode.isLab = true;
                                   sdxDataNode.LabValues = this.parseValueConstraint( lvd );
                                }else{
                                    i2b2.ONT.ajax.GetTermInfo("ONT", {ont_max_records:'max="1"', ont_synonym_records:'false', ont_hidden_records: 'false', concept_key_value: o.key}, function(results){
                                        results.parse();
                                        if(results.model.length > 0){
                                            let data = results.model[0];
                                            sdxDataNode.isLab = i2b2.CRC.view.QT.isLabs(data);
                                            if(sdxDataNode.isLab)
                                            {
                                                i2b2.CRC.view.QT.render();
                                            }
                                        }
                                    });

                                }
                                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                            }
                            sdxDataNodeList.push(sdxDataNode);
                        }
                        i2b2.CRC.view.QT.addNewQueryGroup(sdxDataNodeList, metadata);
                    }
                    i2b2.CRC.view.QT.render();
                }
                i2b2.CRC.ctrlr.QT.loadQueryStatus(qm_id, queryName);
            }
        }
        // AJAX CALL
        i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("CRC:QueryTool", { qm_key_value: qm_id }, scopedCallback);
    };

// ================================================================================================== //
    this.doQueryRun = function() {
        // function to build and run query
        if (i2b2.CRC.ctrlr.currentQueryStatus !== false && i2b2.CRC.ctrlr.currentQueryStatus.isQueryRunning()) {
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
        let handleSubmit = function() {
            // submit value(s)
            if(this.submit()) {
                // run the query
                //if(jQuery("input:checkbox[name=queryType]:checked").length > 0){ // WEBCLIENT-170
                    let t = $('dialogQryRun');
                    let queryNameInput = t.select('INPUT.inputQueryName')[0];
                    let options = {};
                    let t2 = t.select('INPUT.chkQueryType');
                    for (let i=0;i<t2.length; i++) {
                        if (t2[i].checked === true) {
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
        // TODO: Use momentjs to do this
        let myDate=new Date();

        let hours = myDate.getHours();
        if (hours < 10){
            hours = "0" + hours
        }
        let minutes = myDate.getMinutes();
        if (minutes < 10){
            minutes = "0" + minutes
        }
        let seconds = myDate.getSeconds();
        if (seconds < 10){
            seconds = "0" + seconds
        }
        //var ds = myDate.toLocaleString();
        let ts = hours + ":" + minutes + ":" + seconds; //ds.substring(ds.length-5,ds.length-13);
        let defQuery = this._getQueryXML.call(this);
        let qn = defQuery.queryAutoName+'@'+ts;
        // display name
        let queryNameInput = $('dialogQryRun').select('INPUT.inputQueryName')[0];
        queryNameInput.value = qn;
    };
// ================================================================================================== //
    this.loadQueryStatus = function( queryMasterId, queryName) {
        i2b2.CRC.ctrlr.QS.QRS = {};
        i2b2.CRC.ctrlr.QS.QI = {};
        i2b2.CRC.ctrlr.QS.QM = {name: queryName, id: queryMasterId};
        i2b2.CRC.ctrlr.QS.startTime = new Date();
        i2b2.CRC.view.QS.renderStart();
        i2b2.CRC.ctrlr.QS.loadQueryStatus();
    }
// ================================================================================================== //
    this.runQuery = function(queryTypes) {
        let params = {
            result_wait_time: i2b2.CRC.view.QT.params.queryTimeout,
            psm_query_definition: "",
            psm_result_output: "",
            shrine_topic: ""
        };

        i2b2.CRC.ctrlr.QT._processModel();

        // query outputs
        params.psm_result_output = "<result_output_list>";
        queryTypes.forEach((rec, idx) => {
            params.psm_result_output += '<result_output priority_index="' + (idx + 1) + '" name="' + rec.toLowerCase() + '"/>';
        });
        params.psm_result_output += "</result_output_list>";

        // query definition
        params.psm_query_definition = (Handlebars.compile("{{> Query}}"))(i2b2.CRC.model.transformedQuery);

        // get the query name
        let queryName = $('.CRC_QT_runbar input.name',i2b2.CRC.view.QT.containerDiv).text().trim();
        if (queryName.length === 0 ) queryName = i2b2.CRC.model.transformedQuery.name;
        queryName = i2b2.h.Escape(queryName);

        // hand over execution of query to the QueryRunner component
        i2b2.CRC.ctrlr.QR.doRunQuery(queryName, params);
    };
// ================================================================================================== //
    // tdw9: parses value constraint in Value Constraints and Modifier Constraints
    this.parseValueConstraint = function( lvd )
    {
        lvd = lvd[0];
        let labValues = {
            valueType: null,
            valueOperator: null,
            value: null,
            flagValue: null,
            numericValueRangeLow: null,
            numericValueRangeHigh: null,
            unitValue: null
        };

        let valueConstraint = i2b2.h.getXNodeVal(lvd, "value_constraint");
        labValues.valueOperator = i2b2.h.getXNodeVal(lvd, "value_operator");
        let rawValueType = i2b2.h.getXNodeVal(lvd, "value_type");
        switch (rawValueType)
        {
            case "NUMBER":
                if (valueConstraint.indexOf(' and ') !== -1)
                {
                    // extract high and low labValues
                    valueConstraint = valueConstraint.split(' and ');
                    labValues.numericValueRangeLow = valueConstraint[0];
                    labValues.numericValueRangeHigh = valueConstraint[1];
                } else {
                    labValues.value = valueConstraint;
                }
                labValues.valueType= i2b2.CRC.ctrlr.labValues.VALUE_TYPES.NUMBER;
                labValues.unitValue = i2b2.h.getXNodeVal(lvd, "value_unit_of_measure");
                break;
            case "STRING":
                labValues.valueType= i2b2.CRC.ctrlr.labValues.VALUE_TYPES.TEXT;
                labValues.value = valueConstraint;
                labValues.isString = true;
                break;
            case "LARGETEXT":
                labValues.valueType= i2b2.CRC.ctrlr.labValues.VALUE_TYPES.LARGETEXT;
                labValues.value = valueConstraint;
                labValues.isString = true;
                break;
            case "TEXT":
                // This is an ENUM
                labValues.valueType= i2b2.CRC.ctrlr.labValues.VALUE_TYPES.TEXT;
                try
                {
                    labValues.value = eval("(Array" + valueConstraint + ")");
                    labValues.isEnum = true;
                }
                catch (e)
                {
                    //This is a string
                    labValues.valueOperator = i2b2.h.getXNodeVal(lvd, "value_operator");
                    labValues.value = valueConstraint;
                    labValues.valueType = i2b2.CRC.ctrlr.labValues.VALUE_TYPES.TEXT; // tdw9: this line is missing for modifiers in current code. Does it make a different to have it here? Also, "TEXT" is changed from "STRING" to make sure TEXT works in modifiers
                }
                break;
            case "FLAG":
                labValues.valueType= i2b2.CRC.ctrlr.labValues.VALUE_TYPES.FLAG;
                labValues.flagValue = valueConstraint;
                break;
            default:
                labValues.value = valueConstraint;
        }
        return labValues;
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

                if (item.LabValues) {
                    tempItem.valueType = item.LabValues.valueType;
                    tempItem.valueOperator = item.LabValues.valueOperator;
                    tempItem.unitValue= item.LabValues.unitValue;

                    if (item.LabValues.numericValueRangeLow){
                        tempItem.value = item.LabValues.numericValueRangeLow + " and " + item.LabValues.numericValueRangeHigh;
                    }
                    else if(tempItem.valueType === i2b2.CRC.ctrlr.labValues.VALUE_TYPES.FLAG){
                        tempItem.value = item.LabValues.flagValue;
                    }
                    else {
                        tempItem.value = item.LabValues.value;
                    }
                    tempItem.isString = item.LabValues.isString;
                    tempItem.isEnum = item.LabValues.isEnum;
                }

                if (item.dateRange !== undefined) {
                    if (item.dateRange.start !== undefined && item.dateRange.start !== "")
                    {
                        tempItem.dateFrom = funcTranslateDate(new Date(item.dateRange.start));
                        tempItem.hasDate = true;
                    }
                    if (item.dateRange.end !== undefined && item.dateRange.end !== ""){
                        tempItem.dateTo = funcTranslateDate(new Date(item.dateRange.end));
                        tempItem.hasDate = true;
                    }
                }
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
}


console.timeEnd('execute time');
console.groupEnd();
