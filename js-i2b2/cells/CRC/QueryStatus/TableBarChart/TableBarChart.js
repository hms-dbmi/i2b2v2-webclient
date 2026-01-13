export default class TableBarChart {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
            this.columns = [{name: "Breakdown Group"}, {name: "Patients", span: 2}];

            // create the base TABLE
            let table = d3.select(this.config.displayEl).append('table');
            let header = table.append('thead');
            let body = table.append('tbody');

            let colEls = header.append('tr')
                .selectAll('th')
                .data(this.columns).enter()
                .append('th')
                .attr("colspan", function(column) {
                    return column.span ? column.span : 1; // Set the colspan attribute if 'span' exists
                })
                .text((column) => column.name);

            colEls.each((d, idx, el) => {
                let cname = "name";
                if (idx === 1) cname = "total";
                if (idx === 2) cname = "barchart";
                el[idx].classList.add(cname);
            });

            d3.select(this.config.displayEl).append("a")
            .attr("class", "showMore")
            d3.select(this.config.displayEl).append("a")
            .attr("class", "showLess hideNotTop10")
            .text("Only show the top 10 rows")

        } catch(e) {
            console.error("Error in QueryStatus:TableBarChart.constructor()");
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
                if (this.data === null || Object.keys(this.data).length === 0) return false;
            } else {
                // get the breakdown data information (if present)
                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data = parseData(resultXML);
                    if (typeof this.data === 'undefined') return false;
                }
            }

            // select the previously created TABLE element
            let tbody = d3.select(this.config.displayEl).select('tbody');

            let rows = tbody.selectAll('tr').data(this.data.result);

            // add new rows
            let newRows = rows.enter().append('tr');

            d3.select(this.config.displayEl).select(".showMore")
            .text("Show all " + this.data.result.length + " rows")
            .on('click', function(event) {
                d3.select(".showLess").classed("hideNotTop10", false);
                d3.selectAll(".notTop10")
                    .classed("hideNotTop10", false);

                d3.select(this).classed('hideNotTop10', true);
            });

            d3.select(this.config.displayEl).select(".showLess")
            .on('click', function(event) {
                d3.select(".showMore").classed("hideNotTop10", false);
                d3.select(this).classed("hideNotTop10", true);
                d3.selectAll(".notTop10").classed('hideNotTop10', true);
            });

            let tds = newRows.selectAll('td')
                .data((row) => {
                    return [row.name, row.display, row.value];
                })
                .enter()
                .append('td');

            const dataValues = this.data.result.map(d => d.value);
            const max = Math.max(...dataValues);

            tds.each(function(d, idx, el) {
                let cname = "name";
                if (idx === 1) cname = "total";
                if (idx === 2) cname = "barchart";
                el[idx].classList.add(cname);

                const cellSelection = d3.select(this);
                if (idx === 2) {
                    let scaleRadiusFunc = d3.scaleLinear([0, max], [0, 100]);
                    let width = scaleRadiusFunc(d);
                    cellSelection.append("div")
                        .attr("class", "cell-bar")
                        .attr("style", "width:" + width + "%");
                }else {
                    cellSelection.text(d);
                }
            });

            newRows.each(function(n,idx, el){
                if(idx > 9){
                    el[idx].classList.add("notTop10");
                    el[idx].classList.add("hideNotTop10");
                }
            });

            // update the viewport element to the height of the visualization
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:TableBarChart.update(). ", e);
            return false;
        }
        return true;
    }


    redraw(width) {
        try {
            // update the viewport element to the height of the visualization
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:TableBarChart.redraw()");
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
            console.error("Error in QueryStatus:TableBarChart.hide()");
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
        entryRecord.value = parseInt(params[i2].textContent);
        const floorThreshold = params[i2].getAttribute("floorThresholdNumber");
        const obfuscateNumber = params[i2].getAttribute("obfuscatedDisplayNumber");
        entryRecord.display = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(entryRecord.value, floorThreshold, obfuscateNumber);
        // Override the display value if specified by server setting the "display" attribute
        if (typeof params[i2].attributes.display !== 'undefined') {
            entryRecord.value = $('<div>').html(params[i2].textContent).text();
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