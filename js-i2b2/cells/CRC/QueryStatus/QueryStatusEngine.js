
i2b2.CRC.QueryStatus = {
    shortestPollInterval: 5000,
    baseURL: "js-i2b2/cells/CRC/QueryStatus/",
    componentFrameTemplate: false,
    displayComponents: {},
    displayOrder: [],
    currentQueryInstanceId: false,
    displayEl: false,
    resizeObserver: false,
    model: {
        QRS: {},
        visualizations: {}
    },
    advancedConfigurations: {},
    showOnZeroCount: [
        "SUMMARY",
        "COUNT",
        "SHRINESITES"
    ]
};


i2b2.CRC.QueryStatus.clear = function() {
    // remove resize observer
    if (i2b2.CRC.QueryStatus.resizeObserver) i2b2.CRC.QueryStatus.resizeObserver.disconnect();

    // destroy the previous display module instances
    Object.keys(i2b2.CRC.QueryStatus.model.visualizations).forEach((breakdownCode) => {
        const breakdown = i2b2.CRC.QueryStatus.model.visualizations[breakdownCode];
        breakdown.componentInstances.forEach((breakdownVizComponent) => {
            try {
                i2b2.CRC.QueryStatus.resizeObserver.unobserve(breakdownVizComponent.displayEl);
                if (typeof breakdownVizComponent.visualization.destroy === 'function') breakdownVizComponent.visualization.destroy();
                delete breakdownVizComponent.visualization;
            } catch(e) {
                console.warn("QueryStatus: Error while destroying visualization component: " + breakdownCode + ":" + breakdownVizComponent.definition.componentCode);
            }
        });
        // clear the component's element
        let mainEl = i2b2.CRC.QueryStatus.displayEl;
        if (typeof mainEl !== 'undefined') {
            while (mainEl.children.length > 0) mainEl.removeChild(mainEl.children[0]);
        }

        delete i2b2.CRC.QueryStatus.model.visualizations[breakdownCode];
        i2b2.CRC.QueryStatus.model.QRS = {};
    });
};

i2b2.CRC.QueryStatus.start = function(queryInstanceId, mainEl) {
    // restart process only when new query instance id is given
    if (i2b2.CRC.QueryStatus.currentQueryInstanceId !== queryInstanceId) {

        i2b2.CRC.QueryStatus.model.QRS = {};
        if (typeof i2b2.CRC.QueryStatus.model.visualizations === 'undefined') i2b2.CRC.QueryStatus.model.visualizations = {};

        if (mainEl) {
            i2b2.CRC.QueryStatus.displayEl = mainEl;
            i2b2.CRC.QueryStatus.clear();
        }

        // setup resize observer engine
        if (!i2b2.CRC.QueryStatus.resizeObserver) {
            const resizeObvs = new ResizeObserver((entries) => {
                // This is the visualization component resize handler calling routine
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    if (width > 0) {
                        // only do a resize for visible components
                        Object.values(i2b2.CRC.QueryStatus.model.visualizations).forEach((viz) => {
                            viz.componentInstances.forEach((vizComponent) => {
                                if (vizComponent.displayEl === entry.target) vizComponent.visualization.redraw(width);
                            });
                        });
                    }
                }
            });
            i2b2.CRC.QueryStatus.resizeObserver = resizeObvs;
        }

        // generate and update internal records for Query Summary viz module
        i2b2.CRC.QueryStatus.updateFromQueryMgr();

        // instantiate visualization the Query Summary module
        i2b2.CRC.QueryStatus.createVisualizationsFromList(i2b2.CRC.QueryStatus.model.QRS);

        // make call to get list of QRS from passed Query Instance
        const scopedCallbackQRS = new i2b2_scopedCallback(i2b2.CRC.QueryStatus._handleQueryResultSet);
        i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("CRC:QueryStatus", {qi_key_value: queryInstanceId}, scopedCallbackQRS);
    }
}

