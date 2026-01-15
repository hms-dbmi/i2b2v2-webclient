const DISEASE_REGISTRY = {
    diseases: {
        "COVID-19": { key: "COVID-19", label: "COVID-19", color: "#1f77b4", order: 1, aliases: ["COVID-19", "COVID19", "SARS-COV-2"] },
        "Influenza": { key: "Influenza", label: "Influenza", color: "#ff7f0e", order: 2, aliases: ["INFLUENZA"] },
        "RSV": { key: "RSV", label: "RSV", color: "#2ca02c", order: 3, aliases: ["RSV"] }
    },
    canonicalize(raw) {
        const key = raw.trim().toUpperCase();
        for (const disease of Object.values(this.diseases)) {
            if (disease.aliases.includes(key)) {
                return disease.key;
            }
        }
        return raw.trim();
    }
};

const WASTEWATER_REGISTRY = {
    wastewater_sources: {
        "mwra-north": { label: "Wastewater (MWRA-North)", color: "#333", order: 1, accessor: (row) => Number(row["Northern 7 day avg"]) },
        "mwra-south": { label: "Wastewater (MWRA-South)", color: "#333", order: 2, accessor: (row) => Number(row["Southern 7 day avg"]) },
        "mwra-combined": { label: "Wastewater (Combined)", color: "#333", order: 3, accessor: (row) => (Number(row["Northern 7 day avg"]) || 0) + (Number(row["Southern 7 day avg"]) || 0) }
    }
};

const margin = { top: 20, right: 80, bottom: 70, left: 60 };

export default class PathogenTimeline {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;

            this.data = { old: {}, new: {} };
            this.wastewater = null;
            this.isVisible = false;

            this.width = this.config.displayEl.parentElement.clientWidth;
            this.height = 400 - margin.top - margin.bottom;

            this.config.displayEl.style.display = "none";
            const self = this;

            if (
                qrsData &&
                typeof qrsData === "object" &&
                qrsData.constructor.name === "XMLDocument"
            ) {
                let resultXML = i2b2.h.XPath(qrsData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    this.data.new = parseData(resultXML, this.config.advancedConfig);
                }
            }

