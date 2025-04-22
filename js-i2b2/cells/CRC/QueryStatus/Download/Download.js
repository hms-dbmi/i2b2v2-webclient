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
                return;
            } else {
                // get the breakdown data information (if present)
                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data = parseData(resultXML);
                    // add the query name to the data
                    this.data.title = this.record.description.replaceAll("\"","'"); // replace " with ' to prevent CSV errors
                } else {
                    this.data = false;
                }
            }
        } catch(e) {
            console.error("Error in QueryStatus:Download.update()");
        }
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

    csv = `"` + inputData.title + `",""\n`;
    line = [`"Breakdown Group"`, `"Total"`];
    csv = csv + line.join(',') + "\n";

    for (let grouping of inputData.result) {
        line = [grouping.name, grouping.value];
        line = line.map((x) => x.trim().replaceAll(`"`, `'`));
        line = line.map((x) => `"` + x + `"`);
        csv = csv + line.join(',') + `\n`;
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
                        value: parseInt(siteresult.textContent)
                    });
                }
            }
            ShrineData.sites.push(siteData);
        }
        breakdown.SHRINE = ShrineData;
    }

    return breakdown;
}