export default class Table {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
            this.columns = ["Breakdown Group", "Patients"];

            // create the base TABLE
            let table = d3.select(this.config.displayEl).append('table');
            let header = table.append('thead');
            let body = table.append('tbody');

            let colEls = header.append('tr')
                .selectAll('th')
                .data(this.columns).enter()
                .append('th')
                .text((column) => column);

            colEls.each((d, idx, el) => {
                let cname = "name";
                if (idx == 1) cname = "total";
                if (idx > 1) cname = "site";
                el[idx].classList.add(cname);
            });

        } catch(e) {
            console.error("Error in QueryStatus:Table.constructor()");
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
                if (this.data === null || Object.keys(this.data).length === 0) return;
            } else {
                // get the breakdown data information (if present)
                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data = parseData(resultXML);
                    if (typeof this.data === 'undefined') return;
                }
            }

            // select the previously created TABLE element
            let tbody = d3.select(this.config.displayEl).select('tbody');
            let rows = tbody.selectAll('tr').data(this.data.result);

            // add new rows
            let newRows = rows.enter().append('tr');
            let tds = newRows.selectAll('td')
                .data((row) => {
                    return [row.name, row.value];
                })
                .enter()
                .append('td')
                    .text((d) => { return d; });

            tds.each((d, idx, el) => {
                let cname = "name";
                if (idx == 1) cname = "total";
                if (idx > 1) cname = "site";
                el[idx].classList.add(cname);
            });

            // update the viewport element to the height of the visualization
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:Table.update()");
            return false;
        }
        return true;
    }


    redraw(width) {
        try {
            // update the viewport element to the height of the visualization
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:Table.redraw()");
        }
    }


    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        try {
            this.isVisible = true;
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'block';
            if (this.config.parentTitleEl) this.config.parentTitleEl.innerHTML = this.record.title;
            this.config.displayEl.style.display = 'block';
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Table.show()");
        }
    }


    hide() {
        try {
            this.isVisible = false;
            this.config.displayEl.style.display = 'none';
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'none';
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Table.hide()");
        }
    }
}



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
        entryRecord.value = parseInt(params[i2].firstChild.nodeValue).toLocaleString();

        // format with commas
        if (i2b2.PM.model.isObfuscated) {
            const nodeValue = parseInt(params[i2].firstChild.nodeValue);
            if (!isNaN(nodeValue) && nodeValue < 4) {
                entryRecord.display = "< " + i2b2.UI.cfg.obfuscatedDisplayNumber.toString();
            }
            if (isNaN(nodeValue) || entryRecord.name === 'QueryMasterID') {
                entryRecord.display = params[i2].firstChild.nodeValue;
            } else {
                entryRecord.display = entryRecord.value + "±" + i2b2.UI.cfg.obfuscatedDisplayNumber.toString();
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
                        value: parseInt(siteresult.textContent).toLocaleString()
                    });
                }
            }
            ShrineData.sites.push(siteData);
        }
        breakdown.SHRINE = ShrineData;
    }

    return breakdown;
}