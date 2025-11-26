const margin = { top: 20, right: 20, bottom: 70, left: 60 };

export default class LineChart {

    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;

            let processedData = {};
            if (qrsData !== null &&
                typeof qrsData === "object" &&
                qrsData.constructor.name === "XMLDocument") {
                let resultXML = i2b2.h.XPath(qrsData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    processedData = parseData(resultXML, this.config.advancedConfig);
                }
            }

            this.data = { old: processedData, new: processedData };
            this.isVisible = false;

            // Width follows BarGraph convention
            this.width = this.config.displayEl.parentElement.clientWidth;
            this.height = 400;

            this.svg = d3.select(this.config.displayEl)
                .append("svg")
                .attr("width", "100%")
                .attr("height", this.height)
                .append("g")
                .classed("LineChart", true);

        } catch (e) {
            console.error("Error in QueryStatus:LineChart.constructor()", e);
        }
    }

    // ------------------------------------------------------------------
    destroy() {
        delete this.config.displayEl;
        delete this.config;
        delete this.record;
        delete this.data;
    }

    // ------------------------------------------------------------------
   update(inputData) {
    try {

        //Load incoming breakdown data

        if (typeof inputData === "undefined") {
            if (Object.keys(this.data.new).length === 0) return;
        } else {
            this.data.old = this.data.new;

            let resultXML = i2b2.h.XPath(inputData, "//xml_value");
            if (resultXML.length > 0) {
                resultXML = resultXML[0].firstChild.nodeValue;
                this.data.new = parseData(resultXML, this.config.advancedConfig);
            }
            if (!this.data.new) return;
        }

        const raw = this.data.new.result;
        if (!raw || raw.length === 0) return;


        // Normalize into points

        const points = raw.map(r => ({
            name: r.name.trim(),
            value: Number(r.value),
            display: r.display ?? null
        }));

        // Clear old SVG contents

        this.svg.selectAll("*").remove();


        // Dimensioning

        const width = this.width - margin.left - margin.right;
        const height = this.height - margin.top - margin.bottom;

        const g = this.svg
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales

        const xScale = d3.scalePoint()
            .domain(points.map(p => p.name))
            .range([0, width])
            .padding(0.5);

        const maxY = d3.max(points, d => d.value);
        const yScale = d3.scaleLinear()
            .domain([0, maxY])
            .range([height, 0]);

        //Axes
        g.selectAll(".x-axis").remove();
        g.selectAll(".y-axis").remove();

        // X-Axis
        g.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

            // Y Axis
            const yAxis = g.append("g")
                .classed("y-axis", true)
                .call(d3.axisLeft(yScale).tickFormat(d3.format(".2~s")));

            // ---- Y AXIS LABEL (Correct & matching BarGraph) ----
            yAxis.append("text")
                .attr("class", "y-label")
                .attr("fill", "var(--text-primary-dark)")
                .text("Number of Patients")
                .attr("letter-spacing", "1.16")
                .attr("transform", function(_, i, nodes) {
                    const axisNode = nodes[i];
                    const axisWidth = axisNode.getBBox().width;   // <-- use getBBox(), not getBoundingClientRect()
                    const labelX = -margin.left + 15;             // ← EXACT BarGraph offset
                    const labelY = (height - axisWidth) / 2;
                    return `translate(${labelX},${labelY}) rotate(-90)`;
                });


        //Line generator and drawing
        const line = d3.line()
            .x(d => xScale(d.name))
            .y(d => yScale(d.value));

        g.append("path")
            .datum(points)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Circles + tooltips
        g.selectAll("circle")
            .data(points)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.name))
            .attr("cy", d => yScale(d.value))
            .attr("r", 4)
            .attr("fill", "steelblue")
            .append("title")
            .text(d => {
                const v = d.display ?? d.value.toLocaleString();
                return `${d.name}\n${v} patients`;
            });

        // Resize container

        if (this.isVisible) {
            this.config.displayEl.parentElement.style.height =
                this.config.displayEl.scrollHeight + "px";
        }

    } catch (e) {
        console.error("Error in QueryStatus:LineChart.update()", e);
        return false;
    }

    return true;
}


    // ------------------------------------------------------------------
    redraw(width) {
        try {
            this.width = width;
            this.update();
        } catch (e) {
            console.error("Error in QueryStatus:LineChart.redraw()", e);
        }
    }

    // ------------------------------------------------------------------
    show() {
        try {
            this.isVisible = true;
            this.config.displayEl.style.display = "block";
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = "block";
            if (this.config.parentTitleEl) {
                this.config.parentTitleEl.innerHTML = this.record.title;
            }

            this.config.displayEl.parentElement.style.height =
                this.config.displayEl.scrollHeight + "px";

            return true;
        } catch (e) {
            console.error("Error in QueryStatus:LineChart.show()", e);
        }
    }

    // ------------------------------------------------------------------
    hide() {
        try {
            this.config.displayEl.style.display = "none";
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = "none";
            this.isVisible = false;
            return true;
        } catch (e) {
            console.error("Error in QueryStatus:LineChart.hide()", e);
        }
    }
}


// ======================================================================
// parseData — combined aspects of bargraph and piechart
// ======================================================================

let parseData = function (xmlData, advancedConfig) {
    let breakdown = {};
    breakdown.result = [];

    // Normal breakdown rows
    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    if (params.length === 0) return breakdown;

    for (let p of params) {
        let entryRecord = {};

        entryRecord.name = $('<div>')
            .html(p.getAttribute("column"))
            .text()
            .trim();

        entryRecord.value = p.firstChild.nodeValue;
        entryRecord.display = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(entryRecord.value);

        // Server-specified `display` attribute override
        if (typeof p.attributes.display !== "undefined") {
            entryRecord.value = i2b2.h.Unescape(entryRecord.value);
            entryRecord.display = p.attributes.display.textContent;
        }

        // Advanced filtering rules
        let include = true;

        if (advancedConfig !== undefined) {
            // hideZeros
            if (advancedConfig.hideZeros === true &&
                parseInt(entryRecord.value) === 0) {
                include = false;
            }

            // hideEntries
            if (Array.isArray(advancedConfig.hideEntries) &&
                advancedConfig.hideEntries.includes(entryRecord.name.trim())) {
                include = false;
            }
        }

        if (include) {
            breakdown.result.push(entryRecord);
        }
    }

    // SHRINE section (unchanged)
    let ShrineNode = i2b2.h.XPath(xmlData, "descendant::SHRINE");
    if (ShrineNode.length) {
        let ShrineData = {
            complete: ShrineNode[0].getAttribute("complete"),
            error: ShrineNode[0].getAttribute("error"),
            sites: []
        };

        for (let site of i2b2.h.XPath(ShrineNode[0], "site")) {
            let siteData = {};

            for (let attrib of site.attributes) {
                siteData[attrib.name] = attrib.value;
            }

            let siteResults = i2b2.h.XPath(site, "siteresult");
            if (siteResults.length) {
                siteData.results = [];
                for (let siteresult of siteResults) {
                    siteData.results.push({
                        name: $('<div>')
                            .html(siteresult.getAttribute("column"))
                            .text(),
                        value: parseInt(siteresult.textContent)
                    });
                }
            }

            ShrineData.sites.push(siteData);
        }

        breakdown.SHRINE = ShrineData;
    }

    return breakdown;
};

