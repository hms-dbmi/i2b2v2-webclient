const margin = { top: 20, right: 20, bottom: 70, left: 60 };

export default class PathogenTimeline {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;

            // --- Parse initial data (if any) ---
            let processedData = {};
            if (
                qrsData !== null &&
                typeof qrsData === "object" &&
                qrsData.constructor.name === "XMLDocument"
            ) {
                let resultXML = i2b2.h.XPath(qrsData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    processedData = parseData(resultXML, this.config.advancedConfig);
                }
            }

            this.data = { old: processedData, new: processedData };
            this.wastewater = null;
            this.isVisible = false;

            // Dimensions (similar to BarGraph/LineChart)
            this.width = this.config.displayEl.parentElement.clientWidth;
            this.height = 400 - margin.top - margin.bottom;

            // --- Controls ---
            this.controls = {
                disease: document.getElementById("pathDiseaseSelect") || null,
                site: document.getElementById("siteSelect") || null,
                overlay: document.getElementById("overlaySelect") || null
            };

            if (this.controls.disease)
                this.controls.disease.addEventListener("change", () => this.update());
            if (this.controls.site)
                this.controls.site.addEventListener("change", () => this.update());
            if (this.controls.overlay)
                this.controls.overlay.addEventListener("change", () => this.update());

            // --- SVG ---
            this.svgRoot = d3
                .select(this.config.displayEl)
                .append("svg")
                .attr("width", "100%")
                .attr("height", this.height + margin.top + margin.bottom);

            this.svg = this.svgRoot
                .append("g")
                .classed("svg-body", true)
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // --- Load wastewater asynchronously ---
            fetchWastewater("1/01/2020", "1/01/2025").then(data => {
                this.wastewater = data;
                this.update(); // re-render once overlay is available
            });

        } catch (e) {
            console.error("Error in QueryStatus:PathogenTimeline.constructor()", e);
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
            // --- Load / refresh breakdown data ---
            if (typeof inputData !== "undefined") {
                this.data.old = this.data.new;

                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    this.data.new = parseData(resultXML, this.config.advancedConfig);
                }
            }

            const raw = this.data?.new?.result;
            if (!raw || raw.length === 0) return;

            // --- Read current filter selections (with safe fallbacks) ---
            const selectedDisease = this.controls.disease?.value || "(All)";
            const selectedSite = this.controls.site?.value || "(Combined)";
            const selectedOverlay = this.controls.overlay?.value || "(None)";

            // --- Apply filtering ---
            const filtered = filterBreakdown(raw, selectedDisease, selectedSite);

            // --- Draw chart with filtered data ---
            this.draw(filtered, selectedOverlay);

            // Resize container height to fit viz
            if (this.isVisible) {
                this.config.displayEl.parentElement.style.height =
                    this.config.displayEl.scrollHeight + "px";
            }
        } catch (e) {
            console.error("Error in QueryStatus:PathogenTimeline.update()", e);
            return false;
        }
        return true;
    }

    // ------------------------------------------------------------------
   draw(records, selectedOverlay) {
        if (!records || records.length === 0) {
            this.svg.selectAll("*").remove();
            return;
        }

        const width = this.width - margin.left - margin.right;
        const height = this.height;

        this.svg.selectAll("*").remove();
        const seriesByDisease = d3.group(records, d => d.disease);

        // --- Setup X scale ---
        const allDates = records.map(d => d.date);
        const xExtent = d3.extent(allDates);
        const xScale = d3.scaleTime().domain(xExtent).range([0, width]);

        // --- Determine Y max including wastewater (if visible) ---
        let maxY = d3.max(records, d => d.value);

        let wwPoints = [];
        if (selectedOverlay !== "(None)" && Array.isArray(this.wastewater)) {
            wwPoints = this.wastewater.map(d => ({
                date: new Date(d.date),
                value: d.value
            }));
            wwPoints.sort((a, b) => a.date - b.date);

            const wwMax = d3.max(wwPoints, d => d.value);
            if (wwMax > maxY) maxY = wwMax;
        }

        const yScale = d3
            .scaleLinear()
            .domain([0, maxY])
            .nice()
            .range([height, 0]);

        // --- Axes ---
        this.svg.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(
                d3.axisBottom(xScale)
                    .ticks(10)
                    .tickFormat(d3.timeFormat("%Y-%m"))
            )
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        const yAxis = this.svg.append("g")
            .classed("y-axis", true)
            .call(d3.axisLeft(yScale).tickFormat(d3.format(".2~s")));

        yAxis.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("letter-spacing", "1.16")
            .attr("transform", `translate(-30, ${height / 2}) rotate(-90)`)
            .text("Number of Patients");

        // --- Disease Colors ---
        const color = d3.scaleOrdinal()
            .domain([...seriesByDisease.keys()])
            .range(d3.schemeCategory10);

        // --- Line generator ---
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));

        // --- Draw disease series ---
        for (let [disease, rows] of seriesByDisease.entries()) {
            rows = rows.slice().sort((a, b) => a.date - b.date);

            this.svg.append("path")
                .datum(rows)
                .attr("fill", "none")
                .attr("stroke", color(disease))
                .attr("stroke-width", 2)
                .attr("d", line);

            this.svg.selectAll(`circle.point-${cssSafeKey(disease)}`)
                .data(rows)
                .enter()
                .append("circle")
                .attr("class", `timeline-point point-${cssSafeKey(disease)}`)
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yScale(d.value))
                .attr("r", 4)
                .attr("fill", color(disease))
                .append("title")
                .text(d => {
                    let val = d.display || i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(d.value);
                    return `${d.disease} — ${d.dateStr}\n[ ${val} patients ]`;
                });
        }

        // --- Add wastewater overlay ---
        if (selectedOverlay !== "(None)" && wwPoints.length > 0) {

            this.svg.append("path")
                .datum(wwPoints)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4 3")
                .attr("d", line);

            this.svg.selectAll(".ww-point")
                .data(wwPoints)
                .enter()
                .append("circle")
                .attr("class", "ww-point")
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yScale(d.value))
                .attr("r", 3)
                .attr("fill", "black")
                .append("title")
                .text(d => `Wastewater – ${d.date.toISOString().slice(0, 10)}\n${d.value}`);
        }
    }


    // ------------------------------------------------------------------
    redraw(width) {
        try {
            this.width = width;
            this.update();
        } catch (e) {
            console.error("Error in QueryStatus:PathogenTimeline.redraw()", e);
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
            console.error("Error in QueryStatus:PathogenTimeline.show()", e);
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
            console.error("Error in QueryStatus:PathogenTimeline.hide()", e);
        }
    }
}