i2b2.CRC.QueryStatus.componentDropdownClickHandler = (e) => {
    const selectEl = e.currentTarget;
    if (selectEl.classList.contains("show")) {
        selectEl.classList.remove("show");
        const componentDropEl = e.target.closest("li");
        for (const vizKey of Object.keys(i2b2.CRC.QueryStatus.model.visualizations)) {
            let vizComponent = i2b2.CRC.QueryStatus.model.visualizations[vizKey].componentInstances[0];
            if (vizComponent !== undefined && vizComponent.dropdownEl) {
                // only process if the first component has the correct parent selector of the clicked selection
                const selectRootEl = vizComponent.dropdownEl.closest('.viz-dropdown-select');
                if (selectRootEl === selectEl) {
                    // we are dealing with the correct visualization group
                    let previouslySelectedComponent = i2b2.CRC.QueryStatus.model.visualizations[vizKey].componentInstances.filter((a) => a.visualization.isVisible);

                    const filterSelectByDrop = function(component, invert) {
                        let ret;
                        if (invert) {
                            invert = true;
                        } else {
                            invert = false;
                        }
                        if (component.dropdownEl === componentDropEl) {
                            return true ^ !invert;
                        } else {
                            return false ^ !invert;
                        }
                    }

                    let componentsToHide = i2b2.CRC.QueryStatus.model.visualizations[vizKey].componentInstances.filter((a) => filterSelectByDrop(a, false));
                    let componentToShow = i2b2.CRC.QueryStatus.model.visualizations[vizKey].componentInstances.filter((a) => filterSelectByDrop(a, true));
                    if (componentToShow.length) {
                        componentToShow = componentToShow[0];
                        if (componentToShow.visualization.show()) {
                            // deal with the resizing the height of the parent div
                            const dispWindow = componentToShow.parentDisplayEl.querySelector(".viz-window");
                            dispWindow.style.height = componentToShow.displayEl.offsetHeight + "px";

                            // success in showing component, hide the other visualiztion components
                            componentsToHide.forEach((a) => { a.visualization.hide(); });
                        }
                    } else {
                        console.error("No visualization component is associated with the selected dropdown element!");
                    }
                    break;
                }
            }
        }
    } else {
        selectEl.classList.add("show");
    }
}



i2b2.CRC.QueryStatus.updateFromQueryMgr = function() {
    // pull information from the Query Manager into the Query Status's internal record
    let QueryMgrRecord = { "QRS_Type": "INTERNAL_SUMMARY" };
    const refQueryMgrData = i2b2.CRC.model.runner;

    let params = [
        "name",
        "startTime",
        "endTime",
        "elapsedTime",
        "finished",
        "abortable",
        "queued",
        "isCancelled",
        "isPolling",
        "isRunning",
        "hasError",
        "deleteCurrentQuery"
    ];
    for (let param of params) {
        if (refQueryMgrData[param] !== undefined) QueryMgrRecord[param] = refQueryMgrData[param];
    }
    i2b2.CRC.QueryStatus.model.QRS["INTERNAL_SUMMARY"] = QueryMgrRecord;

    // cause an update of the display modules
    if (typeof i2b2.CRC.QueryStatus.model.visualizations["INTERNAL_SUMMARY"] !== 'undefined') {
        for (let viz of i2b2.CRC.QueryStatus.model.visualizations["INTERNAL_SUMMARY"].componentInstances) {
            if (typeof viz.visualization !== 'undefined') viz.visualization.update(QueryMgrRecord);
        }
    }
}



