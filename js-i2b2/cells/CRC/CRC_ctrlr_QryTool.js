/**
 * @projectDescription	Event controller for CRC's Query Tool.
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.QT
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */

i2b2.CRC.ctrlr.QT = new QueryToolController();
function QueryToolController() {

// ================================================================================================== //
    this.clearQuery = function() {
        i2b2.CRC.model.query = {
            name: 'New Query',
            groups: []
        };
    };
    // run the clear the first time to initialize data structures.
    this.clearQuery();


// ================================================================================================== //
    this.doQueryLoad = function(qm_id) {  // function to reload query from Query History or Workspace
        i2b2.CRC.model.runner.isLoading = true;

        // clear existing query
        i2b2.CRC.view.QT.clearAll();

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
            let loadAllModifierInfo = function(queryDef, callback){
                //get details for all modifiers
                let modifierConstraints = i2b2.h.XPath(queryDef, "descendant::constrain_by_modifier");
                let allModRequest=[];
                let modifierInfo = [];
                for (let m=0; m <modifierConstraints.length; m++) {
                    let modifier_applied_path = i2b2.h.getXNodeVal(modifierConstraints[m], 'constrain_by_modifier/applied_path');
                    let modifier_key_value = i2b2.h.getXNodeVal(modifierConstraints[m], 'constrain_by_modifier/modifier_key');
                    allModRequest.push(new Promise((resolve, reject) => {
                        // TODO: We may have a synonym rehydration bug in this location, see bug I2B2UI-381
                        i2b2.ONT.ajax.GetModifierInfo("CRC:QueryTool", {
                            modifier_applied_path: modifier_applied_path,
                            modifier_key_value: modifier_key_value,
                            ont_max_records: 'max="1"',
                            ont_synonym_records: true,
                            ont_hidden_records: true
                        }, (response) => {
                            let c = i2b2.h.XPath(response.refXML, 'descendant::modifier');
                            if (c.length > 0) {
                                modifierInfo[modifier_key_value] = c[0];
                            }
                            resolve();
                        });
                    }));
                }
                Promise.all(allModRequest).then(values => {
                    callback(modifierInfo);
                }, reason => {
                    console.log("Failed to get all modifier details: " + reason);
                });
            }

            let processPanel = function(qp, isWhenPanel, modifierXmlInfo){
                let sdxDataNodeList = [];
                let without = i2b2.h.getXNodeVal(qp,'invert') === "1";
                let occurs = i2b2.h.getXNodeVal(qp,'total_item_occurrences');
                let instances = (1*occurs);
                function reformatDate(date) {
                    let year = date.substring(0,4);
                    let month = date.substring(5,7);
                    let day = date.substring(8,10);
                    return [month,day,year].join("/");
                }

                let metadata = {};
                if(isWhenPanel){
                    metadata.when = isWhenPanel;
                }
                else{
                    metadata.without = without;
                }
                metadata.instances = instances;

                metadata.timing = i2b2.h.getXNodeVal(qp,'panel_timing') || 'ANY';
                let panelFromDate = i2b2.h.getXNodeVal(qp,'panel_date_from');
                if (panelFromDate) {
                    metadata.startDate = reformatDate(panelFromDate);
                }

                let panelToDate = i2b2.h.getXNodeVal(qp,'panel_date_to');
                if (panelToDate) {
                    metadata.endDate = reformatDate(panelToDate);
                }

                let pi = i2b2.h.XPath(qp, 'descendant::item[item_key]');
                for (let i2=0; i2<pi.length; i2++) {
                    let renderOptions = {};

                    // get the item's details from the ONT Cell
                    let ckey = i2b2.h.getXNodeVal(pi[i2],'item_key');

                    // Determine what item this is
                    let sdxDataNode;
                    if (ckey.toLowerCase().startsWith("query_master_id")) {
                        let o = {};
                        o.name = i2b2.h.getXNodeVal(pi[i2],'item_name');
                        o.id = ckey.substring(16);
                        sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM',o);
                        sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                        sdxDataNode.renderData.title = sdxDataNode.renderData.title.replace("(PrevQuery)","<span class='prevquery'>(PrevQuery)</span>");
                    } else if (ckey.toLowerCase().startsWith("masterid")) {
                        let o = {};
                        o.name =i2b2.h.getXNodeVal(pi[i2],'item_name');
                        o.id = ckey.substring(9);
                        sdxDataNode = i2b2.sdx.Master.EncapsulateData('QM',o);
                        sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                        sdxDataNode.renderData.title = sdxDataNode.renderData.title.replace("(PrevQuery)","<span class='prevquery'>(PrevQuery)</span>");
                    } else if (ckey.toLowerCase().startsWith("folder")) {
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
                        sdxDataNode.sdxInfo.sdxDisplayName = i2b2.h.getXNodeVal(pi[i2],"tooltip");
                        sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                        sdxDataNode.renderData.moreDescriptMinor = sdxDataNode.sdxInfo.sdxDisplayName;
                    } else if (ckey.toLowerCase().startsWith("patient_set_enc_id")) {
                        let o = {};
                        o.titleCRC =i2b2.h.getXNodeVal(pi[i2],'item_name');
                        o.PRS_id = ckey.substring(19);
                        o.result_instance_id = o.PRS_id ;
                        sdxDataNode = i2b2.sdx.Master.EncapsulateData('ENS',o);
                        sdxDataNode.sdxInfo.sdxDisplayName = i2b2.h.getXNodeVal(pi[i2],"tooltip");
                        sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                        sdxDataNode.renderData.moreDescriptMinor = sdxDataNode.sdxInfo.sdxDisplayName;
                    } else if (ckey.toLowerCase().startsWith("patient")) {
                        let o = {};
                        o.titleCRC = i2b2.h.getXNodeVal(pi[i2],'item_key');
                        o.patient_id = ckey.substring(13);
                        o.result_instance_id = o.PRS_id ;
                        o.id = ckey;
                        o.title = i2b2.h.getXNodeVal(pi[i2],'tooltip');
                        sdxDataNode = i2b2.sdx.Master.EncapsulateData('PR',o);
                        sdxDataNode.sdxInfo.sdxDisplayName = i2b2.h.getXNodeVal(pi[i2],"tooltip");
                        let subsetPos = sdxDataNode.sdxInfo.sdxDisplayName.indexOf(" [");
                        sdxDataNode.sdxInfo.sdxDisplayName = subsetPos === -1
                            ?  sdxDataNode.sdxInfo.sdxDisplayName : "PATIENT:HIVE:" +  sdxDataNode.sdxInfo.sdxDisplayName.substring(0, subsetPos);
                        sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                    } else {
                        let o = {};
                        o.level = i2b2.h.getXNodeVal(pi[i2],'hlevel');
                        o.name = i2b2.h.getXNodeVal(pi[i2],'item_name');
                        o.tooltip = i2b2.h.getXNodeVal(pi[i2],'tooltip');

                        // nw096 - If string starts with path \\, lookup path in Ontology cell
                        if (o.name.slice(0, 2) === '\\\\') {
                            let results = i2b2.ONT.ajax.GetTermInfo("ONT", {ont_max_records:'max="1"', ont_synonym_records:'false', ont_hidden_records: 'false', concept_key_value: o.name}).parse();
                            if (results.model.length > 0) {
                                o.name = results.model[0].origData.name;
                                o.tooltip = results.model[0].origData.tooltip;
                            }
                        }
                        o.key = i2b2.h.getXNodeVal(pi[i2],'item_key');
                        o.synonym_cd = i2b2.h.getXNodeVal(pi[i2], 'item_is_synonym');
                        if (o.synonym_cd === "true") { // tdw9 bug fix for non-synonym terms showing blue text: HTML rendering checks to see if synonym is "N," not "false"
                            o.synonym_cd = "Y";
                        } else {
                            o.synonym_cd = "N";
                        }
                        o.hasChildren = i2b2.h.getXNodeVal(pi[i2],'item_icon');

                        // build sdx packet
                        sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',o);

                        // Date constraint processing
                        sdxDataNode.dateRange = {};
                        let dateConstraint = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date');
                        if (dateConstraint.length > 0) {
                            let dateStart = i2b2.h.getXNodeVal(i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date')[0], "date_from");
                            if (dateStart !== undefined) {
                                sdxDataNode.dateRange.start = reformatDate(dateStart);
                            }
                            let dateEnd = i2b2.h.getXNodeVal(i2b2.h.XPath(pi[i2], 'descendant::constrain_by_date')[0], "date_to");
                            if (dateEnd !== undefined) {
                                sdxDataNode.dateRange.end = reformatDate(dateEnd);
                            }
                        } else {
                            if (metadata.startDate !== undefined) sdxDataNode.dateRange.start = metadata.startDate;
                            if (metadata.endDate !== undefined) sdxDataNode.dateRange.end = metadata.endDate;
                        }

                        // Lab Values processing
                        let lvd = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_value');

                        //Check whether this is a lab term
                        if ((lvd.length > 0) && (i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier').length === 0)) {
                            sdxDataNode.isLab = true;
                            sdxDataNode.LabValues = i2b2.CRC.ctrlr.QT.parseValueConstraint( lvd );
                        }

                        sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);

                        // parse for modifier
                        if (i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier').length > 0) {
                            // nw096 - If string starts with path \\, lookup path in Ontology cell
                            let modifier_key_value = i2b2.h.getXNodeVal(pi[i2], 'constrain_by_modifier/modifier_key');

                            let options = {}
                            let modSdxDataNode = i2b2.sdx.TypeControllers.CONCPT.MakeObject(modifierXmlInfo[modifier_key_value], true, options);
                            modSdxDataNode.dateRange = sdxDataNode.dateRange;

                            let renderOptions = { icon: i2b2.ONT.model.icons.modifier };
                            renderOptions.title = i2b2.h.getXNodeVal(modifierXmlInfo[modifier_key_value],'name');
                            modSdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                            modSdxDataNode.renderData.cssClassMain = "sdxStyleONT-MODIFIER";
                            let iconAttribs = i2b2.h.getXNodeVal(modifierXmlInfo[modifier_key_value],'visualattributes');
                            if (iconAttribs.substring(0,2) === "RA") {
                                modSdxDataNode.renderData.cssClassMinor = " tvLeaf"
                                modSdxDataNode.renderData.iconImg = i2b2.hive.cfg.urlFramework + 'cells/ONT/assets/' + renderOptions.icon['leaf'];
                                modSdxDataNode.renderData.iconImgExp = modSdxDataNode.renderData.iconImg;
                            }
                            modSdxDataNode.renderData.idDOM = "ONT_TV-" + i2b2.GUID();

                            const valueMetaDataArr = i2b2.h.XPath(modifierXmlInfo[modifier_key_value], "metadataxml/ValueMetadata[string-length(Version)>0]");
                            if (valueMetaDataArr.length > 0) {
                                modSdxDataNode.origData.hasMetadata = true;
                            } else {
                                modSdxDataNode.origData.hasMetadata = false;
                            }

                            modSdxDataNode.origData.conceptModified = sdxDataNode;
                            sdxDataNode = modSdxDataNode;
                            // Mod Values processing
                            let mvd = i2b2.h.XPath(pi[i2], 'descendant::constrain_by_modifier/constrain_by_value');
                            if (mvd.length > 0) {
                                o.LabValues = i2b2.CRC.ctrlr.QT.parseValueConstraint( mvd );
                            }

                            if (o.LabValues) sdxDataNode.LabValues = o.LabValues;
                        } else {
                            i2b2.ONT.ajax.GetTermInfo("ONT", {
                                ont_max_records: 'max="100"',
                                ont_synonym_records: o.synonym_cd,
                                ont_hidden_records: 'false',
                                concept_key_value: o.key
                            }, function (results) {
                                results.parse();
                                // loop through records and find the one with the matching name
                                for (let rec of results.model) {
                                    if (rec.origData.name === o.name) {
                                        let data = results.model[0];
                                        sdxDataNode.origData = data.origData;
                                        if (String(sdxDataNode.origData.table_name).toLowerCase() === "patient_dimension") sdxDataNode.withDates = false;
                                        i2b2.CRC.view.QT.render();
                                        break;
                                    }
                                }
                            });
                        }
                    }
                    sdxDataNodeList.push(sdxDataNode);
                }

                if (sdxDataNodeList.length > 1) {
                    let startDate;
                    let endDate;
                    if (sdxDataNodeList[0].dateRange !== undefined) {
                        startDate = sdxDataNodeList[0].dateRange.start;
                        endDate = sdxDataNodeList[0].dateRange.end;
                    }

                    let matchingSdxNodeDates = sdxDataNodeList.filter(function(sdx) {
                        if (sdx.dateRange !== undefined &&
                            sdx.dateRange.start === startDate
                            && sdx.dateRange.end === endDate) {
                            return true;
                        }

                        return false;
                    });

                    if (matchingSdxNodeDates.length === sdxDataNodeList.length) {
                        metadata.startDate = sdxDataNodeList[0].dateRange.start;
                        metadata.endDate = sdxDataNodeList[0].dateRange.end;
                    }
                }
                return  {
                    panel: sdxDataNodeList,
                    metadata: metadata
                };
            };

            let reloadQuery = function(modifierXmlInfo){
                for (let j = 0; j < qd.length; j++) {
                    if (j === 0) {
                        //handle temporal subquery panels
                        let subqueries = i2b2.h.XPath(qd[j], 'subquery');
                        let subQueryConstraints = i2b2.h.XPath(qd[j], 'subquery_constraint');

                        let temporalGroupIdx = -1;
                        let queryIdToIndex = {};
                        for (let s = 0; s < subqueries.length; s++) {
                            let subquery = subqueries[s];
                            let queryId = i2b2.h.getXNodeVal(subquery, 'query_id');
                            let isWhen = true;
                            if (s === 0) {
                                let subPanel = i2b2.h.XPath(subquery, 'panel');
                                let data = processPanel(subPanel[0], isWhen, modifierXmlInfo);
                                data.metadata.showLabValues = false;
                                temporalGroupIdx = i2b2.CRC.view.QT.addNewQueryGroup(data.panel, data.metadata);
                                queryIdToIndex[queryId] = 0;
                            } else {
                                if (i2b2.CRC.model.query.groups[temporalGroupIdx].events.length <= s) {
                                    i2b2.CRC.model.query.groups[temporalGroupIdx].events.push(i2b2.CRC.view.QT.createEvent());
                                    i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks.push(i2b2.CRC.view.QT.createEventLink());
                                }
                                let subPanel = i2b2.h.XPath(subquery, 'panel');
                                let data = processPanel(subPanel[0], isWhen, modifierXmlInfo);

                                data.panel.forEach((sdx) => {
                                    i2b2.CRC.view.QT.addConcept(sdx, temporalGroupIdx, s, false);
                                });

                                if (data.metadata.startDate !== undefined) {
                                    i2b2.CRC.model.query.groups[temporalGroupIdx].events[s].dateRange.start = data.metadata.startDate;
                                }

                                if (data.metadata.endDate !== undefined) {
                                    i2b2.CRC.model.query.groups[temporalGroupIdx].events[s].dateRange.end = data.metadata.endDate;
                                }
                                queryIdToIndex[queryId] = i2b2.CRC.model.query.groups[temporalGroupIdx].events.length - 1;
                            }
                        }
                        if (temporalGroupIdx !== -1) {
                            for (let s = 0; s < subQueryConstraints.length; s++) {
                                let queryId = i2b2.h.getXNodeVal(subQueryConstraints[s], 'first_query/query_id');
                                let eventLinkIndex = queryIdToIndex[queryId];

                                i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].joinColumn1 = i2b2.h.getXNodeVal(subQueryConstraints[s], 'first_query/join_column');
                                i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].aggregateOp1 = i2b2.h.getXNodeVal(subQueryConstraints[s], 'first_query/aggregate_operator');
                                i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].joinColumn2 = i2b2.h.getXNodeVal(subQueryConstraints[s], 'second_query/join_column');
                                i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].aggregateOp2 = i2b2.h.getXNodeVal(subQueryConstraints[s], 'second_query/aggregate_operator');
                                i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].operator = i2b2.h.XPath(subQueryConstraints[s], 'descendant-or-self::operator/text()')[0].nodeValue;

                                let timeSpans = i2b2.h.XPath(subQueryConstraints[s], 'span');
                                for (let ts = 0; ts < timeSpans.length; ts++) {
                                    i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].timeSpans[ts].operator = i2b2.h.getXNodeVal(timeSpans[ts], 'operator');
                                    i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].timeSpans[ts].value = i2b2.h.getXNodeVal(timeSpans[ts], 'span_value');
                                    i2b2.CRC.model.query.groups[temporalGroupIdx].eventLinks[eventLinkIndex].timeSpans[ts].unit = i2b2.h.getXNodeVal(timeSpans[ts], 'units');
                                }
                            }
                        }

                        let qp = i2b2.h.XPath(qd[j], 'panel');
                        let total_panels = qp.length;
                        for (let i1 = 0; i1 < total_panels; i1++) {
                            let isWhen = false;
                            let data = processPanel(qp[i1], isWhen, modifierXmlInfo);
                            data.metadata.showLabValues = false;
                            i2b2.CRC.view.QT.addNewQueryGroup(data.panel, data.metadata);
                        }
                    }
                    // update the transformed model
                    i2b2.CRC.ctrlr.QueryMgr._processModel();
                    i2b2.CRC.view.QT.render();
                }
            };

            let qd = i2b2.h.XPath(results.refXML, 'descendant::query_name/..');
            if (qd.length !== 0) {
                let queryName = i2b2.h.getXNodeVal(results.refXML, 'name');
                loadAllModifierInfo(qd[0], function(modifierXmlInfo){
                    reloadQuery(modifierXmlInfo);
                    $('.CRC_QT_runbar input.name').attr("placeholder", queryName);
                    i2b2.CRC.ctrlr.QueryMgr.loadQuery(qm_id, queryName);
                });
            }
        }
        // AJAX CALL
        i2b2.CRC.ajax.getRequestXml_fromQueryMasterId("CRC:QueryTool", { qm_key_value: qm_id }, scopedCallback);
    };