// ======================================================================
// parseData — parse PathogenTimeline breakdown into structured rows
// ======================================================================

let parseData = function (xmlData, advancedConfig) {
    let breakdown = {};
    breakdown.result = [];

    // Normal breakdown rows
    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    if (params.length === 0) return breakdown;

    for (let p of params) {
        let column = p.getAttribute("column");
        if (!column) continue;

        let [disease, dateStr] = column.split("|");
        if (!disease || !dateStr) continue;

        disease = disease.trim();
        dateStr = dateStr.trim();

        let date = new Date(dateStr);

        // Optional site attribute if the breakdown provides it
        let site =
            p.getAttribute("site") ||
            p.getAttribute("SITE") ||
            p.getAttribute("siteId") ||
            "(Combined)";

        // Numeric value
        let value = parseInt(p.textContent);
        value = isNaN(value) ? 0 : value;

        // New obfuscation signature
        const floorThreshold = p.getAttribute("floorThresholdNumber");
        const obfuscateNumber = p.getAttribute("obfuscatedDisplayNumber");
        let display = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(
            value,
            floorThreshold,
            obfuscateNumber
        );

        // Server-specified display override
        if (typeof p.attributes.display !== "undefined") {
            value = i2b2.h.Unescape(value);
            display = p.attributes.display.textContent;
        }

        // Advanced filtering
        let include = true;
        if (advancedConfig) {
            // hideZeros
            if (advancedConfig.hideZeros === true && value === 0) {
                include = false;
            }

            // hideEntries (match on disease or full column label)
            if (Array.isArray(advancedConfig.hideEntries)) {
                if (
                    advancedConfig.hideEntries.includes(disease) ||
                    advancedConfig.hideEntries.includes(column)
                ) {
                    include = false;
                }
            }
        }

        if (!include) continue;

        breakdown.result.push({
            disease,
            date,
            dateStr,
            site,
            value,
            display
        });
    }

    // SHRINE section — unchanged pattern (kept for completeness, though
    // PathogenTimeline may or may not need it)
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
                        name: $("<div>")
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

// ======================================================================
// Helpers
// ======================================================================

function filterBreakdown(rows, diseaseFilter, siteFilter) {
    if (!rows) return [];

    return rows.filter(row => {
        let diseaseOk =
            !diseaseFilter ||
            diseaseFilter === "(All)" ||
            diseaseFilter === "ALL" ||
            row.disease === diseaseFilter;

        let siteOk =
            !siteFilter ||
            siteFilter === "(Combined)" ||
            siteFilter === "ALL" ||
            row.site === siteFilter;

        return diseaseOk && siteOk;
    });
}

// Make a string safe to use as a CSS class fragment
function cssSafeKey(str) {
    return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function fetchWastewater(startDate, endDate) {

    const msg = `
        <ns6:request
            xmlns:ns6="http://www.i2b2.org/xsd/hive/msg/1.1/">
            <message_header>
                <proxy>
                    <redirect_url>
                        http://shrine-masscpr-dev-hub-i2b2.catalyst.harvard.edu:9090/i2b2/services/ExternalDataService/getWasteWaterData
                    </redirect_url>
                </proxy>
            </message_header>

            <message_body>
                { "Start Date":"${startDate}", "End Date":"${endDate}" }
            </message_body>
        </ns6:request>
    `;

    const response = await i2b2.hive.proxy.handler({
        url: "/~proxy",
        msg: msg,
        method: "POST"
    });

    // response contains an XML envelope that includes JSON text
    const jsonText = i2b2.h.XPath(response.refXML, "//message_body/text()")[0]
        .nodeValue;

    return JSON.parse(jsonText);
}