            (async function () {
                let response = await fetch(
                    i2b2.CRC.QueryStatus.baseURL + "PathogenTimeline/PathogenTimeline.html"
                );

                if (!response.ok) {
                    console.error("Failed to load PathogenTimeline.html");
                    return;
                }

                const templateText = await response.text();
                self.config.template = Handlebars.compile(templateText);

                $(self.config.template({})).appendTo(self.config.displayEl);

                // Cache controls (SCOPED)
                self.controls = {
                    disease: $(".path-disease-select", self.config.displayEl)[0],
                    overlay: $(".path-overlay-select", self.config.displayEl)[0],
                    view: $(".path-view-select", self.config.displayEl)[0],
                    legend: $(".path-legend-items", self.config.displayEl)[0],
                };

                // Add all/none options
                $(self.controls.disease).append('<option value="(All)">(All)</option>');
                $(self.controls.overlay).append('<option value="(None)">(None)</option>');

                // Default view if missing
                if (self.controls.view && !self.controls.view.value) {
                    self.controls.view.value = "month";
                }

                // Populate disease dropdown
                Object.entries(DISEASE_REGISTRY.diseases)
                    .sort(([, a], [, b]) => a.order - b.order)
                    .forEach(([key, disease]) => {
                        $(self.controls.disease).append(
                            `<option value="${key}">${disease.label}</option>`
                        );
                    });

                // Populate overlay dropdown
                Object.entries(WASTEWATER_REGISTRY.wastewater_sources)
                    .sort(([, a], [, b]) => a.order - b.order)
                    .forEach(([key, wastewater_source]) => {
                        $(self.controls.overlay).append(
                            `<option value="${key}">${wastewater_source.label}</option>`
                        );
                    });

                if (self.controls.disease) {
                    $(self.controls.disease).on("change", () => self.update());
                }

                if (self.controls.overlay) {
                    $(self.controls.overlay).on("change", () => self.update());
                }

                if (self.controls.view) {
                    $(self.controls.view).on("change", () => self.update());
                }

                // Create SVG
                self.svgRoot = d3
                    .select($(".path-timeline-svg-container", self.config.displayEl)[0])
                    .append("svg")
                    .attr("width", "100%")
                    .attr("height", self.height + margin.top + margin.bottom);

                self.svg = self.svgRoot
                    .append("g")
                    .classed("svg-body", true)
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                self.config.displayEl.style.display = "block";

                // Load wastewater
                fetchWastewater("3/1/2020", "11/1/2025").then(data => {
                    if (Array.isArray(data)) {
                        self.wastewater = data;
                    } else if (data?.data && Array.isArray(data.data)) {
                        self.wastewater = data.data;
                    } else if (data?.result && Array.isArray(data.result)) {
                        self.wastewater = data.result;
                    } else {
                        console.warn("Unrecognized wastewater payload shape", data);
                        self.wastewater = [];
                    }
                    self.update();
                });

                self.update();
            }).call(this);

        } catch (e) {
            console.error("Error in QueryStatus:PathogenTimeline.constructor()", e);
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

            const selectedDisease = this.controls.disease?.value || "(All)";
            const selectedOverlay = this.controls.overlay?.value || "(None)";
            const selectedView = this.controls.view?.value || "month"; // "month" | "year"

            const filtered = filterBreakdown(raw, selectedDisease);

            const diseasesInView = filtered.map(row => row.disease);
            const currentKeys = Array.from(new Set(diseasesInView));

            // Clear legend
            this.controls.legend.innerHTML = "";

            currentKeys.forEach((key) => {
                const diseaseConfig = DISEASE_REGISTRY.diseases[key];
                if (!diseaseConfig) return;
                $(this.controls.legend).append(
                    `<div class="d-flex align-items-center gap-2">
                        <span class="legend-swatch" style="background:${diseaseConfig.color}"></span>
                        <span>${diseaseConfig.label}</span>
                    </div>`
                );
            });

            const hasWastewater = (selectedOverlay !== "(None)");
            if (hasWastewater) {
                const waterConfig = WASTEWATER_REGISTRY.wastewater_sources[selectedOverlay];
                if (waterConfig) {
                    $(this.controls.legend).append(
                        `<div class="d-flex align-items-center gap-2">
                            <span class="legend-swatch" style="background:${waterConfig.color}"></span>
                            <span>Wastewater</span>
                        </div>`
                    );
                }
            }

            this.draw(filtered, selectedOverlay, selectedView);

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

    draw(records, selectedOverlay, selectedView) {
        if (!records || records.length === 0) {
            this.svg.selectAll("*").remove();
            return;
        }

        const width = this.width - margin.left - margin.right;
        const height = this.height;

        this.svg.selectAll("*").remove();

        // -----------------------------
        // Bucket + aggregate patient records by month/year
        // -----------------------------
        const bucketedPatients = aggregatePatientsByView(records, selectedView);

        // If (for some reason) nothing survived bucketing, bail cleanly
        if (!bucketedPatients || bucketedPatients.length === 0) {
            return;
        }

        // Group disease series
        const seriesByDisease = d3.group(bucketedPatients, d => d.disease);

        // LEFT Y SCALE (patients)
        const maxPatients = d3.max(bucketedPatients, d => d.value);
        const yLeft = d3.scaleLinear()
            .domain([0, maxPatients || 0])
            .nice()
            .range([height, 0]);

        // -----------------------------
        // RIGHT Y SCALE (wastewater)
        // -----------------------------
        let yRight = null;
        let wwPoints = [];
        let wwConfig = null;

        if (selectedOverlay !== "(None)" && this.wastewater && this.wastewater.length > 0) {
            const overlayConfig = WASTEWATER_REGISTRY.wastewater_sources[selectedOverlay];
            wwConfig = overlayConfig;

            if (!overlayConfig || typeof overlayConfig.accessor !== "function") {
                console.warn("Unknown wastewater overlay:", selectedOverlay);
                wwPoints = [];
                yRight = null;
            } else {
                const wwRollup = d3.rollup(
                    this.wastewater,
                    rows => {
                        const values = rows
                            .map(row => overlayConfig.accessor(row))
                            .filter(v => v !== null && v !== undefined && !isNaN(v));
                        return values.length ? d3.mean(values) : null;
                    },
                    d => {
                        // IMPORTANT: parse as LOCAL Y-M-D to avoid 2019/2020 boundary bugs
                        const dt = parseYMDLocal(d["Sample Date"]);
                        if (!dt) return null;

                        if (selectedView === "year") {
                            return `${dt.getFullYear()}`;
                        }
                        // month (0-based month key, used consistently below)
                        return `${dt.getFullYear()}-${dt.getMonth()}`;
                    }
                );

                wwPoints = Array.from(wwRollup.entries())
                    .filter(([k, v]) => k !== null && v !== null)
                    .map(([key, value]) => {
                        if (selectedView === "year") {
                            const year = Number(key);
                            const date = new Date(year, 0, 1);
                            return { date, value };
                        }
                        const [year, month] = key.split("-").map(Number);
                        const date = new Date(year, month, 1);
                        return { date, value };
                    })
                    .filter(p => p.date instanceof Date && !isNaN(p.date.getTime()));

                if (wwPoints.length > 0) {
                    yRight = d3.scaleLinear()
                        .domain([0, d3.max(wwPoints, d => d.value)])
                        .nice()
                        .range([height, 0]);
                }
            }
        }

        // -----------------------------
        // X SCALE (respect patient breakdown only)
        // -----------------------------
        const patientExtent = d3.extent(bucketedPatients, d => d.date);

        // Guard: if extent is bad, bail
        if (!patientExtent[0] || !patientExtent[1]) {
            return;
        }

        const xScale = d3.scaleTime()
            .domain(patientExtent)
            .range([0, width]);

        // Clip overlay points to patient domain so overlay can't expand x-axis earlier/later
        if (wwPoints.length && patientExtent[0] && patientExtent[1]) {
            const x0 = patientExtent[0].getTime();
            const x1 = patientExtent[1].getTime();

            wwPoints = wwPoints.filter(p => {
                const t = p.date.getTime();
                return t >= x0 && t <= x1;
            });

            // Recompute yRight after clipping (so right axis matches visible overlay)
            if (wwPoints.length > 0) {
                yRight = d3.scaleLinear()
                    .domain([0, d3.max(wwPoints, d => d.value)])
                    .nice()
                    .range([height, 0]);
            } else {
                yRight = null;
            }
        }

        // -----------------------------
        // AXES
        // -----------------------------
        const tickFormat = (selectedView === "year")
            ? d3.timeFormat("%Y")
            : d3.timeFormat("%Y-%m");

        // X axis
        this.svg.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(xScale)
                    .ticks(10)
                    .tickFormat(tickFormat)
            )
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Left Y axis
        const yAxisLeft = this.svg.append("g")
            .classed("y-axis left", true)
            .call(d3.axisLeft(yLeft).tickFormat(d3.format(".2~s")));

        yAxisLeft.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(${-40}, ${height / 2}) rotate(-90)`)
            .text("Number of Patients");

        // Right Y axis (wastewater)
        if (yRight) {
            const yAxisRight = this.svg.append("g")
                .classed("y-axis right", true)
                .attr("transform", `translate(${width},0)`)
                .call(d3.axisRight(yRight));

            yAxisRight.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "middle")
                .attr("transform", `translate(40, ${height / 2}) rotate(90)`)
                .text("Wastewater Level");
        }

        // -----------------------------
        // LINE GENERATORS
        // -----------------------------
        const patientLine = d3.line()
            .x(d => xScale(d.date))
            .y(d => yLeft(d.value));

        const wastewaterLine = yRight
            ? d3.line()
                .x(d => xScale(d.date))
                .y(d => yRight(d.value))
            : null;

        // -----------------------------
        // DRAW DISEASE LINES + POINTS
        // -----------------------------
        for (let [disease, rows] of seriesByDisease.entries()) {
            rows = rows.slice().sort((a, b) => a.date - b.date);
            const color = DISEASE_REGISTRY.diseases[disease]?.color || "#999";

            // Line
            this.svg.append("path")
                .datum(rows)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("d", patientLine);

            // Points
            this.svg.selectAll(`circle.${cssSafeKey(disease)}`)
                .data(rows)
                .enter()
                .append("circle")
                .attr("class", `point ${cssSafeKey(disease)}`)
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yLeft(d.value))
                .attr("r", 4)
                .attr("fill", color)
                .attr("stroke", color)
                .append("title")
                .text(d => {
                    const label = tickFormat(d.date);
                    return `${d.diseaseRaw ?? d.disease} — ${label}\n[ ${d.display ?? d.value} patients ]`;
                });
        }

        // -----------------------------
        // DRAW WASTEWATER OVERLAY
        // -----------------------------
        if (wastewaterLine && wwPoints.length) {
            wwPoints.sort((a, b) => a.date - b.date);

            // Line
            this.svg.append("path")
                .datum(wwPoints)
                .attr("fill", "none")
                .attr("stroke", wwConfig.color)
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4 3")
                .attr("d", wastewaterLine);

            // Points
            this.svg.selectAll(".ww-point")
                .data(wwPoints)
                .enter()
                .append("circle")
                .attr("class", "ww-point")
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yRight(d.value))
                .attr("r", 3)
                .attr("fill", wwConfig.color)
                .attr("stroke", wwConfig.color)
                .append("title")
                .text(d => {
                    const label = tickFormat(d.date);
                    return `Wastewater\n${label}\n${d.value}`;
                });
        }
    }

    redraw(width) {
        try {
            this.width = width;
            this.update();
        } catch (e) {
            console.error("Error in QueryStatus:PathogenTimeline.redraw()", e);
        }
    }

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

    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    if (params.length === 0) return breakdown;

    for (let p of params) {
        const column = p.getAttribute("column");
        if (!column) continue;

        // Expected format:
        // Site ^ YYYY-MM-DD ^ YYYY Mon ^ Disease
        const parts = column.split("^");
        if (parts.length < 4) continue;

        const site = parts[0].trim();
        const dateStr = parts[1].trim();
        const label = parts[2].trim();
        const diseaseRaw = parts[3].trim();
        const disease = DISEASE_REGISTRY.canonicalize(diseaseRaw);

        // IMPORTANT: parse as LOCAL Y-M-D to avoid 2019/2020 boundary bugs
        const date = parseYMDLocal(dateStr);
        if (!date) continue;

        const rawText = p.textContent.trim();

        let value = NaN;
        const numberMatch = rawText.match(/\d+/);
        if (numberMatch) {
            value = parseInt(numberMatch[0], 10);
        }
        if (isNaN(value)) value = 0;

        let include = true;
        if (advancedConfig) {
            if (advancedConfig.hideZeros === true && value === 0) {
                include = false;
            }

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
            site,
            disease,
            diseaseRaw,
            date,
            dateStr,
            value,
            display: rawText
        });
    }

    return breakdown;
};

// ======================================================================
// Helpers
// ======================================================================

function filterBreakdown(rows, diseaseFilter) {
    if (!rows) return [];
    return rows.filter(row => {
        const diseaseOk =
            !diseaseFilter ||
            diseaseFilter === "(All)" ||
            diseaseFilter === "ALL" ||
            row.disease === diseaseFilter;
        return diseaseOk;
    });
}

function cssSafeKey(str) {
    return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Parse a date string into a LOCAL Date.
 * Supports:
 *  - "YYYY-MM-DD"
 *  - "YYYY-MM-DDTHH:mm:ss..." (time portion ignored)
 *  - "M/D/YYYY" or "MM/DD/YYYY"
 */
function parseYMDLocal(s) {
    if (!s || typeof s !== "string") return null;

    const raw = s.trim();

    // Handle ISO-ish with time: "YYYY-MM-DDTHH:..."
    const isoPrefix = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoPrefix) {
        const year = Number(isoPrefix[1]);
        const month = Number(isoPrefix[2]) - 1;
        const day = Number(isoPrefix[3]);
        const dt = new Date(year, month, day);
        return isNaN(dt.getTime()) ? null : dt;
    }

    // Handle US format: "M/D/YYYY" or "MM/DD/YYYY"
    const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (us) {
        const month = Number(us[1]) - 1;
        const day = Number(us[2]);
        const year = Number(us[3]);
        const dt = new Date(year, month, day);
        return isNaN(dt.getTime()) ? null : dt;
    }

    return null;
}


/**
 * Returns a Date snapped to the start of the bucket (month or year).
 */
function bucketDate(dt, view) {
    if (!(dt instanceof Date) || isNaN(dt.getTime())) return null;
    if (view === "year") {
        return new Date(dt.getFullYear(), 0, 1);
    }
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

/**
 * Aggregate patient records to month/year buckets per disease.
 * Sums values per (disease, bucket).
 */
function aggregatePatientsByView(records, view) {
    const rolled = d3.rollup(
        records,
        rows => {
            const sum = d3.sum(rows, r => Number(r.value) || 0);
            return {
                value: sum,
                display: String(sum),
                diseaseRaw: rows[0]?.diseaseRaw,
                disease: rows[0]?.disease,
                date: bucketDate(rows[0]?.date, view)
            };
        },
        r => r.disease,
        r => {
            const b = bucketDate(r.date, view);
            return b ? +b : null;
        }
    );

    const out = [];
    for (const [disease, dateMap] of rolled.entries()) {
        for (const [dateKey, agg] of dateMap.entries()) {
            if (dateKey === null) continue;

            const date = new Date(Number(dateKey));
            if (isNaN(date.getTime())) continue;

            out.push({
                disease,
                diseaseRaw: agg.diseaseRaw,
                date,
                value: agg.value,
                display: agg.display
            });
        }
    }

    return out;
}

async function fetchWastewater(startDate, endDate) {
    const msg = `
        <ns6:request xmlns:ns6="http://www.i2b2.org/xsd/hive/msg/1.1/">
            <message_header>
                <proxy>
                    <redirect_url>
                        http://shrine-masscpr-dev-hub-i2b2.catalyst.harvard.edu:9090/i2b2/services/ExternalDataService/getWasteWaterData
                    </redirect_url>
                </proxy>
            </message_header>
            <message_body>
                {&quot;Start Date&quot;:&quot;${startDate}&quot;, &quot;End Date&quot;:&quot;${endDate}&quot;}
            </message_body>
        </ns6:request>
        `;

    try {
        // Preferred proxy helper
        if (i2b2?.hive?.proxy?.handler) {
            const response = await i2b2.hive.proxy.handler({
                url: "/~proxy",
                msg: msg,
                method: "POST"
            });

            const bodyNode = i2b2.h.XPath(
                response.refXML,
                "//message_body/text()"
            )[0];

            return bodyNode ? JSON.parse(bodyNode.nodeValue) : null;
        }

        // Fallback direct POST to /~proxy
        const response = await fetch("/~proxy", {
            method: "POST",
            headers: { "Content-Type": "text/xml" },
            body: msg,
            credentials: "include"
        });

        if (!response.ok) {
            console.error("Wastewater /~proxy call failed:", response.status);
            return null;
        }

        const text = await response.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        const bodyNode = xml.querySelector("message_body");

        let parsed = null;
        if (bodyNode) {
            parsed = JSON.parse(bodyNode.textContent);
        }
        return parsed;

    } catch (err) {
        console.error("Failed to fetch wastewater data", err);
        return null;
    }
}