i2b2.CRC.QueryStatus.createVisualizationsFromList = function() {
    // -------------------------------------------------------------------------------------------------------------
    // format data and instantiate the visualization components for each QRS
    // -------------------------------------------------------------------------------------------------------------

    let qrs_entries = {};
    let qrsCodesFound = Object.keys(i2b2.CRC.QueryStatus.model.QRS).map((a) => i2b2.CRC.QueryStatus.model.QRS[a].QRS_Type);

    // find the expressly display-ranked results set(s)
    let currentIndex = 0;
    for (let codeRank of i2b2.CRC.QueryStatus.displayOrder) {
        if (qrs_entries[codeRank] === undefined && qrsCodesFound.includes(codeRank)) {
            qrs_entries[codeRank] = {"displayRank": currentIndex};
            currentIndex++;
        }
    }

    // remove the placed codes from the working list
    let codesToRemove = Object.keys(qrs_entries);
    qrsCodesFound = qrsCodesFound.filter((code) => {
        return !codesToRemove.includes(code);
    });
    qrsCodesFound.sort();
    for (let codeInstance of qrsCodesFound) {
        // create the initial record with display rank
        qrs_entries[codeInstance] = {"displayRank": currentIndex};
        currentIndex++;
    }

    // link record data into the component entries
    Object.keys(qrs_entries).forEach((codeInstance) => {
        // save reference to the underlying QRS (or internally used data)
        const matchingRecord = Object.values(i2b2.CRC.QueryStatus.model.QRS).filter((a) => a.QRS_Type === codeInstance);
        if (matchingRecord.length > 0) qrs_entries[codeInstance].record = matchingRecord[0];
    });

    // now create the visualization instances
    const componentKeys = Object.keys(i2b2.CRC.QueryStatus.displayComponents);
    const refDisplayComponents = i2b2.CRC.QueryStatus.displayComponents;
    let orderedEntries = Object.keys(qrs_entries);
    orderedEntries.sort((a,b) => qrs_entries[a].displayRank - qrs_entries[b].displayRank);

    // but only for NEW visualizations
    const existingViz = Object.keys(i2b2.CRC.QueryStatus.model.visualizations);
    const newEntries = orderedEntries.filter((a) => !existingViz.includes(a));
    // remove entries that are already placed
    for (let code of Object.keys(qrs_entries)) {
        if (existingViz.includes(code)) delete qrs_entries[code];
    }

    const functInstantiateViz = (qrsCode, componentDefObj, componentInstanceObj, componentIndexNumber = 1) => {
        try {
            // handle any advanced configuration
            if (typeof i2b2.CRC.QueryStatus.breakdownConfig[qrsCode][componentDefObj.componentCode] === 'object') {
                componentInstanceObj.advancedConfig = i2b2.CRC.QueryStatus.breakdownConfig[qrsCode][componentDefObj.componentCode];
            }

            // record a reference to the QRS record information
            let qrsObject = i2b2.CRC.QueryStatus.model.QRS[qrsCode];
            const qrsRecordKey = Object.keys(i2b2.CRC.QueryStatus.model.QRS).filter((key) => i2b2.CRC.QueryStatus.model.QRS[key].QRS_Type === qrsCode);
            if (qrsRecordKey.length > 0) {
                qrsObject = i2b2.CRC.QueryStatus.model.QRS[qrsRecordKey];
            }

            // instantiate visualization component
            const visualizationInstance = new componentDefObj.implementation(componentInstanceObj, qrsObject, null);
            componentInstanceObj.visualization = visualizationInstance;
            if (componentIndexNumber === 1) {
                visualizationInstance.show();
                // deal with the resizing the height of the parent div
                let dispWindow = componentInstanceObj.parentDisplayEl.querySelector(".viz-window");
                if (dispWindow !== null) {
                    dispWindow.style.transition = 'none';
                    dispWindow.style.height = componentInstanceObj.displayEl.offsetHeight + "px";
                    setTimeout(()=> dispWindow.style.transition = '', 10);
                }
                // display the dropdown entry if relevant
                if (componentInstanceObj.dropdownEl) componentInstanceObj.dropdownEl.style.display = '';
            } else {
                visualizationInstance.hide();
                if (componentInstanceObj.dropdownEl) componentInstanceObj.dropdownEl.style.display = 'none';
            }

            return componentInstanceObj;
        } catch (e) {
            return false;
        }
    };


    for (let code of newEntries) {
        qrs_entries[code].componentInstances = [];

        // create a list of references to QRS's valid visualizations
//        let validComponents = componentKeys.filter((k) => refDisplayComponents[k].results.includes(code)).map((b) => refDisplayComponents[b]);
        let validComponents = componentKeys.filter((k) => {
            if (typeof i2b2.CRC.QueryStatus.breakdownConfig[code] !== 'undefined') {
                return (Object.keys(i2b2.CRC.QueryStatus.breakdownConfig[code]).includes(k) && i2b2.CRC.QueryStatus.breakdownConfig[code][k] !== false);
            } else {
                return false;
            }
        }).map((b) => refDisplayComponents[b]);

        if (validComponents.length === 0) {
            // short circuit if no components are configured
            continue;
        }

        // sort by component displayOrder
        validComponents.sort((a, b) => {
            let av = a.displayOrder;
            let bv = b.displayOrder;
            if (av === undefined) av = 50;
            if (bv === undefined) bv = 50;
            return av - bv;
        });

        // check for exclusive component in the list that matches the QRS type
        let exclusiveComponent = validComponents.filter((a) => a.noFrameTemplate === true);
        if (exclusiveComponent.length > 0) {
            // there is an exclusive component that will override our default multi-component template
            exclusiveComponent = exclusiveComponent[0];
            // create the frameless display div
            const componentEl = document.createElement("div");
            componentEl.classList.add("QueryStatusComponent", "frameless", "viz-window", "resulttype-" + code, "viztype-" + exclusiveComponent.componentCode);
            if (exclusiveComponent.class !== undefined) componentEl.classList.add(exclusiveComponent.class);
            componentEl.style.display = 'none';
            i2b2.CRC.QueryStatus.displayEl.appendChild(componentEl);
            i2b2.CRC.QueryStatus.resizeObserver.observe(componentEl);
            // add references to our entries
            let componentInstanceObj = {
                "definition": exclusiveComponent,
                "parentDisplayEl": componentEl,
                "displayEl": componentEl
            }

            // <MORE-MAGIC> (http://catb.org/jargon/html/magic-story.html)
            //      CHROME MAGIC (we need to push the object into the componentInstances array NOW before viz module
            //      instantiation -- otherwise it will softcrash the browser (in breakpoint mode?)
            qrs_entries[code].componentInstances = [componentInstanceObj];
            // </MORE-MAGIC>

            // instantiate visualization
            let instantiationResults = functInstantiateViz(code, exclusiveComponent, componentInstanceObj);
            if (instantiationResults === false) {
                console.error("Failed to Instantiate viz module");
            }

        } else {
            // this is a QRS type that may have many visualization components
            if (validComponents.length === 0) {
                console.warn("QueryStatus: no valid components found to display " + code);
            } else {
                // create the master frame for the visualizations
                let componentParentEl = document.createElement("div");
                i2b2.CRC.QueryStatus.displayEl.appendChild(componentParentEl);
                componentParentEl.outerHTML = i2b2.CRC.QueryStatus.componentFrameTemplate;
                // get the correct reference directly from the main DOM document (implementation quirk)
                let allComponentEls = i2b2.CRC.QueryStatus.displayEl.querySelectorAll('.QueryStatusComponent');
                componentParentEl = allComponentEls[allComponentEls.length - 1];

                // get the reference for the main display div
                let refComponentMainDisplay = componentParentEl.querySelector(".viz-window");

                // get the reference for the component selection dropdown
                let refComponentDropdown = componentParentEl.querySelector(".viz-dropdown-select");

                // attach the component drop down selector
                refComponentDropdown.addEventListener('click', i2b2.CRC.QueryStatus.componentDropdownClickHandler);

                // get the title
                const refComponentTitle = componentParentEl.querySelector(".title");

                let componentIndex = 0;
                for (let componentConfig of validComponents) {
                    componentIndex++;
                    let componentInstanceObj = {"definition": componentConfig, "parentDisplayEl": componentParentEl};
                    // <MORE-MAGIC> (http://catb.org/jargon/html/magic-story.html)
                    //      CHROME MAGIC (we need to push the object into the componentInstances array NOW before viz module
                    //      instantiation -- otherwise it will softcrash the browser (in breakpoint mode?)
                    qrs_entries[code].componentInstances.push(componentInstanceObj);
                    // </MORE-MAGIC>
                    if (refComponentTitle) componentInstanceObj['parentTitleEl'] = refComponentTitle;

                    // create the frame element for the visualization instance
                    const componentVizEl = document.createElement("div");
                    componentVizEl.classList.add("component-instance-viz", "resulttype-" + code, "viztype-" + componentConfig.componentCode);
                    if (componentConfig.class !== undefined) componentVizEl.classList.add(componentConfig.class);
                    componentVizEl.style.display = 'none';
                    refComponentMainDisplay.appendChild(componentVizEl);
                    i2b2.CRC.QueryStatus.resizeObserver.observe(componentVizEl);
                    componentInstanceObj["displayEl"] = componentVizEl;

                    // create an entry in the viz selection dropdown
                    const componentDropEntryEl = document.createElement("li");
                    // set label and mouse hover
                    let tempEl;
                    if (componentConfig.iconClass !== undefined) {
                        tempEl = document.createElement("i");
                        for (let cname of componentConfig.iconClass.split(" ")) tempEl.classList.add(cname);
                        componentDropEntryEl.appendChild(tempEl);
                    }
                    if (componentConfig.name !== undefined) {
                        if (componentConfig.iconClass === undefined) {
                            componentDropEntryEl.textContent = componentConfig.name;
                        } else {
                            tempEl = document.createElement("span");
                            tempEl.classList.add("label");
                            tempEl.textContent = componentConfig.name;
                            componentDropEntryEl.appendChild(tempEl);
                        }
                    }
                    if (componentConfig.tooltip !== undefined) componentDropEntryEl.setAttribute('title', componentConfig.tooltip);
                    componentDropEntryEl.classList.add("viz-dropdown-item", "resulttype-" + code);
                    if (componentConfig.class !== undefined) componentDropEntryEl.classList.add(componentConfig.class);
                    refComponentDropdown.appendChild(componentDropEntryEl);
                    componentInstanceObj["dropdownEl"] = componentDropEntryEl;

                    // instantiate visualization
                    let instantiationResults = functInstantiateViz(code, componentConfig, componentInstanceObj, componentIndex);
                    if (instantiationResults === false) {
                        console.error("Failed to Instantiate viz module");
                    }
                }

                // handle if a viz module's advanced configuration makes it the default displayed plugin
                // debugger;
                const forcedInitialDisplay = qrs_entries[code].componentInstances.filter((viz) => {
                    if (typeof viz.advancedConfig === 'object') {
                        if (viz.advancedConfig.forceInitialDisplay === true) return true;
                    }
                    return false;
                });
                if (forcedInitialDisplay.length > 0) {
                    if (forcedInitialDisplay[0].visualization.show()) {
                        // only hide others if we succeeded in showing our target viz module
                        for (let vizToHide of qrs_entries[code].componentInstances) {
                            if (vizToHide !== forcedInitialDisplay[0]) vizToHide.visualization.hide();
                        }
                    }
                }
            }
        }
    }

    // save all that we have done for the visualizations to the main namespace
    for (let code of Object.keys(qrs_entries)) {
        i2b2.CRC.QueryStatus.model.visualizations[code] = qrs_entries[code];
    }
};






