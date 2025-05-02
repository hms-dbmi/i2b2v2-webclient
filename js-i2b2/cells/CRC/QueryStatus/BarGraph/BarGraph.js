const margin = {top: 10, right: 30, bottom: 70, left: 60};

export default class BarGraph {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            let processedData = {};
            if (qrsData !== null && typeof qrsData === 'object' && qrsData.constructor.name === 'XMLDocument') {
                let resultXML = i2b2.h.XPath(qrsData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    processedData = parseData(resultXML);
                }
            }
            this.data = {"old": processedData, "new": processedData};
            this.isVisible = false;

            if (typeof this.width === 'undefined') this.width = this.config.displayEl.parentElement.clientWidth;

            // create the SVG element
            this.height = 400 - margin.top - margin.bottom;
            let svg = d3.select(this.config.displayEl)
                .append("svg")
                .attr("width", "100%")
                .attr("height", this.height + margin.top + margin.bottom)
                .append("g")
                .classed("svg-body", true)
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

        } catch(e) {
            console.error("Error in QueryStatus:BarGraph.constructor()");
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
                if (Object.keys(this.data.new).length === 0) return;
            } else {
                // shift previous data into the old data slot
                this.data.old = this.data.new;

                // get the breakdown data information (if present)
                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data.new = parseData(resultXML);
                }
            }

            // update the bar graph
            let width = this.width - margin.left - margin.right;
            let height = this.height;

            let data = this.data.new.result;

            // select the previously created SVG element
            let svg = d3.select(this.config.displayEl).select('.svg-body');


            // generate the X axis calc object
            // -----------------------------------------------------------------------------------------------------
            var x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data.map(function(d) { return d.name; }))
                .padding(0.2);
            // build the X axis and detect the largest label height for latter use
            let maxHeight = 0;

            svg.select(".x-axis").remove();
            // build the X axis
            svg.append("g")
                .classed("x-axis", true)
                .attr("transform", "translate(0," + this.height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .text((d)=>shortenLabel(d, i2b2.CRC.cfg.params.maxBarLabelLength))
                .attr("transform", "translate(-10,0)rotate(-45)")
                .classed("graphLabel", true)
                .attr("test", (x, y, z) => {
                    let h = z[y].getBoundingClientRect().height;
                    if (maxHeight < h) maxHeight = h;
                    return h;
                })
                .append("title")
                .text((t, i) => {
                    // TODO: handle Obfuscation and Sketches
                    // i2b2.PM.model.isObfuscated
                    let val = parseInt(data[i].value).toLocaleString();
                    if (data[i].display) val = data[i].display;
                    return t + "\n[ "+ val + " patients ]";
                });

            // resize the SGV height depending upon our max X axis label height
            if (maxHeight > margin.bottom) svg.node().parentElement.attributes.height.value = this.height + margin.top + maxHeight + 10;


            // generate the Y axis calc object
            // -----------------------------------------------------------------------------------------------------
            let maxValue = Math.max(...data.map((d) => parseFloat(d.value)));
            var y = d3.scaleLinear()
                .domain([0, maxValue])
                .range([ height, 0]);
            // build the Y axis

            svg.select(".y-axis").remove();
            let y_axis = svg.append("g")
                .classed("y-axis", true)
                .call(d3.axisLeft(y).tickFormat(d3.format(".2~s")));
            y_axis.append("text")
                .attr("fill","currentColor")
                .text("Number of Patients")
                .classed("y-label", true)
                .attr("letter-spacing", "1.16")
                .attr("transform", (x, y, z) => {
                    let l = -margin.right;
                    let h = (height - z[0].getBoundingClientRect().width) / 2;
                    return "translate(" + l + "," + h + ") rotate(-90) ";
                });


            // Bars selection and updating
            // -----------------------------------------------------------------------------------------------------
            let bars = svg.selectAll(".graphbar").data(data);

            // animate transition
            bars
                .attr("width", x.bandwidth())
                .attr("x", function(d) { return x(d.name); })
                .transition().duration(1000)
                .attr("y", function(d) { return y(d.value); })
                .attr("height", function(d) { return height - y(d.value); })
                .select('title')
                .text((d) => {
                        // TODO: handle Obfuscation and Sketches
                        // i2b2.PM.model.isObfuscated
                        let val = parseInt(d.value).toLocaleString();
                        if (d.display) val = d.display;
                        return "[ " + val + " patients ]\n" + d.name.trim()
                });

            // create bars for new data
            bars.enter().append("rect")
                .classed("graphbar", true)
                .attr("x", function(d) { return x(d.name); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { return height - y(d.value); })
                .append("title")
                .text((d) => {
                    // TODO: handle Obfuscation and Sketches
                    // i2b2.PM.model.isObfuscated
                    let val = parseInt(d.value).toLocaleString();
                    if (d.display) val = d.display;
                    return "[ " + val + " patients ]\n" + d.name.trim()
                  });

            // delete bars when data is removed
            bars.exit().transition().duration(1000)
                .attr('height', 0)
                .remove();

            // update the viewport element to the height of the visualization
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";

        } catch(e) {
            console.error("Error in QueryStatus:BarGraph.update()");
        }
    }

    redraw(width) {
        try {
            this.width = width;
            this.update();
            // this.config.displayEl.innerHTML = "{" + this.constructor.name + "} is " + width + " pixels wide";
        } catch(e) {
            console.error("Error in QueryStatus:BarGraph.redraw()");
        }
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            this.isVisible = true;
            this.config.displayEl.style.display = 'block';
            this.config.dropdownEl.style.display = 'block';
            this.config.parentTitleEl.innerHTML = this.record.title;
            // update the size
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:BarGraph.show()");
        }
    }

    hide() {
        try {
            this.config.displayEl.style.display = 'none';
            this.config.dropdownEl.style.display = 'none';
            this.isVisible = false;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:BarGraph.hide()");
        }
    }
}


// =======================================================================================================================


const shortenLabel = function(inText, maxLen) {
    if (inText.length > maxLen) {
        let tpos = inText.indexOf(" ",parseInt(maxLen * 0.75));
        if (tpos > 0 && tpos <= maxLen) {
            return inText.substring(0, tpos);
        } else {
            return inText.substring(0, maxLen-3) + "...";
        }
    } else {
        return inText;
    }
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