i2b2.CRC.QueryReport = {
    baseURL: "js-i2b2/cells/CRC/QueryReport/",
    templates: {}
};

// =====================================================================================================================
i2b2.CRC.QueryReport.show = () => {
    // load the modal window if needed
    let queryReportModal = $('body #queryReportModal');
    if (queryReportModal.length === 0) {
        queryReportModal = $("<div id='queryReportModal'/>").appendTo("body");
        $.ajax("js-i2b2/cells/CRC/QueryReport/QueryReportModal.html", {
            success: (content) => {
                queryReportModal.html(content);

                // Attach print function
                const reportWindow = $('#queryReportWindow')[0].contentWindow;
                $('#queryReportModal button.print').on('click', () => {
                    // automatically hide the preview modal
                    $('#queryReportModal .modal').modal('hide');
                    // print the document
                    reportWindow.print();
                });
                queueMicrotask(i2b2.CRC.QueryReport.generateReport);
            },
            error: () => {
                alert("Error: cannot load report template!");
            }
        });
    } else {
        queueMicrotask(i2b2.CRC.QueryReport.generateReport);
    }
};

// =====================================================================================================================
i2b2.CRC.QueryReport.generateReport = () => {
    // get name of user who ran the query
    let submittedByUsername;
    if (i2b2.CRC.view.QT.queryResponse) {
        // get username from a reloaded query
        submittedByUsername = i2b2.h.XPath(i2b2.CRC.view.QT.queryResponse, "//query_master/user_id/text()")[0].nodeValue;
    } else {
        // this is a query that we have just run so we are the user that ran it
        submittedByUsername = i2b2.PM.model.login_username;
    }

    // create lookup dictionaries for concepts/modifiers
    let concepts = {};
    let modifiers = {};
    i2b2.CRC.model.query.groups.forEach((group) => {
        group.events.forEach((event) => {
            event.concepts.forEach((concept) => {
                if (concept.origData.conceptModified) {
                    let conceptKey = concept.origData.conceptModified.sdxInfo.sdxKeyValue + "-" + concept.origData.conceptModified.sdxInfo.sdxDisplayName;
                    if (!modifiers[conceptKey]) modifiers[conceptKey] = {};
                    modifiers[conceptKey][concept.origData.key] = concept;
                } else {
                    let conceptKey = concept.sdxInfo.sdxKeyValue;
                    if(concept.origData.synonym_cd === "Y") {
                        conceptKey = concept.sdxInfo.sdxKeyValue + "-" + concept.sdxInfo.sdxDisplayName;
                    }
                    concepts[conceptKey] = concept;
                }
            });
        });
    });

    // function for expanding the panel items
    let func_expandConcept = function(panelItem, panel) {
        if (panelItem.key.indexOf(':') !== -1 && panelItem.key.substr(0,2) !== "\\\\") {
            // panel item is special item such as "query_master:123"
            // ignore keys that start with "\\\\" as some lab values include a ":" in their key path
            let sdxKey = panelItem.key.substring(panelItem.key.lastIndexOf(':')+1);
            panelItem.moreInfo = concepts[sdxKey];
        } else {
            let sdxKey =i2b2.h.Unescape(panelItem.key);
            let conceptKey = sdxKey;

            if(panelItem.isSynonym === "true" || panelItem.modKey){
                let sdxName = panelItem.name;
                conceptKey = sdxKey + "-" + sdxName;
            }
            if (panelItem.modKey) {
                panelItem.moreInfo = modifiers[conceptKey][panelItem.modKey];
            } else {
                panelItem.moreInfo = concepts[conceptKey];
            }
            // deal with dates
            if (panelItem.moreInfo.dateRange?.start === undefined || panelItem.moreInfo.dateRange?.start === "") {
                panelItem.timingFrom = "earliest date available";
            } else {
                panelItem.timingFrom = (new Date(Date.parse(panelItem.moreInfo.dateRange.start))).toLocaleDateString();
            }
            if (panelItem.moreInfo.dateRange?.end === undefined || panelItem.moreInfo.dateRange?.end === "") {
                panelItem.timingTo = "latest date available";
            } else {
                panelItem.timingTo = (new Date(Date.parse(panelItem.moreInfo.dateRange.end))).toLocaleDateString();
            }
            panelItem.occurs = panel.occursCount;
            panelItem.timing = panel.timing;
        }
    };


    /// expand the panels
    let panels = Object.assign({}, i2b2.CRC.model.transformedQuery.panels);
    panelKeys = Object.keys(panels);
    panelKeys.forEach((panelKey, idx, keys) => {
        if (keys.length > (idx+1)) {
            if (panels[keys[idx+1]].invert == '1') {
                panels[panelKey].next_is_not = true;
            }
        }
        let itemKeys = Object.keys(panels[panelKey].items);
        itemKeys.forEach((itemKey) => {
            let panelItem = panels[panelKey].items[itemKey];
            func_expandConcept(panelItem, panels[panelKey]);
        });
    });

    let reportData = {
        name: i2b2.CRC.model.runner.name,
        submittedAt: i2b2.CRC.model.runner.startTime.toLocaleString().replace(", "," @ "),
        completedAt: i2b2.CRC.model.runner.endTime ? i2b2.CRC.model.runner.endTime.toLocaleString().replace(", "," @ ") : "",
        submittedBy: "USERNAME(" + submittedByUsername + ")",
        hasError: i2b2.CRC.model.runner.hasError,
        runDuration: Number((i2b2.CRC.model.runner.endTime - i2b2.CRC.model.runner.startTime) / 1000).toLocaleString(),
        panels: panels
    };

    // handle lack of populated panels
    if (Object.keys(panels).length === 0) delete reportData.panels;

    // handle events
    reportData.events = i2b2.CRC.model.transformedQuery.subQueries;
    reportData.events.forEach((event, idx) => {
        event.panels.forEach((panel, idx) => {
            panel.items.forEach((item, idx) => {
                func_expandConcept(item, panel);
            });
        });
    });

    // handle event links
    let eventLinks = i2b2.CRC.model.query.groups.filter(group => group.when);
    // there should only be one "when" group
    if (eventLinks.length) {
        reportData.eventLinks = eventLinks[0].eventLinks;
        reportData.eventLinks.forEach((evtlnk, idx) => {
            evtlnk.prevNum = idx + 1;
            evtlnk.nextNum = idx + 2;
        });
    }

    // deal with the temporal constraint description
    switch(i2b2.CRC.model.transformedQuery.queryTiming) {
        case "ANY":
            reportData.temporalMode = "Treat All Groups Independently";
            break;
        case "SAMEVISIT":
            reportData.temporalMode = "Selected groups occur in the same financial encounter";
            break;
        case "SAMEINSTANCENUM":
            reportData.temporalMode = "Items Instance will be the same";
            break;
    }


    // deal with the viz module CSS files
    let stylesheets = [];
    for (let code in i2b2.CRC.QueryStatus.displayComponents) {
        const componentInfo = i2b2.CRC.QueryStatus.displayComponents[code];
        if (componentInfo.CSS && !componentInfo.noReport) stylesheets.push(i2b2.CRC.QueryStatus.baseURL + componentInfo.CSS);
    }
    reportData.stylesheets = stylesheets;

    // determine what visualizations we are going to display
    let visualizations = [];
    // we display in the order defined in the JSON (for configured breakdowns)
    const configuredBreakdownCodes = Object.keys(i2b2.CRC.QueryReport.displayConfig);
    for (let qrsCode of configuredBreakdownCodes) {
        // get the data entry
        let qrsData = Object.values(i2b2.CRC.QueryStatus.model.QRS).filter((x) => x.QRS_Type === qrsCode);
        if (qrsData.length > 0) {
            qrsData = qrsData[0];
            let visualizationGroup = [];
            // we are displaying this breakdown, run through the viz modules
            for (let vizCode in i2b2.CRC.QueryReport.displayConfig[qrsCode]) {
                if (i2b2.CRC.QueryStatus.displayComponents[vizCode] !== undefined) {
                    // valid visualization
                    visualizationGroup.push({
                        "codeViz": vizCode,
                        "codeQRS": qrsCode,
                        "module": i2b2.CRC.QueryStatus.displayComponents[vizCode],
                        "data": qrsData,
                        "config": i2b2.CRC.QueryReport.displayConfig[qrsCode][vizCode]
                    });
                }
            }
            if (visualizationGroup.length > 0) visualizations.push({
                title: visualizationGroup[0].data.title,
                visualizations: visualizationGroup
            });
        }
    }
    // display any non-configured breakdowns not defined in the JSON
    let definedBreakdowns = visualizations.map((x) => x.visualizations[0].codeQRS);
    let todoBreakdowns = Object.values(i2b2.CRC.QueryStatus.model.QRS).filter((x) => !definedBreakdowns.includes(x.QRS_Type) && x.QRS_Type !== 'INTERNAL_SUMMARY');
    let targetVizModules = Object.values(i2b2.CRC.QueryStatus.displayComponents).filter((x) => x.displayForUnregistered === true && x.notInReport !== true).sort((a, b) => (a.displayOrderx || -Infinity) - (b.displayOrder || -Infinity))
    for (let undefinedBreakdown of todoBreakdowns) {
        let visualizationGroup = [];
        // we are displaying this breakdown, run through the viz modules
        for (let vizCode of targetVizModules) {
            // create visualization
            visualizationGroup.push({
                "codeViz": vizCode.componentCode,
                "codeQRS": undefinedBreakdown.QRS_Type,
                "module": vizCode,
                "data": undefinedBreakdown,
                "config": {}
            });
        }
        if (visualizationGroup.length > 0) visualizations.push({
            title: visualizationGroup[0].data.title,
            visualizations: visualizationGroup
        });
    }

    if (visualizations.length > 0) reportData.visualizations = visualizations;

    const reportHtml = i2b2.CRC.QueryReport.templates.queryReport(reportData);
    const reportDocument = $('#queryReportWindow')[0].contentWindow.document;
    reportDocument.open();
    reportDocument.write(reportHtml);
    reportDocument.close();

    // show report
    $("#queryReportModal div:eq(0)").modal('show');

    // now attach and render the visualization modules
    if (reportData.visualizations.length > 0) {
        let targetDivs = Object.values(reportDocument.documentElement.querySelectorAll(".QueryStatusComponent"));
        for (let groupViz of reportData.visualizations) {
            for (let singleViz of groupViz.visualizations) {
                let componentEl = targetDivs.shift();
                // TODO: Implement resize observer
                // i2b2.CRC.QueryReport.resizeObserver.observe(componentEl);
                let componentInstanceObj = {
                    "definition": singleViz.module,
                    "parentDisplayEl": componentEl,
                    "displayEl": componentEl
                }
                // render with frame template
                if (singleViz.module.noFrameTemplate !== true) {
                    // get the reference for the main display div
                    componentInstanceObj["displayEl"]  = componentEl.querySelector(".component-instance-viz");
                    // get the title
                    const refComponentTitle = componentInstanceObj.parentDisplayEl.querySelector(".title");
                    if (refComponentTitle) componentInstanceObj['parentTitleEl'] = refComponentTitle;
                }

                // add class if specified
                if (singleViz.module.class !== undefined) componentInstanceObj["displayEl"].classList.add(singleViz.module.class);

                // instantiate viz modules
                //======================================================================================================
                // handle any advanced configuration
                if (typeof i2b2.CRC.QueryStatus.breakdownConfig[singleViz.codeQRS] === 'object' && typeof i2b2.CRC.QueryStatus.breakdownConfig[singleViz.codeQRS][singleViz.codeViz] === 'object') {
                    componentInstanceObj.advancedConfig = i2b2.CRC.QueryStatus.breakdownConfig[singleViz.codeQRS][singleViz.codeViz];
                }
                // TODO: Add/merge any viz configuration found in ReportConfig.json file

                // instantiate visualization component
                const visualizationInstance = new singleViz.module.implementation(componentInstanceObj, singleViz.data, singleViz.data.data);
                setTimeout(() => {
                    visualizationInstance.show();
                    visualizationInstance.update(singleViz.data.data);
                    visualizationInstance.redraw(componentInstanceObj.displayEl.offsetWidth);
                }, 100);
            }
        }
        console.dir(targetDivs);
    }
};