i2b2.CRC.QueryStatus._handleQueryResultSet = function(results) {
    if (results.error) {
        alert(results.errorMsg);
        return;
    } else {
        // Extract information about each Query Result Instance in the Query Result Set
        let qrs_list = results.refXML.getElementsByTagName('query_result_instance');
        let l = qrs_list.length;
        for (let i = 0; i < l; i++) {
            let rec = new Object();
            let temp = qrs_list[i];
            let qrs_id = i2b2.h.XPath(temp, 'descendant-or-self::result_instance_id')[0].firstChild.nodeValue;
            if (i2b2.CRC.QueryStatus.model.QRS.hasOwnProperty(qrs_id)) {
                rec = i2b2.CRC.QueryStatus.model.QRS[qrs_id];
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
            if (i2b2.CRC.QueryStatus.haltOnStatus.includes(rec.QRS_Status)) {
                rec.polling = false;
            } else {
                rec.polling = true;
            }
            // set the proper title if it was not already set
            if (!rec.title) rec.title =  i2b2.CRC.view.QueryReport._getTitle(rec.QRS_Type, rec, temp);

            // save the reference
            i2b2.CRC.QueryStatus.model.QRS[qrs_id] = rec;
        }

        // instantiate visualization modules for the query instance results list
        i2b2.CRC.QueryStatus.createVisualizationsFromList();

        // -------------------------------------------------------------------------------------------------------------
        // Fire off requests to get the results data for each QRS entry
        // -------------------------------------------------------------------------------------------------------------
        const ignoreQrsCodes = Object.keys(i2b2.CRC.QueryStatus.model.QRS).filter((d) => (d.indexOf("INTERNAL") !== -1));
        for (const qrsID of Object.keys(i2b2.CRC.QueryStatus.model.QRS)) {
            if (!ignoreQrsCodes.includes(qrsID)) {
                const rec = i2b2.CRC.QueryStatus.model.QRS[qrsID];
                if (rec.QRS_DisplayType === "CATNUM") {
                    // get a reference to the correct visualization
                    const vizRef = {id: qrsID, type: rec.QRS_Type, reference: i2b2.CRC.QueryStatus.model.visualizations[rec.QRS_Type]};
                    const scopedCallbackQRSI = new i2b2_scopedCallback(i2b2.CRC.QueryStatus._handleQueryResultInstance, vizRef);
                    i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryResultInstanceId("CRC:QueryReport", {qr_key_value: rec.QRS_ID}, scopedCallbackQRSI);
                }
            }
        }
    }
};


i2b2.CRC.QueryStatus._handleQueryResultInstance = function(results) {
    if (results.error) {
        console.error("Failed to update " + this.code + " query result instance ID=" + this.id + "! : " + results.errorMsg);
        alert("Failed to get data for Query Result Instance " + this.id + "  of type " + this.type + "!");

        // continue to poll on REST transport error?
        // =============================================================================================================
        // const vizRef = {id: this.id, type: this.type, reference: i2b2.CRC.QueryStatus.model.visualizations[this.type]};
        // const scopedCallbackQRSI = new i2b2_scopedCallback(i2b2.CRC.QueryStatus._handleQueryResultInstance, vizRef);
        // setTimeout(() => {
        //     i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryResultInstanceId("CRC:QueryStatus", {qr_key_value: this.id}, scopedCallbackQRSI);
        // }, i2b2.CRC.QueryStatus.shortestPollInterval);

        return;
    }

    let ri_list = results.refXML.getElementsByTagName('query_result_instance');
    if (ri_list.length !== 1) {
        console.error("Updated data for " + this.code + " query result instance ID=" + this.id + " is missing results XML");
        return;
    }
    let qriData = ri_list[0];

    // update the visualization components if the data has changed (looking at the entire message body)
    let body_xml = results.refXML.getElementsByTagName('message_body')[0].outerHTML;
    if (typeof this.reference.record.data === 'undefined') this.reference.record.data = "";
    if (this.reference.record.data !== body_xml) {
        // update the visualization components only when data has changed
        this.reference.record.data = body_xml;

        // update the extracted record data
        let rec = this.reference.record;
        rec.QRS_Type = i2b2.h.XPath(qriData, 'descendant-or-self::query_result_type/name')[0].firstChild.nodeValue;
        rec.isShrine = (rec.QRS_Type.indexOf("_SHRINE_") > -1);
        rec.isPatientCount = ["PATIENT_COUNT_XML","PATIENT_COUNT_SHRINE_XML"].includes(rec.QRS_Type);
        rec.size = i2b2.h.XPath(qriData, 'descendant-or-self::set_size')[0].firstChild.nodeValue;
        rec.visualAttr = i2b2.h.XPath(qriData, 'descendant-or-self::query_result_type/visual_attribute_type')[0].firstChild.nodeValue;
        // get the query name for display in the box
        rec.title = i2b2.h.XPath(qriData, 'descendant-or-self::query_result_type/description')[0].firstChild.nodeValue;
        rec.description = i2b2.h.XPath(qriData, 'descendant-or-self::description')[0].firstChild.nodeValue;
        // get the error status
        rec.QRS_Status = i2b2.h.XPath(qriData, 'descendant-or-self::query_status_type/name')[0].firstChild.nodeValue;
        // start and end dates
        rec.start_date = i2b2.h.getXNodeVal(qriData, 'start_date');
        if (rec.start_date !== undefined) {
            rec.start_date =  new Date(rec.start_date.substring(0,4), rec.start_date.substring(5,7)-1, rec.start_date.substring(8,10), rec.start_date.substring(11,13),rec.start_date.substring(14,16),rec.start_date.substring(17,19),rec.start_date.substring(20,23));
        }
        rec.end_date = i2b2.h.getXNodeVal(qriData, 'end_date');
        if (rec.end_date !== undefined) {
            rec.end_date =  new Date(rec.end_date.substring(0,4), rec.end_date.substring(5,7)-1, rec.end_date.substring(8,10), rec.end_date.substring(11,13),rec.end_date.substring(14,16),rec.end_date.substring(17,19),rec.end_date.substring(20,23));
        }

        // fire off data update calls to the visualization components for this QRI
        this.reference.componentInstances.forEach((vizComponent) => {
            vizComponent.visualization.update(results.refXML);
        });

        // see if we still need to continue polling
        if (!i2b2.CRC.QueryStatus.haltOnStatus.includes(rec.QRS_Status)) {
            // status is not in the list of Halt statuses, prepare for poll to execute in the future
            if (rec.QRS_DisplayType === "CATNUM") {
                // get a reference to the correct visualization
                const vizRef = {id: rec.QRS_ID, type: rec.QRS_Type, reference: i2b2.CRC.QueryStatus.model.visualizations[rec.QRS_Type]};
                const scopedCallbackQRSI = new i2b2_scopedCallback(i2b2.CRC.QueryStatus._handleQueryResultInstance, vizRef);
                setTimeout(() => {
                    i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryResultInstanceId("CRC:QueryStatus", {qr_key_value: rec.QRS_ID}, scopedCallbackQRSI);
                }, i2b2.CRC.QueryStatus.shortestPollInterval);
            }
        } else {
            // done polling, see if we hide because it has 0 patients
            if (parseInt(rec.size) === 0) {
                // hide all components that are not in this list
                let hide = true;
                let components = this.reference.componentInstances.map((d) => d.definition.componentCode);
                for (let code of components) {
                    if (i2b2.CRC.QueryStatus.showOnZeroCount.includes(code)) {
                        hide = false;
                        break;
                    }
                }
                if (hide) this.reference.componentInstances[0].parentDisplayEl.style.display = "none";
            }
        }

    }
};


// load and process the configuration file
let init = async function() {
    try {
        // load config.json
        let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "config.json");
        if (!response.ok) throw new Error(`Failed to retreve QueryStatus config.json file: ${response.status}`);
        const config = await response.json();
        i2b2.CRC.QueryStatus.displayComponents = config.displayComponents;
        i2b2.CRC.QueryStatus.displayOrder = config.displayOrder;
        i2b2.CRC.QueryStatus.haltOnStatus = config.haltPollingOnStatus;

        // load breakdowns.json
        response = await fetch(i2b2.CRC.QueryStatus.baseURL + "breakdowns.json");
        if (!response.ok) throw new Error(`Failed to retreve QueryStatus breakdowns.json file: ${response.status}`);
        i2b2.CRC.QueryStatus.breakdownConfig = await response.json();

        // save component keys into component objects
        for (const compCode of Object.keys(i2b2.CRC.QueryStatus.displayComponents)) i2b2.CRC.QueryStatus.displayComponents[compCode].componentCode = compCode;

        // retrieve the component frame template
        response = await fetch(i2b2.CRC.QueryStatus.baseURL + "componentFrameTemplate.html");
        if (!response.ok) {
            console.error(`Failed to retrieve component frame template file: ${response.status}`);
            i2b2.CRC.QueryStatus.componentFrameTemplate = "<div class='QueryStatusComponent'></div><div class='viz-window'></div><div>";
        } else {
            i2b2.CRC.QueryStatus.componentFrameTemplate = await response.text();
        }

        // load the component implementations and CSS
        let CSSAccumulator = "";
        for (let code in i2b2.CRC.QueryStatus.displayComponents) {
            const componentInfo = i2b2.CRC.QueryStatus.displayComponents[code];
            try {
                const component = await import("./" + componentInfo.source);
                componentInfo.implementation = component.default;
            } catch(e) {
                console.error("QueryStatus " + code + " Component load error: " + e.message);
            }

            if (componentInfo.CSS) {
                const response = await fetch(i2b2.CRC.QueryStatus.baseURL + componentInfo.CSS);
                if (!response.ok) console.error(`QueryStatus ` + code + ` CSS loading error: ${response.status}`);
                let cssDefinitions = await response.text();
                cssDefinitions = cssDefinitions.trim();
                if (cssDefinitions.length > 0) CSSAccumulator = CSSAccumulator + "\n\n\n\n" + cssDefinitions;
            }
        }

        // append the component style definitions
        if (CSSAccumulator.trim().length > 0) {
            const componentStyleDefEl = document.createElement('style');
            componentStyleDefEl.innerHTML = CSSAccumulator + "\n";
            document.head.append(componentStyleDefEl);
        }

    } catch (error) {
        console.error("Failed to initialize QueryStatus engine: ", error);
    }
};
init();





