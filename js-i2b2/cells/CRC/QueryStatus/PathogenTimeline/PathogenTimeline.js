const margin = { top: 20, right: 80, bottom: 70, left: 60 };


const DISEASE_COLORS = {
    COVID: "#1f77b4",        // blue
    Influenza: "#ff7f0e",    // orange
    RSV: "#2ca02c"           // green
};


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
            // Inject HTML template (ZipcodeMap pattern)-
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
                    overlay: $(".path-overlay-select", self.config.displayEl)[0]
                };

                if (self.controls.disease) {
                    $(self.controls.disease).on("change", () => self.update());
                }

                if (self.controls.overlay) {
                    $(self.controls.overlay).on("change", () => self.update());
                }

                // Create SVG inside template container
                self.svgRoot = d3
                    .select(
                        $(".path-timeline-svg-container", self.config.displayEl)[0]
                    )
                    .append("svg")
                    .attr("width", "100%")
                    .attr("height", self.height + margin.top + margin.bottom);

                self.svg = self.svgRoot
                    .append("g")
                    .classed("svg-body", true)
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                self.config.displayEl.style.display = "block";


                // Load wastewater
                fetchWastewater("1/01/2020", "1/01/2025").then(data => {

                    console.log("WW RAW RESPONSE:", data);
                    console.log("WW TYPE:", typeof data);
                    console.log("WW IS ARRAY:", Array.isArray(data));
                    // NORMALIZE wastewater payload to array
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
            const selectedOverlay = this.controls.overlay?.value || "(None)";


            // --- Apply filtering ---
            const filtered = filterBreakdown(raw, selectedDisease);

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
        console.log("DRAW overlay =", selectedOverlay);

        if (!records || records.length === 0) {
            this.svg.selectAll("*").remove();
            return;
        }

        const width = this.width - margin.left - margin.right;
        const height = this.height;

        this.svg.selectAll("*").remove();

        // -----------------------------
        // Group disease series
        // -----------------------------
        const seriesByDisease = d3.group(records, d => d.disease);

        // -----------------------------
        // LEFT Y SCALE (patients)
        // -----------------------------
        const maxPatients = d3.max(records, d => d.value);
        const yLeft = d3.scaleLinear()
            .domain([0, maxPatients])
            .nice()
            .range([height, 0]);

        // -----------------------------
        // RIGHT Y SCALE (wastewater)
        // -----------------------------
        let yRight = null;
        let wwPoints = [];

        if (selectedOverlay !== "(None)" && this.wastewater && this.wastewater.length > 0) {

            wwPoints = this.wastewater
                .map(d => {
                    const dt = new Date(d["Sample Date"]);
                    if (isNaN(dt.getTime())) return null;

                    let val = null;

                    if (selectedOverlay === "mwra-north") {
                        val = Number(d["Northern 7 day avg"]);
                    } else if (selectedOverlay === "mwra-south") {
                        val = Number(d["Southern 7 day avg"]);
                    } else if (selectedOverlay === "mwra-combined") {
                        const n = Number(d["Northern 7 day avg"]);
                        const s = Number(d["Southern 7 day avg"]);
                        val = (isNaN(n) ? 0 : n) + (isNaN(s) ? 0 : s);
                    }

                    if (isNaN(val)) return null;

                    return { date: dt, value: val };
                })
                .filter(Boolean);


            if (wwPoints.length > 0) {
                yRight = d3.scaleLinear()
                    .domain([0, d3.max(wwPoints, d => d.value)])
                    .nice()
                    .range([height, 0]);
            }
        }

        // -----------------------------
        // X SCALE (patients + wastewater)
        // -----------------------------
        let allDates = records.map(d => d.date);
        if (wwPoints.length) {
            allDates = allDates.concat(wwPoints.map(d => d.date));
        }

        const xScale = d3.scaleTime()
            .domain(d3.extent(allDates))
            .range([0, width]);

        // -----------------------------
        // AXES
        // -----------------------------

        // X axis
        this.svg.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(xScale)
                    .ticks(10)
                    .tickFormat(d3.timeFormat("%Y-%m"))
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
            const color = DISEASE_COLORS[disease] || "#999";

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
                .text(d =>
                    `${d.diseaseRaw ?? d.disease} — ${d.dateStr}\n[ ${d.display ?? d.value} patients ]`
                );
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
                .attr("stroke", "#333")
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
                .attr("fill", "#333")
                .attr("stroke", "#333")
                .append("title")
                .text(d => {
                    const dateStr = isNaN(d.date.getTime())
                        ? "Invalid date"
                        : d3.timeFormat("%Y-%m-%d")(d.date);
                    return `Wastewater\n${dateStr}\n${d.value}`;
                });
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
        const disease = canonicalizeDisease(diseaseRaw);


        const date = new Date(dateStr);
        if (isNaN(date.getTime())) continue;

        // Raw display value from server
        const rawText = p.textContent.trim();


        let value = NaN;

        const numberMatch = rawText.match(/\d+/);
        if (numberMatch) {
            value = parseInt(numberMatch[0], 10);
        }

        if (isNaN(value)) value = 0;

        // Advanced filtering
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
// Normalize Disease Keys
// ======================================================================

function canonicalizeDisease(raw) {
    if (!raw) return raw;

    const key = raw.trim().toUpperCase();

    if (key === "COVID-19" || key === "COVID19" || key === "SARS-COV-2") {
        return "COVID";
    }
    if (key === "INFLUENZA") {
        return "Influenza";
    }
    if (key === "RSV") {
        return "RSV";
    }

    // fallback: preserve original
    return raw;
}


// ======================================================================
// Helpers
// ======================================================================

function filterBreakdown(rows, diseaseFilter) {
    if (!rows) return [];

    return rows.filter(row => {
        let diseaseOk =
            !diseaseFilter ||
            diseaseFilter === "(All)" ||
            diseaseFilter === "ALL" ||
            row.disease === diseaseFilter;

        return diseaseOk;
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
        <ns6:request xmlns:ns6="http://www.i2b2.org/xsd/hive/msg/1.1/">
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

    try {
        // --------------------------------------------------
        // Preferred path (only if proxy helper exists)
        // --------------------------------------------------
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

        // --------------------------------------------------
        // Fallback path: direct POST to /~proxy
        // --------------------------------------------------
        const response = await fetch("/~proxy", {
            method: "POST",
            headers: {
                "Content-Type": "text/xml"
            },
            body: msg,
            credentials: "include" // REQUIRED for i2b2 session
        });

        if (!response.ok) {
            console.error("Wastewater /~proxy call failed:", response.status);
            return null;
        }

        const text = await response.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        const bodyNode = xml.querySelector("message_body");

        return bodyNode ? JSON.parse(bodyNode.textContent) : null;

    } catch (err) {
        console.error("Failed to fetch wastewater data", err);
        return null;
    }
}

