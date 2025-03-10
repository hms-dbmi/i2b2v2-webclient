i2b2.CRC.view.QueryReport = {
    queryData: {
        queryInstanceId: null,
        queryResultSet: []
    },
    disDiv: null,
    hasZeroPatients: null,
    breakdowns: null,
    dataExport: null,
    displayQueryResults: function(queryInstanceId, div) {
        this.breakdowns  = {
            resultTable: [],
            patientCount: {}
        };
        this.dataExport  = {
            resultTable: [],
        };
        this.hasZeroPatients = false;

        i2b2.CRC.view.QueryReport.disDiv = div;
        let view = this.disDiv;
        $(view).empty();
        let dataExportResultData = $('<div id="infoQueryDataExportTable"></div>').empty();
        $(view).append(dataExportResultData);
        let graphData = $('<div id="infoQueryStatusGraph"></div>').empty();
        $(view).append(graphData);
        let tableData = $('<div id="infoQueryStatusTable"></div>').empty();
        $(view).append(tableData);
        $((Handlebars.compile("{{> QueryResultBreakdownGraph}}"))()).appendTo(graphData);
        i2b2.CRC.view.QueryReport.QRS = {};

        let scopedCallbackQRS = new i2b2_scopedCallback(this._handleQueryResultSet);
        i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("CRC:QueryReport", {qi_key_value: queryInstanceId}, scopedCallbackQRS);
    },
    loadQueryResultSetInstance: function() {
        for (let i in i2b2.CRC.view.QueryReport.QRS) {
            let rec = i2b2.CRC.view.QueryReport.QRS[i];
            if (rec.QRS_DisplayType === "CATNUM") {
                let scopedCallbackQRSI = new i2b2_scopedCallback(this._handleQueryResultInstance);
                i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryResultInstanceId("CRC:QueryReport", {qr_key_value: rec.QRS_ID}, scopedCallbackQRSI);
            } else if ((rec.QRS_DisplayType === "LIST")) {
                //----i2b2.CRC.view.QS.dispDIV.innerHTML += "<div style=\"clear: both; padding-top: 10px; font-weight: bold;\">" + rec.QRS_Description + "</div>";
            }

            if (rec.QRS_Type === "PATIENTSET") {
                let selectedResultTypes = $('body #crcModal .chkQueryType:checked').map((idx, rec) => {
                    let resultType = $(rec).parent().text().trim();
                    // uncheck the timeline result type option
                    // so timeline will not be loaded on query reload
                    if (resultType === 'Timeline') $(rec).prop( "checked", false );
                    return resultType;
                }).toArray();
                if (rec.size > 0 && selectedResultTypes.includes('Timeline') ) {
                    //rec.QM_id = i2b2.CRC.ctrlr.QS.QM.id;
                    rec.QI_id = this.queryData.queryInstanceId;
                    rec.PRS_id = rec.QRS_ID;
                    rec.result_instance_id = rec.PRS_id;
                    let sdxData = {};
                    sdxData[0] = i2b2.sdx.Master.EncapsulateData('PRS', rec);

                    let concepts = [];
                    i2b2.CRC.model.query.groups.forEach(group => {
                        group.events.forEach(event => {
                            concepts = concepts.concat(event.concepts);
                        });
                    });
                    let initializationData = {};
                    initializationData.patientSet = sdxData;
                    initializationData.concepts = concepts;
                    i2b2.PLUGIN.view.list.loadPlugin("Timeline", initializationData);
                }
            }
        }

        i2b2.CRC.view.QueryReport.render({
            breakdowns: i2b2.CRC.view.QueryReport.breakdowns,
            dataExport: i2b2.CRC.view.QueryReport.dataExport
        });

    },
    _handleQueryResultInstance: function(results){
        if (results.error) {
            alert(results.errorMsg);
            return;
        } else {
            // find our query instance
            let ri_list = results.refXML.getElementsByTagName('query_result_instance');
            let l = ri_list.length;
            let description = "";  // Query Report BG
            let breakdown = {
                title: null,
                result: []
            };

            let resultType = "";
            let descriptionShort;
            let descriptionLong;
            let visualAttr = "";
            let status = "";
            for (let i = 0; i < l; i++) {
                let temp = ri_list[i];
                resultType = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/name')[0].firstChild.nodeValue;
                breakdown.type = resultType;
                visualAttr = i2b2.h.XPath(ri_list[0], 'descendant-or-self::query_result_type/visual_attribute_type')[0].firstChild.nodeValue;
                // get the query name for display in the box
                descriptionShort = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/description')[0].firstChild.nodeValue;
                descriptionLong = i2b2.h.XPath(temp, 'descendant-or-self::description')[0].firstChild.nodeValue;
                // get the error status
                status = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
            }
            const isPatientCount = ["PATIENT_COUNT_XML","PATIENT_COUNT_SHRINE_XML"].includes(breakdown.type);
            const isShrine = (resultType.indexOf("_SHRINE_") > -1);

            let crc_xml = results.refXML.getElementsByTagName('crc_xml_result');
            l = crc_xml.length;
            for (let i = 0; i < l; i++) {
                let temp = crc_xml[i];
                let xml_value = i2b2.h.XPath(temp, 'descendant-or-self::xml_value')[0].firstChild.nodeValue;
                let xml_v = i2b2.h.parseXml(xml_value);
                // process "normal" data
                let params = i2b2.h.XPath(xml_v, 'descendant::data[@column]/text()/..');
                // short circuit exit because there is no data
console.log(status + "\t\tColumns:" + params.length + "\t\t" +breakdown.type);
                if (params.length === 0) return;
                for (let i2 = 0; i2 < params.length; i2++) {
                    let entryRecord = {}
                    entryRecord.name = params[i2].getAttribute("column");
                    entryRecord.value = params[i2].firstChild.nodeValue;

                    if (i2b2.PM.model.isObfuscated) {
                        const nodeValue = parseInt(params[i2].firstChild.nodeValue);
                        if (!isNaN(nodeValue) && nodeValue < 4) {
                            entryRecord.display = "< " + i2b2.UI.cfg.obfuscatedDisplayNumber.toString();
                        }
                        if (isNaN(nodeValue) || entryRecord.name === 'QueryMasterID') {
                            entryRecord.display = params[i2].firstChild.nodeValue;
                        } else {
                            entryRecord.display = params[i2].firstChild.nodeValue + "±" + i2b2.UI.cfg.obfuscatedDisplayNumber.toString();
                        }
                    }
                    if (i2b2.UI.cfg.useFloorThreshold) {
                        if (params[i2].firstChild.nodeValue < i2b2.UI.cfg.floorThresholdNumber) {
                            entryRecord.display = i2b2.UI.cfg.floorThresholdText + i2b2.UI.cfg.floorThresholdNumber.toString();
                        }
                    }
                    // N.Benik - Override the display value if specified by server setting the "display" attribute
                    if (typeof params[i2].attributes.display !== 'undefined') {
                        entryRecord.value = i2b2.h.Unescape(entryRecord.value);
                        entryRecord.display = params[i2].attributes.display.textContent;
                    }

                    // TODO: What is this next block for? Remove this or refactor it?
                    if (typeof params[i2].attributes.comment !== 'undefined') {
                        entryRecord.display += ' &nbsp; <span style="color:#090;">[' + params[i2].attributes.comment.textContent + ']<span>';
                    }

                    // handle errors
                    breakdown.status = status;
                    if (status === "ERROR") breakdown.statusMessage = "ERROR";

                    if (params[i2].getAttribute("column") === 'patient_count' && !(visualAttr === 'LR' || visualAttr === 'LX')) {
                        i2b2.CRC.view.QueryReport.breakdowns.patientCount.title = descriptionShort;
                        i2b2.CRC.view.QueryReport.breakdowns.patientCount.value = entryRecord.display ? entryRecord.display : entryRecord.value;
                    }
                    breakdown.title = descriptionShort;
                    breakdown.description = descriptionLong;
                    breakdown.visualAttr = visualAttr;
                    breakdown.result.push(entryRecord);
                }

                // process "SHRINE" data
                let ShrineNode = i2b2.h.XPath(xml_v, 'descendant::SHRINE');
                if (ShrineNode.length) {
                    let ShrineData = {
                        complete: ShrineNode[0].getAttribute('complete'),
                        error: ShrineNode[0].getAttribute('error'),
                        sites: []
                    };
                    for (let site of i2b2.h.XPath(ShrineNode[0], "site")) {
                        let siteData = {};
                        // deal with attributes
                        for (let attrib of site.attributes) {
                            siteData[attrib.name] = attrib.value;
                        }
                        // deal with site data
                        let siteResults = i2b2.h.XPath(site, "siteresult")
                        if (siteResults.length) {
                            siteData.results = [];
                            for (let siteresult of siteResults) {
                                siteData.results.push({
                                    name: $('<div>').html(siteresult.getAttribute('column')).text(),
                                    value: parseInt(siteresult.textContent)
                                });
                            }
                        }
                        ShrineData.sites.push(siteData);
                    }
                    breakdown.SHRINE = ShrineData;
                }
                // render the site counts if they exist
                if (resultType === "PATIENT_SITE_COUNT_SHRINE_XML") {
                    $("#ShrineTitle").show();
                    let trgt = $("#ShrineSites");
                    trgt.hide();
                    trgt.empty();
                    trgt.append("<thead><th>Site</th><th>Status</th></thead>");
                    for (let site of breakdown.SHRINE.sites) {
                        let name = site.name;
                        switch (site.status.toLowerCase()) {
                            case "completed":
                                let cnt = breakdown.result.filter((r) => r.name === name);
                                let result = 0;
                                if (cnt.length > 0) {
                                    if (cnt[0].display) {
                                        result = cnt[0].display;
                                    } else {
                                        result = cnt[0].value;
                                        if (parseInt(result) < parseInt(site.threshold)) {
                                            result = "<" + site.threshold;
                                        } else if (parseInt(site.round) > 0) {
                                            result = result + " ± " + site.round;
                                        }
                                    }
                                }
                                trgt.append(`<tr><td>${name}</td><td>${result} patients</td></tr>`);
                                break;
                            case "error":
                                trgt.append(`<tr><td>${name}</td><td class="error" title="Error code 12345">Site Error</td></tr>`);
                                break;
                            default:
                                trgt.append(`<tr><td>${name}</td><td>Processing...</td></tr>`);
                        }
                    }
                    trgt.show();
                }

                if (isPatientCount) {
                    i2b2.CRC.view.QueryReport.breakdowns.resultTable.unshift(breakdown);
                    // update the display with SHRINE info if it is present
                    if (breakdown.SHRINE) {
                        let siteCnt = parseInt(breakdown.SHRINE.complete) + parseInt(breakdown.SHRINE.error);
                        if (breakdown.result && breakdown.result.length > 1) {
                            let ptCnt = breakdown.result[0].value;
                            $('#patientCountLine3').text(siteCnt + " sites reporting up to " + ptCnt + " patients");
                        }
                    }
                } else if(visualAttr === 'LR' || visualAttr === 'LX') {
                    i2b2.CRC.view.QueryReport.dataExport.resultTable.push(breakdown);
                } else {
                    i2b2.CRC.view.QueryReport.breakdowns.resultTable.push(breakdown);
                }
            }

            let isZeroPatients =  parseInt(i2b2.CRC.view.QueryReport.breakdowns.patientCount.value || -1) === 0;
            i2b2.CRC.view.QueryReport.hasZeroPatients = isZeroPatients;
            // only create graphs if there is breakdown data
            if (!isPatientCount && !isZeroPatients  && !(visualAttr === 'LR' || visualAttr === 'LX') && status !== "ERROR" && ["COMPLETED","FINISHED","INCOMPLETE"].includes(status)) {
                i2b2.CRC.view.graphs.createGraph("breakdownChartsBody", breakdown, i2b2.CRC.view.QueryReport.breakdowns.length);
            }
        }
        // render the table view of the breakdowns
        i2b2.CRC.view.QueryReport.render({
            breakdowns: i2b2.CRC.view.QueryReport.breakdowns,
            dataExport: i2b2.CRC.view.QueryReport.dataExport
        });

        // See how many non-errored graphs do we have (minus the patient count(s))
        let showGraphs = !i2b2.CRC.view.QueryReport.hasZeroPatients
            && i2b2.CRC.view.QueryReport.breakdowns.resultTable.length > 1
            && i2b2.CRC.view.QueryReport.breakdowns.resultTable.map(a => a.status !== 'ERROR' && !["PATIENT_COUNT_XML","PATIENT_COUNT_SHRINE_XML","PATIENT_SITE_COUNT_SHRINE_XML"].includes(a.type)).reduce((b,c) => b ? b : b || c);
        // hide graph section if there are no graphs
        if (!showGraphs) {
            $('#infoQueryStatusGraph').hide();
        } else {
            $('#infoQueryStatusGraph').show();
        }
    },
    _handleQueryResultSet: function(results) {
        // callback processor to check the Query Result Set
            if (results.error) {
                alert(results.errorMsg);
                return;
            } else {
                // find our query instance
                let qrs_list = results.refXML.getElementsByTagName('query_result_instance');
                let l = qrs_list.length;
                for (let i = 0; i < l; i++) {
                    let rec = new Object();
                    let temp = qrs_list[i];
                    let qrs_id = i2b2.h.XPath(temp, 'descendant-or-self::result_instance_id')[0].firstChild.nodeValue;
                    if (i2b2.CRC.view.QueryReport.QRS.hasOwnProperty(qrs_id)) {
                        rec = i2b2.CRC.view.QueryReport.QRS[qrs_id];
                    } else {
                        rec.QRS_ID = qrs_id;
                        rec.size = i2b2.h.getXNodeVal(temp, 'set_size');
                        rec.start_date = i2b2.h.getXNodeVal(temp, 'start_date');
                        if (rec.start_date !== undefined) {
                            rec.start_date =  new Date(rec.start_date.substring(0,4), rec.start_date.substring(5,7)-1, rec.start_date.substring(8,10), rec.start_date.substring(11,13),rec.start_date.substring(14,16),rec.start_date.substring(17,19),rec.start_date.substring(20,23));
                        }
                        rec.end_date = i2b2.h.getXNodeVal(temp, 'end_date');
                        if (rec.end_date !== undefined) {
                            rec.end_date =  new Date(rec.end_date.substring(0,4), rec.end_date.substring(5,7)-1, rec.end_date.substring(8,10), rec.end_date.substring(11,13),rec.end_date.substring(14,16),rec.end_date.substring(17,19),rec.end_date.substring(20,23));
                        }
                        rec.QRS_DisplayType = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/display_type')[0].firstChild.nodeValue;
                        rec.QRS_Description = i2b2.h.XPath(temp, 'descendant-or-self::description')[0].firstChild.nodeValue;
                        rec.QRS_TypeID = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/result_type_id')[0].firstChild.nodeValue;
                        rec.QRS_Type = i2b2.h.XPath(temp, 'descendant-or-self::query_result_type/name')[0].firstChild.nodeValue;
                        if (rec.QRS_Type.indexOf("_SHRINE_") > -1) {
                            rec.isShrine = true;
                        } else {
                            rec.isShrine = false;
                        }
                        // I2B2UI-759: Show admins/power-users the amount of time the server worked on running the query
                        console.log('Compute time on server was ' + ((rec.end_date - rec.start_date) / 1000).toFixed(1) + ' seconds for `' + rec.QRS_Description + '`');
                    }
                    rec.QRS_Status = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
                    rec.QRS_Status_ID = i2b2.h.XPath(temp, 'descendant-or-self::query_status_type/status_type_id')[0].firstChild.nodeValue;

                    // set the proper title if it was not already set
                    if (!rec.title) {
                        rec.title =  i2b2.CRC.view.QueryReport._getTitle(rec.QRS_Type, rec, temp);
                    }
                    i2b2.CRC.view.QueryReport.QRS[qrs_id] = rec;
                }
            }
            // force redraw
            i2b2.CRC.view.QueryReport.loadQueryResultSetInstance();
    },
    render: function(allBreakdowns) {
        let view = this.disDiv[0];
        let scrollPosition = view.offsetTop;

        let tableData = $("#infoQueryStatusTable").show().empty();
        $((Handlebars.compile("{{> QueryResult}}"))(allBreakdowns)).appendTo(tableData);
        let dataExportResult = $("#infoQueryDataExportTable").show().empty();
        $((Handlebars.compile("{{> QueryDataExportResult}}"))(allBreakdowns)).appendTo(dataExportResult);

        view.offsetParent.scrollTo({top:scrollPosition});
    },
    _getTitle:  function(resultType, oRecord, oXML) {
        let title = "";
        switch (resultType) {
            case "PATIENT_ENCOUNTER_SET":
                // use given title if it exists otherwise generate a title
                let t = null;
                try {
                    t = i2b2.h.XPath(oXML,'self::query_result_instance/description')[0].firstChild.nodeValue;
                } catch(e) {}
                if (!t) { t = "Encounter Set"; }
                // create the title using shrine setting
                if (oRecord.size >= 10) {
                    if (i2b2.PM.model.isObfuscated) {
                        title = t+" - "+oRecord.size + "±" + i2b2.UI.cfg.obfuscatedDisplayNumber.toString()+" encounters";
                    } else {
                        title = t;
                    }
                } else {
                    if (i2b2.PM.model.isObfuscated) {
                        title = t+" - 10 encounters or less";
                    } else {
                        title = t;
                    }
                }
                break;
            case "PATIENTSET":
                // use given title if it exist otherwise generate a title
                let p = null;
                try {
                    p = i2b2.h.XPath(oXML,'self::query_result_instance/description')[0].firstChild.nodeValue;
                } catch(e) {}
                if (!p) { p = "Patient Set"; }
                // create the title using shrine setting
                if (oRecord.size >= 10) {
                    if (i2b2.PM.model.isObfuscated) {
                        title = p+" - "+oRecord.size + "±" + i2b2.UI.cfg.obfuscatedDisplayNumber.toString()+" patients";
                    } else {
                        title = p;
                    }
                } else {
                    if (i2b2.PM.model.isObfuscated) {
                        title = p+" - 10 patients or less";
                    } else {
                        title = p; //+" - "+oRecord.size+" patients";
                    }
                }
                break;
            case "PATIENT_COUNT_XML":
            case "PATIENT_COUNT_SHRINE_XML":
                // use given title if it exists otherwise generate a title
                let x = null;
                try {
                    x = i2b2.h.XPath(oXML,'self::query_result_instance/description')[0].firstChild.nodeValue;
                } catch(e) {
                }
                if (!x) { x="Patient Count"; }
                // create the title using shrine setting
                if (oRecord.size >= 10) {
                    if (i2b2.PM.model.isObfuscated) {
                        title = x+" - "+oRecord.size + "±" + i2b2.UI.cfg.obfuscatedDisplayNumber.toString()+" patients";
                    } else {
                        title = x+" - "+oRecord.size+" patients";
                    }
                } else {
                    if (i2b2.PM.model.isObfuscated) {
                        title = x+" - 10 patients or less";
                    } else {
                        title = x+" - "+oRecord.size+" patients";
                    }
                }
                break;
            default :
                try {
                    title = i2b2.h.XPath(oXML,'self::query_result_instance/query_result_type/description')[0].firstChild.nodeValue;
                } catch(e) {
                }
                break;
        }

        return title;
    }
};