// ================================================================================================== //
    // tdw9: parses value constraint in Value Constraints and Modifier Constraints
    this.parseValueConstraint = function( lvd )
    {
        lvd = lvd[0];
        let labValues = {
            ValueType: null,
            ValueOperator: null,
            Value: null,
            ValueFlag: null,
            ValueLow: null,
            ValueHigh: null,
            ValueUnit: null
        };

        let valueConstraint = i2b2.h.getXNodeVal(lvd, "value_constraint");
        labValues.ValueOperator = i2b2.h.getXNodeVal(lvd, "value_operator");
        let rawValueType = i2b2.h.getXNodeVal(lvd, "value_type");
        switch (rawValueType) {
            case "NUMBER":
                if (valueConstraint.indexOf(' and ') !== -1) {
                    // extract high and low labValues
                    valueConstraint = valueConstraint.split(' and ');
                    labValues.ValueLow = valueConstraint[0];
                    labValues.ValueHigh = valueConstraint[1];
                } else {
                    labValues.Value = valueConstraint;
                }
                labValues.ValueType= i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER;
                labValues.ValueUnit = i2b2.h.getXNodeVal(lvd, "value_unit_of_measure");
                break;
            case "STRING":
                labValues.ValueType= i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT;
                labValues.Value = valueConstraint;
                labValues.isString = true;
                break;
            case "LARGETEXT":
                labValues.ValueType= i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.LARGETEXT;
                labValues.Value = valueConstraint;
                labValues.isString = true;
                break;
            case "TEXT":
                // This is an ENUM
                labValues.ValueType= i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT;
                try {
                    labValues.Value = eval("(Array" + valueConstraint + ")");
                    labValues.isEnum = true;
                } catch (e) {
                    //This is a string
                    labValues.ValueOperator = i2b2.h.getXNodeVal(lvd, "value_operator");
                    labValues.Value = valueConstraint;
                    labValues.ValueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT; // tdw9: this line is missing for modifiers in current code. Does it make a different to have it here? Also, "TEXT" is changed from "STRING" to make sure TEXT works in modifiers
                }
                break;
            case "FLAG":
                labValues.ValueType= i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.FLAG;
                labValues.ValueFlag = valueConstraint;
                break;
            default:
                labValues.Value = valueConstraint;
        }
        return labValues;
    };

}
