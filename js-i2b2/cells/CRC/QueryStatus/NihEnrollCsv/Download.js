export default class NihEnrollCsv {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
            this.csv = false;

            // create the table template
            (async function() {
                // retrieve the component frame template
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "NihEnrollCsv/template.csv");
                if (!response.ok) {
                    console.error(`Failed to retrieve NihEnrollCsv component template file: ${response.status}`);
                    this.dispTemplate = false;
                } else {
                    this.dispTemplate = await response.text();
                    this.renderTemplate = Handlebars.compile(this.dispTemplate);
                    this.update();
                }
            }).call(this);
        } catch(e) {
            console.error("Error in NihEnrollCsv:Download.constructor()");
        }
    }

    destroy() {
        delete this.config.displayEl;
        delete this.config;
        delete this.record;
        delete this.data;
    }

    update(inputData) {
        try {
            let resultXML;
            if (typeof inputData === 'undefined') {
                // no data has been set... exit
                if (this.data === null || Object.keys(this.data).length === 0) return false;
            } else {
                // get the breakdown data information (if present)
                resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (!(resultXML.length > 0)) {
                    this.data = false;
                    return false;
                }
            }

            // process the data
            resultXML = resultXML[0].firstChild.nodeValue;
            // parse the data and put the results into the new data slot
            this.data = parseData(resultXML);
            if (typeof this.data === 'undefined') return;
            // add the query name to the data
            this.data.title = this.record.description.replaceAll("\"","'"); // replace " with ' to prevent CSV errors

            // convert the data into our data tree format
            const treeStruct = [
                ["American Indian or Alaska Native", "Asian", "Native Hawaiian or Other Pacific Islander", "Black or African American", "White", "Multiple race", "No Race Info"],
                ["Female", "Male","Unknown/Not Reported"],
                ["Not Hispanic", "Hispanic", "No Ethnicity Info"]
            ];

            // create a data tree structure (insert 0 count for any missing)
            let dataTree = {}
            for (const level1 of treeStruct[0]) {
                dataTree[level1] = {};
                for (const level2 of treeStruct[1]) {
                    dataTree[level1][level2] = {};
                    for (const level3 of treeStruct[2]) {
                        // see if the data exist
                        const keyName = level1 + "-" + level2 + "-" + level3;
                        const matched = this.data.result.filter((d)=> d.name === keyName);
                        if (matched.length > 0) {
                            dataTree[level1][level2][level3] = matched[0];
                        } else {
                            dataTree[level1][level2][level3] = {"display": "0", "value": 0};
                        }
                    }
                }
            }

            // create the totals arrays (and populate the render array)
            let renderArray = [];
            let totalEthnicSex = new Array(10).fill(0);
            for (const idx in treeStruct[0]) {
                const race = treeStruct[0][idx];
                renderArray[idx] = new Array(10).fill(0);
                let count = 0;
                let colIdx = 0;
                for (const sexIdx in treeStruct[1]) {
                    const sexKey = treeStruct[1][sexIdx];
                    for (const ethnicityIdx in treeStruct[2]) {
                        const ethnicityKey = treeStruct[2][ethnicityIdx];
                        colIdx = parseInt(ethnicityIdx * 3) + parseInt(sexIdx);
                        // cell value
                        renderArray[idx][colIdx] = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(dataTree[race][sexKey][ethnicityKey].value);
                        // increment row value
                        count += parseInt(dataTree[race][sexKey][ethnicityKey].value);
                        // increment column value
                        totalEthnicSex[colIdx] += parseInt(dataTree[race][sexKey][ethnicityKey].value);
                    }
                }
                renderArray[idx][9] = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(count);
            }

            // update the grand total on the last row
            totalEthnicSex[9] = totalEthnicSex.reduce((acc, currentValue) => acc + currentValue, 0);

            // place the updated totals on last row
            for (let idx = 0; idx < 10; idx++) {
                totalEthnicSex[idx] = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(totalEthnicSex[idx]);
            }
            renderArray[7] = totalEthnicSex;

            // ==================================================================
            // render the template using the data
            if (typeof this.renderTemplate === 'undefined') return false;
            const qmTitle = i2b2.CRC.model.runner.name.trim().replaceAll(`"`,`'`);
            this.csv = this.renderTemplate({title: qmTitle , data: renderArray});

        } catch(e) {
            console.error("Error in QueryStatus:NihEnrollCsv.update()");
        }
        return false;
    }

    redraw(width) {
        // this vizComponent does not have a visual representation
        return true;
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            if (this.csv === false) {
                alert("No data to download for " + this.record.title);
            } else {
                // create download link and associate csv data to it
                let dlLink = document.createElement('a');
                let data = new Blob([this.csv], {'type':'text/csv'});
                dlLink.href = URL.createObjectURL(data);
                dlLink.download = this.record.description.replaceAll(' ','_') + ".csv";
                document.body.appendChild(dlLink);
                // programatically click the link to start download
                dlLink.click()
                // cleanup the generated link (and associated data)
                document.body.removeChild(dlLink);
            }
            this.isVisible = false;
            return false;
        } catch(e) {
            console.error("Error in QueryStatus:NihEnrollCsv.show()");
        }
    }

    hide() {
        try {
            this.isVisible = false;
            return true;
        } catch(e) {
            console.error("Error in NihEnrollCsv:Download.hide()");
        }
    }
}