// =====================================================================================================================
// load and process the configuration file and template
(async function() {
    try {
        // load ReportConfig.json
        let response = await fetch(i2b2.CRC.QueryReport.baseURL + "ReportConfig.json");
        if (!response.ok) throw new Error(`Failed to retreve QueryReport ReportConfig.json file: ${response.status}`);
        const config = await response.json();
        i2b2.CRC.QueryReport.displayConfig = config;

        // load QueryReport template
        response = await fetch(i2b2.CRC.QueryReport.baseURL + "QueryReport.html");
        if (!response.ok) throw new Error(`Failed to retreve QueryReport.html template: ${response.status}`);
        const template = await response.text();
        i2b2.CRC.QueryReport.templates.queryReport = Handlebars.compile(template);


        // ================= handlebars helper to manage rendering of special ModLab option selection(s) ==================
        Handlebars.registerHelper('dataTypeReportHtml', function(sdxConcept, options) {
            if (sdxConcept === undefined) return "";
            // Create a select element
            let result = "";
            const valueMetaDataArr = i2b2.h.XPath(sdxConcept.origData.xmlOrig, "metadataxml/ValueMetadata[string-length(Version)>0]");
            if (valueMetaDataArr.length > 0) {
                let GeneralValueType = i2b2.CRC.ctrlr.labValues.extractDataType(sdxConcept, valueMetaDataArr[0]);
                if (GeneralValueType && i2b2.CRC.view[GeneralValueType] && typeof i2b2.CRC.view[GeneralValueType].reportHtml === 'function') {
                    result = i2b2.CRC.view[GeneralValueType].reportHtml(sdxConcept);
                }
            }
            return result;
        });


    } catch (error) {
        console.error("Failed to initialize QueryStatus engine: ", error);
    }
})();