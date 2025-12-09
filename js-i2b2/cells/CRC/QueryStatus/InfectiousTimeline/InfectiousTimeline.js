const margin = { top: 20, right: 20, bottom: 70, left: 60 };

export default class InfectiousTimeline {
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
            this.isVisible = false;

            // Dimensions (similar to BarGraph/LineChart)
            if (typeof this.width === "undefined") {
                this.width = this.config.displayEl.parentElement.clientWidth;
            }
            this.height = 400 - margin.top - margin.bottom;

            // --- Controls (may be absent in early phases) ---
            this.controls = {
                disease: document.getElementById("infDiseaseSelect") || null,
                site: document.getElementById("siteSelect") || null,
                overlay: document.getElementById("overlaySelect") || null
            };

            if (this.controls.disease) {
                this.controls.disease.addEventListener("change", () => this.update());
            }
            if (this.controls.site) {
                this.controls.site.addEventListener("change", () => this.update());
            }
            if (this.controls.overlay) {
                this.controls.overlay.addEventListener("change", () => this.update());
            }

            // --- SVG scaffolding ---
            this.svgRoot = d3
                .select(this.config.displayEl)
                .append("svg")
                .attr("width", "100%")
                .attr("height", this.height + margin.top + margin.bottom);

            this.svg = this.svgRoot
                .append("g")
                .classed("svg-body", true)
                .attr("transform", `translate(${margin.left},${margin.top})`);
        } catch (e) {
            console.error("Error in QueryStatus:InfectiousTimeline.constructor()", e);
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
            if (typeof inputData === "undefined") {
                if (!this.data.new || Object.keys(this.data.new).length === 0) return;
            } else {
                // shift previous data
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

            // --- Read current filter selections (with safe fallbacks) ---
            const selectedDisease = this.controls.disease
                ? this.controls.disease.value
                : "(All)";

            const selectedSite = this.controls.site
                ? this.controls.site.value
                : "(Combined)";

            const selectedOverlay = this.controls.overlay
                ? this.controls.overlay.value
                : "(None)";

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
            console.error("Error in QueryStatus:InfectiousTimeline.update()", e);
            return false;
        }
        return true;
    }

    // ------------------------------------------------------------------
    draw(records, selectedOverlay) {
        // TODO: hook selectedOverlay into wastewater overlay once the API is wired
        if (!records || records.length === 0) {
            this.svg.selectAll("*").remove();
            return;
        }

        // --- Dimensions ---
        const width = this.width - margin.left - margin.right;
        const height = this.height; // already margin-adjusted in constructor

        // --- Clear previous contents ---
        this.svg.selectAll("*").remove();

        // --- Group by disease -> multiple curves ---
        const seriesByDisease = d3.group(records, d => d.disease);

        // --- X scale (time) ---
        const allDates = records.map(d => d.date);
        const xExtent = d3.extent(allDates);
        const xScale = d3
            .scaleTime()
            .domain(xExtent)
            .range([0, width]);

        // --- Y scale (patient counts) ---
        const maxY = d3.max(records, d => d.value);
        const yScale = d3
            .scaleLinear()
            .domain([0, maxY])
            .nice()
            .range([height, 0]);

        // --- Axes ---
        // X axis
        this.svg
            .append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(
                d3
                    .axisBottom(xScale)
                    .ticks(10)
                    .tickFormat(d3.timeFormat("%Y-%m"))
            )
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Y axis
        const yAxis = this.svg
            .append("g")
            .classed("y-axis", true)
            .call(d3.axisLeft(yScale).tickFormat(d3.format(".2~s")));

        // Y-axis label (like BarGraph / LineChart)
        yAxis
            .append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("letter-spacing", "1.16")
            .attr("transform", `translate(${-30}, ${height / 2}) rotate(-90)`)
            .text("Number of Patients");

        // --- Color scale for diseases ---
        const diseases = Array.from(seriesByDisease.keys());
        const color = d3
            .scaleOrdinal()
            .domain(diseases)
            .range(d3.schemeCategory10);

        // --- Line generator ---
        const line = d3
            .line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value));

        // --- Draw each disease series ---
        for (let [disease, rows] of seriesByDisease.entries()) {
            // Sort rows by date to ensure a proper line
            rows = rows.slice().sort((a, b) => a.date - b.date);

            // Path
            this.svg
                .append("path")
                .datum(rows)
                .attr("fill", "none")
                .attr("stroke", color(disease))
                .attr("stroke-width", 2)
                .attr("d", line);

            // Points + tooltips
            this.svg
                .selectAll(`circle.point-${cssSafeKey(disease)}`)
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
                    // use precomputed display, but fall back to obfuscation
                    let val = d.display;
                    if (!val) {
                        val = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(
                            d.value
                        );
                    }
                    return `${d.disease} — ${d.dateStr}\n[ ${val} patients ]`;
                });
        }
    }

    // ------------------------------------------------------------------
    redraw(width) {
        try {
            this.width = width;
            this.update();
        } catch (e) {
            console.error("Error in QueryStatus:InfectiousTimeline.redraw()", e);
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
            console.error("Error in QueryStatus:InfectiousTimeline.show()", e);
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
            console.error("Error in QueryStatus:InfectiousTimeline.hide()", e);
        }
    }
}

// ======================================================================
// parseData — parse InfectiousTimeline breakdown into structured rows
// ======================================================================

let parseData = function (xmlData, advancedConfig) {
    let breakdown = {};
    breakdown.result = [];

    // Normal breakdown rows
    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    if (params.length === 0) return breakdown;

    for (let p of params) {
        // Example column: "COVID|2020-01-05"
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
    // InfectiousTimeline may or may not need it)
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