// =======================================================================================================================

let generateCSV = (inputData) => {
    let line, csv;

    let siteCnt = 0;
    if (typeof inputData.SHRINE !== 'undefined') siteCnt = inputData.SHRINE.sites.length;

    const func_ProcessLine = (lineArray) => {
        let line = lineArray.map((x) => x.trim().replaceAll(`"`, `'`));
        line = line.map((x) => `"` + x + `"`);
        return line.join(',') + `\n`;
    };

    // title line
    line = [inputData.title];
    line.push("");
    for (let i=0; i<siteCnt; i++) line.push("");
    csv = func_ProcessLine(line);

    // column header line
    line = ["Breakdown Group"];
    if (siteCnt > 0) {
        for (let i=0; i<siteCnt; i++) line.push(inputData.SHRINE.sites[i].name);
    }
    line.push("Total");
    csv = csv + func_ProcessLine(line);

    // // add the "All Patients" line if we have SHRINE data
    // if (siteCnt > 0) {
    //     line = ["All Patients"];
    //     let total = 0;
    //     for (let i=0; i<siteCnt; i++) {
    //         let subtotal = inputData.SHRINE.sites[i].results.map((t) => t.value).reduce((parialSum, a) => parialSum + a, 0);
    //         total = total + subtotal;
    //         line.push(String(subtotal));
    //     }
    //     line.push(String(total));
    //     csv = csv + func_ProcessLine(line);
    // }

    for (let grouping of inputData.result) {
        line = [grouping.name];
        if (siteCnt > 0) {
            for (let i=0; i<siteCnt; i++) {
                let temp = [];
                if (typeof inputData.SHRINE.sites[i].results !== "undefined") {
                    temp = inputData.SHRINE.sites[i].results.filter((t) => t.name === grouping.name);
                }
                if (temp.length > 0) {
                    if (typeof temp[0].display !== "undefined") {
                        line.push(temp[0].display);
                    } else {
                        line.push(String(temp[0].value));
                    }
                } else {
                    line.push('');
                }
            }
        }
        line.push(grouping.display) // total column value
        csv = csv + func_ProcessLine(line);
    }
    return csv;
};



let parseData = function(xmlData) {
    let breakdown = {};
    breakdown.result = [];
    // process "normal" data
    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    // short circuit exit because there is no data
    if (params.length === 0) return;
    for (let i2 = 0; i2 < params.length; i2++) {
        let entryRecord = {}
        entryRecord.name = $('<div>').html(params[i2].getAttribute("column")).text();
        entryRecord.value = params[i2].firstChild.nodeValue;
        entryRecord.floorThreshold = params[i2].getAttribute("floorThresholdNumber");
        entryRecord.obfuscateNumber = params[i2].getAttribute("obfuscatedDisplayNumber");
        entryRecord.display = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(entryRecord.value, entryRecord.floorThreshold, entryRecord.obfuscateNumber);
        // Override the display value if specified by server setting the "display" attribute
        if (typeof params[i2].attributes.display !== 'undefined') {
            entryRecord.value = i2b2.h.Unescape(entryRecord.value);
            entryRecord.display = params[i2].attributes.display.textContent;
        }
        breakdown.result.push(entryRecord);
    }

    return breakdown;
}

