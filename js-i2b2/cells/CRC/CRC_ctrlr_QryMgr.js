/**
 * @projectDescription	The Asynchronous Query Status controller (GUI-only controller).
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.QueryMgr
 * @author		Nick Benik
 * @version 	1.8
 * ----------------------------------------------------------------------------------------
 */

i2b2.CRC.ctrlr.QueryMgr = {};


// ================================================================================================== //

// ================================================================================================== //
i2b2.CRC.ctrlr.QueryMgr.generateQueryName = function() {
    // generate the initial name for the current query
    i2b2.CRC.ctrlr.QueryMgr._processModel();
    const transformedModel = i2b2.CRC.model.transformedQuery;
    if (transformedModel.panels.length > 0 || transformedModel.subQueries.length > 0) {
        let queryDate = new Date();
        queryDate = String(queryDate.getHours()) + ":" + String(queryDate.getMinutes()) + ":" + String(queryDate.getSeconds());
        let temporalRegex = /^\(t\)/i;

        let names = transformedModel.panels.map((rec)=>{ return rec.items[0].name.replace("(PrevQuery)","").trim().replace("(t)","").trim()});

        // Handle temporal events
        let temporalNames = transformedModel.subQueries.map((subQuery)=>{ return subQuery.panels[0].items[0].name.replace("(PrevQuery)","")
            .trim().replace(temporalRegex,"").trim()});
        names = names.concat(temporalNames);

        let adjuster = 1 / ((names.map((rec) => rec.length ).reduce((acc, val) => acc + val) + names.length - 1) / 120);
        if (adjuster > 1) adjuster = 1;
        names = names.map((rec) => rec.substr(0, Math.floor(rec.length * adjuster)));
        return i2b2.h.Unescape(names.join("-") + "@" + queryDate);
    } else {
        return "";
    }
};


