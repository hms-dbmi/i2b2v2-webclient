export default class ShrineSites {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            const self = this;

            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.columns = ["Site", "Results"];
            this.columnSort = Array(this.columns.length).fill(false);

            // create the base TABLE
            let table = d3.select(this.config.displayEl).append('table');
            let header = table.append('thead');
            let body = table.append('tbody');


            let colEls = header.append('tr')
                .selectAll('th')
                .data(this.columns).enter()
                .append('th')
                .text((column) => column)
                .call((parent) => {
                    let t = parent.append("i");
                    t.classed("bi",true);
                    t.classed("bi-sort-alpha-down", true);
                    t.attr("title","Sort by Column");
                    t.on("click", (e, d) => {
                        const sortIndex = self.columns.indexOf(d);
                        if (sortIndex !== -1) {
                            // deal with styling
                            for (let node of self.config.displayEl.querySelectorAll('i.sort-by')) {
                                node.classList.remove("sort-by");
                            }
                            e.target.classList.add("sort-by");

                            // update sort configuration
                            self.columnSort = self.columnSort.map((d,i) => i === sortIndex);
                            self.update();
                        }
                    });
                });

            colEls.each((d, idx, el) => {
                let cname = "site";
                if (idx == 1) cname = "result";
                if (idx > 1) cname = "details";
                el[idx].classList.add(cname);
            });




        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.constructor()");
        }
    }

    update(inputData) {
        this.config.displayEl.style.display = "none";
        try {
            if (typeof inputData === 'undefined') {
                // no data has been set... exit
                if (Object.keys(this.data).length === 0) return;
            } else {
                // get the breakdown data information (if present)
                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data = parseData(resultXML);
                }
            }

            // select the previously created TABLE element
            let sortedData = Object.values(this.data);
            const sortBy = this.columns.filter(((d,i) => this.columnSort[i]).bind(this));
            if (sortBy.length > 0) {
                sortedData = sortedData.sort((a,b) => {
                    switch (sortBy[0]) {
                        case "Site":
                            return d3.ascending(a.site, b.site);
                            break;
                        case "Results":
                            return d3.ascending(a.count, b.count);
                            break;
                    }
                });
            }


            let tbody = d3.select(this.config.displayEl).select('tbody');
            tbody.selectAll("*").remove();
            this.rows =  tbody.selectAll('tr').data(sortedData);
            let rows = this.rows;

            // add new rows
            let newRows = rows.enter().append('tr');
            let tds = newRows.selectAll('td')
                .data((row) => {
                    let ret = [{text: row.site, class:"site"}];
                    if (String(row.status).toUpperCase() === "COMPLETED") {
                        // return the site's count
                        if (row.count <= row.floorThresholdNumber) {
                            // handle if it is below our floor threshold
                            ret.push({
                                text: "<" + parseInt(row.floorThresholdNumber).toLocaleString() + " Patients",
                                class: "status-complete"
                            });
                        } else {
                            // handle the obfuscation
                            ret.push({
                                text: parseInt(row.count).toLocaleString() + "±" + parseInt(row.obfuscatedDisplayNumber).toLocaleString() + " Patients",
                                class: "status-complete"
                            });
                        }
                    } else {
                        // display the site's current status
                        let rec = {text:row.status};
                        switch (String(row.status).toUpperCase()) {
                            case "ERROR":
                                rec.class = "status-error";
                            default:
                                rec.class = "status-unknown";
                        }
                        ret.push(rec);
                    }
                    return ret;
                })
                .enter()
                .append('td')
                .text((d) => { return d.text; })
                .each((d, i, el)=>{
                    for (let c of d.class.split(" ")) {
                        if (c.length > 0) el[i].classList.add(c);
                    }
                });

            tds.each((d, idx, el) => {
                let cname = "site";
                if (idx == 1) cname = "result";
                if (idx > 1) cname = "details";
                el[idx].classList.add(cname);
            });

        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.update()");
        }
        this.config.displayEl.style.display = "block";
    }

    redraw(width) {
        try {
//            this.config.displayEl.innerHTML = "{" + this.constructor.name + "} is " + width + " pixels wide";
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.redraw()");
        }
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.show()");
        }
    }

    hide() {
        try {
            return false;
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.hide()");
        }
    }
}

const parseData = (xmlData) => {
    console.dir(xmlData);
    console.log(xmlData)
    let data = {};
    let records = i2b2.h.XPath(xmlData, "//data[@column]");
    for (let rec of records) {
        let key = rec.getAttribute("column");
        data[key] = {};
        data[key].site = key;
        data[key].count = parseInt(rec.textContent);
    }
    // SHRINE site details
    let attribs = ["status", "floorThresholdNumber","obfuscatedDisplayNumber","binSize","stdDev"];
    records = i2b2.h.XPath(xmlData, "//SHRINE/site[@name]");
    for (let rec of records) {
        let key = rec.getAttribute("name");
        if (typeof data[key] === "undefined") data[key] = {};
        data[key].site = key;
        for (let attrib of attribs) {
            data[key][attrib] = rec.getAttribute(attrib);
        }
    }
    return data;
};


//  <ns10:i2b2_result_envelope><body>
//      <ns10:result name="PATIENT_SITE_COUNT_SHRINE_XML">
//          <data column="Site 1" type="int">51075</data>
//          <data column="Site 2" type="int">51070</data>
//      </ns10:result>
//      <SHRINE sites="2" complete="2" error="0" status="Completed" >
//          <site name="Site 1" status="Completed" floorThresholdNumber="10" obfuscatedDisplayNumber="3" binSize="0" stdDev="3" />
//          <site name="Site 2" status="Completed" floorThresholdNumber="10" obfuscatedDisplayNumber="3" binSize="0" stdDev="3" />
//      </SHRINE>
//  </body></ns10:i2b2_result_envelope>