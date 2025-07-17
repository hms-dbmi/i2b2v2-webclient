export default class ShrineSites {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            const self = this;

            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;

            this.columns = ["Site", "Results"];
            this.columnSort = Array(this.columns.length).fill(0);

            // create the base TABLE
            let table = d3.select(this.config.displayEl).append('table');
            let header = table.append('thead');
            let body = table.append('tbody');


            let colEls = header.append('tr')
                .selectAll('th')
                .data(this.columns).enter()
                .append('th')
                .text((column) => column)
                .call((parent, a, b, c) => {
                    let sortClass;
                    for (let th of parent._groups[0]) {
                        switch(th.__data__) {
                            case "Site":
                                sortClass = "bi-sort-alpha";
                                break;
                            case "Results":
                                sortClass = "bi-sort-numeric";
                                break;
                        }
                        // Sort DESC
                        let t = d3.select(th).append("i");
                        t.classed("bi",true);
                        t.classed(sortClass + "-up", true);
                        t.attr("title","Sort Descending by Column");
                        t.on("click", (e, d) => {
                            const sortIndex = self.columns.indexOf(d);
                            if (sortIndex !== -1) {
                                // deal with styling
                                for (let node of self.config.displayEl.querySelectorAll('i.sort-by')) {
                                    node.classList.remove("sort-by");
                                }
                                e.target.classList.add("sort-by");

                                // update sort configuration
                                self.columnSort = self.columnSort.map((d, i) => i === sortIndex ? -1 : 0);
                                self.update();
                            }
                        });
                        // sort ASC
                        t = d3.select(th).append("i");
                        t.classed("bi",true);
                        t.classed(sortClass + "-down", true);
                        t.attr("title","Sort Ascending by Column");
                        t.on("click", (e, d) => {
                            const sortIndex = self.columns.indexOf(d);
                            if (sortIndex !== -1) {
                                // deal with styling
                                for (let node of self.config.displayEl.querySelectorAll('i.sort-by')) {
                                    node.classList.remove("sort-by");
                                }
                                e.target.classList.add("sort-by");

                                // update sort configuration
                                self.columnSort = self.columnSort.map((d,i) => i === sortIndex ? 1 : 0);
                                self.update();
                            }
                        });
                    }
                });

            colEls.each((d, idx, el) => {
                let cname = "site";
                if (idx == 1) cname = "result";
                if (idx > 1) cname = "details";
                el[idx].classList.add(cname);
            });
            this.config.displayEl.style.display = "none";
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
            const sortBy = this.columns.filter(((d,i) => this.columnSort[i] !== 0).bind(this));
            if (sortBy.length > 0) {
                const sortOrder = this.columnSort[this.columns.indexOf(sortBy[0])];
                sortedData = sortedData.sort((a,b) => {
                    switch (sortBy[0]) {
                        case "Site":
                            if (sortOrder === 1) {
                                return d3.ascending(a.site, b.site);
                            } else {
                                return d3.descending(a.site, b.site);
                            }
                            break;
                        case "Results":
                            if (a.error || b.error) {
                                if (a.error && b.error) {
                                    if (sortOrder === 1) {
                                        return d3.ascending(a.site, b.site);
                                    } else {
                                        return d3.descending(a.site, b.site);
                                    }
                                }
                                if (a.error) return 1;
                                return -1;
                            } else {
                                if (sortOrder === 1) {
                                    return d3.ascending(a.count, b.count);
                                } else {
                                    return d3.descending(a.count, b.count);
                                }
                            }
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
                            let temp = {
                                text: "<" + parseInt(row.floorThresholdNumber).toLocaleString() + " Patients",
                                class: "status-complete"
                            };
                            if (row.count === 0) temp.text = "0 Patients";
                            ret.push(temp);
                        } else {
                            // handle the obfuscation
                            ret.push({
                                text: parseInt(row.count).toLocaleString() + "±" + parseInt(row.obfuscatedDisplayNumber).toLocaleString() + " Patients",
                                class: "status-complete"
                            });
                        }
                    } else {
                        // display the site's current status
                        let rec = {text: row.status};
                        if (row.error === true) {
                            rec.text = row.status;
                            rec.error = row.text;
                            rec.class = "status-error";
                        } else {
                            switch(String(row.status).toUpperCase()) {
                                case "SENT TO SITE":
                                case "PROCESSING AT HUB":
                                case "PROCESSING AT SITE":
                                    rec.class = "status-good";
                                    break;
                                case "DELAYED AT SITE":
                                    rec.class = "status-warn";
                                    break;
                                default:
                                    rec.class = "status-unknown";
                            }
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
                        if (typeof d.error !== 'undefined') el[i].dataset["errorMsg"] = d.error;
                    }
                });

            tds.each((d, idx, el) => {
                let cname = "site";
                if (idx == 1) cname = "result";
                if (idx > 1) cname = "details";
                el[idx].classList.add(cname);
            });

            $(".status-error.result[data-error-msg]").on('click', (e) => {
                alert(e.target.__data__.error);
            });

        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.update()");
        }
        this.config.displayEl.style.display = "block";
        this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
    }

    redraw(width) {
        try {
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.redraw()");
        }
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            this.config.parentTitleEl.innerHTML = this.record.title;
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
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
    let data = {};
    let records = i2b2.h.XPath(xmlData, "//data[@column]");
    for (let rec of records) {
        let key = rec.getAttribute("column");
        data[key] = {};
        data[key].site = key;
        data[key].count = parseInt(rec.textContent);
        if (isNaN(data[key].count)) {
            data[key].count = rec.textContent;
        }
    }
    // SHRINE site details
    let attribs = ["status", "floorThresholdNumber","obfuscatedDisplayNumber","binSize","stdDev"];
    records = i2b2.h.XPath(xmlData, "//SHRINE/site[@name]");
    for (let rec of records) {
        let key = rec.getAttribute("name");
        if (typeof data[key] === "undefined") data[key] = {};
        data[key].site = key;
        data[key].text = rec.textContent;
        for (let attrib of attribs) {
            data[key][attrib] = rec.getAttribute(attrib);
        }
        if (data[key].status.toUpperCase().indexOf("ERROR") !== -1) data[key].error = true;
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