// ================================================================================================== //
i2b2.CRC.ctrlr.QueryMgr.startQuery = function(queryName, queryResultTypes, queryExecution) {
    i2b2.CRC.ctrlr.QueryMgr._processModel();
    i2b2.CRC.model.transformedQuery.name = queryName; // i2b2.h.Escape(queryName);

    let params = {
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

    // query execution method
    if (queryExecutionMethod) {
        params.query_run_method = "<query_method>" + queryExecutionMethod + "</query_method>";
    } else {
        params.query_run_method = "";
    }
    // query definition
    params.psm_query_definition = (Handlebars.compile("{{> Query}}"))(i2b2.CRC.model.transformedQuery);

    // we now have the query XML
    debugger;
    console.dir(params);

    // TODO: Start the execution of the query
    // show run status HTML
    // start run status Timer

};

// ================================================================================================== //
i2b2.CRC.ctrlr.QueryMgr.loadQuery = function(idQueryMaster) {};

// ================================================================================================== //
i2b2.CRC.ctrlr.QueryMgr.stopQuery = function() {};

// ================================================================================================== //
i2b2.CRC.ctrlr.QueryMgr.clearQuery = function() {
    // reset Query History view to default listing
    i2b2.CRC.view.search.reset();
    $("#i2b2TreeviewQueryHistoryFinder").hide();
    $("#i2b2TreeviewQueryHistory").show();

    // clear the query in the query tool
    i2b2.CRC.ctrlr.QT.clearQuery();

    // clear the display window
    $("#infoQueryStatus", cell.view.QryMgr.lm_view).empty();
    $("#infoQueryStatusTable", cell.view.QryMgr.lm_view).empty();
    $("#infoQueryStatusGraph", cell.view.QryMgr.lm_view).hide();

    // next
};





// ================================================================================================== //
i2b2.CRC.ctrlr.QueryMgr._processModel = function() {
    let funcTranslateDate = function(trgtdate) {
        // this does proper setting of the timezone based on the browser's current timezone
        return String(trgtdate.getFullYear())+"-"+String(trgtdate.getMonth()+1).padStart(2, "0")+"-"+String(trgtdate.getDate()).padStart(2, "0")
            +'T00:00:00';
    };

    let createPanelItem = function(item){
        let tempItem = {};
        let name;
        // TODO: how/if we need to handle "<constrain_by_date><date_from/><date_to/></>"
        switch (item.sdxInfo.sdxType) {
            case "PRS":
                tempItem.key = "patient_set_coll_id:" + i2b2.h.Escape(item.sdxInfo.sdxKeyValue);
                name = item.origData.titleCRC ? item.origData.titleCRC : item.origData.title;
                let trimPos = name.lastIndexOf(" - ");
                name = trimPos === -1 ? name : name.substring(0, trimPos);
                tempItem.name = i2b2.h.Escape(name);
                tempItem.tooltip = i2b2.h.Escape(item.origData.title);
                tempItem.isSynonym = "false";
                tempItem.hlevel = 0;
                break;
            case "QM":
                tempItem.key = "masterid:" + i2b2.h.Escape(item.sdxInfo.sdxKeyValue);
                name = item.origData.name;
                name = name.substring(0, name.indexOf(" ", name.lastIndexOf("@")));
                tempItem.name = "(PrevQuery) " + i2b2.h.Escape(name);
                tempItem.tooltip = i2b2.h.Escape(item.origData.name);
                tempItem.isSynonym = "false";
                tempItem.hlevel = 0;
                break;
            case "CONCPT":
                tempItem.key = i2b2.h.Escape(item.sdxInfo.sdxKeyValue);
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

                if (item.origData.isModifier) {
                    tempItem.modName = i2b2.h.Escape(tempItem.name);
                    tempItem.modKey = i2b2.h.Escape(tempItem.key);
                    tempItem.name = i2b2.h.Escape(item.origData.conceptModified.origData.name != null ? item.origData.conceptModified.origData.name : tempItem.name);
                    tempItem.key = i2b2.h.Escape(item.origData.conceptModified.origData.key);
                    tempItem.isModifier = true;
                    tempItem.applied_path = i2b2.h.Escape(item.origData.applied_path);
                    let modParent = item.origData.conceptModified.origData;
                    while (modParent != null) {
                        if (modParent.isModifier) {
                            modParent = modParent.conceptModified;
                        } else {
                            tempItem.level = modParent.level;
                            tempItem.key = i2b2.h.Escape(modParent.key);
                            tempItem.name = i2b2.h.Escape(modParent.name);
                            tempItem.tooltip = i2b2.h.Escape(modParent.tooltip);
                            tempItem.icon = modParent.hasChildren;
                            break;
                        }
                    }
                }

                if (item.LabValues || item.ModValues) {
                    tempItem.valueType = item.LabValues.valueType;
                    tempItem.valueOperator = item.LabValues.valueOperator;
                    tempItem.unitValue= item.LabValues.unitValue;

                    if (item.LabValues.numericValueRangeLow) {
                        tempItem.value = item.LabValues.numericValueRangeLow + " and " + item.LabValues.numericValueRangeHigh;
                    } else if (tempItem.valueType === i2b2.CRC.ctrlr.labValues.VALUE_TYPES.FLAG){
                        tempItem.value = item.LabValues.flagValue;
                    } else {
                        if(Array.isArray(item.LabValues.value)){
                            item.LabValues.value.forEach(element => i2b2.h.Escape(element));
                            tempItem.value = item.LabValues.value;
                        }
                        else{
                            tempItem.value = i2b2.h.Escape(item.LabValues.value);
                        }
                    }
                    tempItem.isString = item.LabValues.isString;
                    tempItem.isEnum = item.LabValues.isEnum;
                }

                if (item.dateRange !== undefined) {
                    if (item.dateRange.start !== undefined && item.dateRange.start !== "") {
                        tempItem.dateFrom = funcTranslateDate(new Date(item.dateRange.start));
                        tempItem.hasDate = true;
                    }
                    if (item.dateRange.end !== undefined && item.dateRange.end !== "") {
                        tempItem.dateTo = funcTranslateDate(new Date(item.dateRange.end));
                        tempItem.hasDate = true;
                    }
                }
                break;
        }

        return tempItem;
    }

    let createPanel = function(panelNumber, invert, occursCount, timing){
        let tempPanel = {};
        tempPanel.number = panelNumber;
        tempPanel.invert = invert ? "1" : "0";
        tempPanel.timing = timing;
        tempPanel.occursCount = occursCount;

        return tempPanel;
    }
    let transformedModel = {};
    transformedModel.name = i2b2.CRC.model.query.name;
    transformedModel.specificity = "0";
    transformedModel.queryTiming = "ANY";
    transformedModel.useShrine = false;
    transformedModel.panels = [];
    transformedModel.subQueries = [];
    for (let qgIdx=0; qgIdx < i2b2.CRC.model.query.groups.length; qgIdx++) {
        let qgData = i2b2.CRC.model.query.groups[qgIdx];
        let invert = qgData.without === true;
        switch (qgData.display) {
            case "when":
                qgData.events.forEach((item, idx) => {
                    let subQuery  = {};
                    subQuery.name = "Event " + String(idx+1);
                    subQuery.id = subQuery.name;
                    subQuery.type= "EVENT";
                    subQuery.timing = "SAMEINSTANCENUM";
                    subQuery.specificity = "0";
                    subQuery.panels = [];
                    let number = String(qgIdx+1);
                    let timing = "SAMEINSTANCENUM";
                    let occursCount = item.instances;
                    let tempPanel = createPanel(number, invert, occursCount, timing);
                    tempPanel.items = [];
                    item.concepts.forEach((item) => {
                        let tempItem = createPanelItem(item);
                        tempPanel.items.push(tempItem);
                    });
                    if (tempPanel.items.length > 0) {
                        subQuery.panels.push(tempPanel);
                        transformedModel.subQueries.push(subQuery);
                    }
                });
                let subQueryConstraints  = [];
                qgData.eventLinks.forEach((link, idx) => {
                    //check if event has terms
                    if(transformedModel.subQueries.length > idx+1) {
                        let constraints = {};
                        constraints.firstQuery = {};
                        constraints.firstQuery.id = transformedModel.subQueries[idx].name;
                        constraints.firstQuery.aggregateOp = link.aggregateOp1;
                        constraints.firstQuery.joinColumn = link.joinColumn1;
                        constraints.operator = link.operator;

                        constraints.secondQuery = {};
                        constraints.secondQuery.id = transformedModel.subQueries[idx + 1].name;
                        constraints.secondQuery.aggregateOp = link.aggregateOp2;
                        constraints.secondQuery.joinColumn = link.joinColumn2;

                        constraints.timeSpans = [];
                        link.timeSpans.forEach((timeSpan) => {
                            if(timeSpan.operator && timeSpan.value && timeSpan.unit
                                && timeSpan.operator.length > 0 && timeSpan.value.length > 0 && timeSpan.unit.length > 0) {
                                constraints.timeSpans.push(timeSpan);
                            }
                        });

                        subQueryConstraints.push(constraints);
                    }
                });

                transformedModel.subQueryConstraints = subQueryConstraints;
                break;
            case "without":
            case "with":
                let number =String(qgIdx+1);
                let timing = qgData.timing;
                let occursCount = qgData.events[0].instances;
                let tempPanel = createPanel(number, invert, occursCount, timing);
                tempPanel.items = [];
                qgData.events[0].concepts.forEach((item) => {
                    let tempItem = createPanelItem(item);
                    tempPanel.items.push(tempItem);
                });
                if (tempPanel.items.length > 0) transformedModel.panels.push(tempPanel);
                break;
        }
    }

    // generate the initial name for query
    transformedModel.name  = "";

    i2b2.CRC.model.transformedQuery = transformedModel;
};




i2b2.CRC.model.runner = {
    name: "",
    definition: null,
    elapsedTime: "0",
    startTime: new Date(),
    status: "Running",
    abortable: true,
    finished: false,
    deleteCurrentQuery: false,
    breakdowns: {},
    intervalTimer: null
};
