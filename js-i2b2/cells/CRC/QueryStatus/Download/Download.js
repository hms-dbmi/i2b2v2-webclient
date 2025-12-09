export default class Download {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
        } catch(e) {
            console.error("Error in QueryStatus:Download.constructor()");
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
            if (typeof inputData === 'undefined') {
                // no data has been set... exit
                return false;
            } else {
                // get the breakdown data information (if present)
                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data = parseData(resultXML);
                    if (typeof this.data === 'undefined') return;
                    // add the query name to the data
                    this.data.title = this.record.description.replaceAll("\"","'"); // replace " with ' to prevent CSV errors
                } else {
                    this.data = false;
                }
            }
        } catch(e) {
            console.error("Error in QueryStatus:Download.update()");
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
            if (this.data === false) {
                alert("No data to download for " + this.record.title);
            } else {
                // create download link and associate csv data to it
                let dlLink = document.createElement('a');
                let data = new Blob([generateCSV(this.data)], {'type':'text/csv'});
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
            console.error("Error in QueryStatus:Download.show()");
        }
    }

    hide() {
        try {
            this.isVisible = false;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Download.hide()");
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
                    line.push(String(temp[0].value));
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

    // process "SHRINE" data
    let ShrineNode = i2b2.h.XPath(xmlData, 'descendant::SHRINE');
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
            let siteResults = i2b2.h.XPath(site, "siteresult");
            if (siteResults.length) {
                siteData.results = [];
                for (let siteresult of siteResults) {
                    siteData.results.push({
                        name: $('<div>').html(siteresult.getAttribute('column')).text(),
                        value: parseInt(siteresult.textContent),
                        display: i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(siteresult.textContent, siteData.floorThresholdNumberX, siteData.obfuscatedDisplayNumber)
                    });
                }
            }
            ShrineData.sites.push(siteData);
        }
        breakdown.SHRINE = ShrineData;
    }

    return breakdown;
}


// <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <ns10:i2b2_result_envelope>
//     <body>
//         <ns10:result name="PATIENT_SEX_COUNT_SHRINE_XML">
//             <data column="Ambiguous" floorThresholdNumber="20" obfuscatedDisplayNumber="10">0</data>
//             <data column="Female" floorThresholdNumber="20" obfuscatedDisplayNumber="6">38350</data>
//             <data column="Male" floorThresholdNumber="20" obfuscatedDisplayNumber="6">37360</data>
//             <data column="No Infomation" floorThresholdNumber="20" obfuscatedDisplayNumber="10">0</data>
//             <data column="Other" floorThresholdNumber="20" obfuscatedDisplayNumber="10">0</data>
//             <data column="X (Eg. Nonbinary, AGender, etc)" floorThresholdNumber="20" obfuscatedDisplayNumber="10">0</data>
//         </ns10:result>
//         <SHRINE sites="2" complete="2" error="0">
//             <site name="Site 1" status="Completed" binsize="5" stdDev="6.500000000000000e+000" obfuscatedDisplayNumber="10" floorThresholdNumber="10">
//                 <siteresult column="No Infomation" type="int">0</siteresult>
//                 <siteresult column="Female" type="int">19180</siteresult>
//                 <siteresult column="X (Eg. Nonbinary, AGender, etc)" type="int">0</siteresult>
//                 <siteresult column="Other" type="int">0</siteresult>
//                 <siteresult column="Male" type="int">18680</siteresult>
//                 <siteresult column="Ambiguous" type="int">0</siteresult>
//             </site>
//             <site name="Site 2" status="Completed" binsize="5" stdDev="6.500000000000000e+000" obfuscatedDisplayNumber="10" floorThresholdNumber="10">
//                 <siteresult column="No Infomation" type="int">0</siteresult>
//                 <siteresult column="Female" type="int">19170</siteresult>
//                 <siteresult column="X (Eg. Nonbinary, AGender, etc)" type="int">0</siteresult>
//                 <siteresult column="Other" type="int">0</siteresult>
//                 <siteresult column="Male" type="int">18680</siteresult>
//                 <siteresult column="Ambiguous" type="int">0</siteresult>
//             </site>
//         </SHRINE>
//     </body>
// </ns10:i2b2_result_envelope>