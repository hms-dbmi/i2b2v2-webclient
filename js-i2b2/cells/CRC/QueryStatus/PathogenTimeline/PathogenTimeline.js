const DIAGNOSIS_REGISTRY = {
    diagnosis: {
        "COVID-19": { key: "COVID-19", label: "COVID-19", color: "#1f77b4", order: 1, aliases: ["COVID-19", "COVID19", "SARS-COV-2"] },
        "Influenza": { key: "Influenza", label: "Influenza", color: "#ff7f0e", order: 2, aliases: ["INFLUENZA"] },
        "RSV": { key: "RSV", label: "RSV", color: "#2ca02c", order: 3, aliases: ["RSV"] }
    },
    canonicalize(raw) {
        const key = raw.trim().toUpperCase();
        for (const diagnosis of Object.values(this.diagnosis)) {
            if (diagnosis.aliases.includes(key)) {
                return diagnosis.key;
            }
        }
        return raw.trim();
    }
};

const WASTEWATER_REGISTRY = {
    wastewater_sources: {
        "mwra-combined": { label: "Wastewater MWRA COVID-19", color: "#333", order: 3, accessor: (row) => (Number(row["Northern 7 day avg"]) || 0) + (Number(row["Southern 7 day avg"]) || 0) }
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

            // Wastewater fetch gating + computed range
            this.wwRequestRange = null;
            this._wwFetched = false;

            this.width = this.config.displayEl.parentElement.clientWidth;
            this.height = 400 - margin.top - margin.bottom;

            this.config.displayEl.style.display = "none";
            const self = this;

            // Parse initial XML if present (often empty at constructor-time; update() will get real data later)
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

                // Cache controls (SCOPED) - LINK STYLE CONTROLS
                self.controls = {
                    diagnosisList: $(".path-diagnosis-links", self.config.displayEl)[0],
                    overlayList: $(".path-overlay-links", self.config.displayEl)[0],
                    aggregationList: $(".path-aggregation-links", self.config.displayEl)[0],
                    legend: $(".path-legend-items", self.config.displayEl)[0],
                };

                // Internal state (update() reads from here)
                self.state = {
                    diagnosis: "All",
                    overlay: "None",
                    aggregation: "month"
                };

                // Helpers for link-style controls
                function renderLinks(ulEl, items, selectedValue) {
                    if (!ulEl) return;
                    ulEl.innerHTML = "";
                    items.forEach(({ value, label }) => {
                        const li = document.createElement("li");
                        const sp = document.createElement("span");
                        sp.className = "path-link" + (value === selectedValue ? " selected" : "");
                        sp.setAttribute("data-value", value);
                        sp.textContent = label;
                        li.appendChild(sp);
                        ulEl.appendChild(li);
                    });
                }

                function bindLinkClicks(ulEl, onPick) {
                    if (!ulEl) return;
                    ulEl.addEventListener("click", (e) => {
                        const target = e.target;
                        if (!(target instanceof HTMLElement)) return;
                        if (!target.classList.contains("path-link")) return;

                        const value = target.getAttribute("data-value");
                        if (!value) return;

                        // Toggle selected within this UL
                        ulEl.querySelectorAll(".path-link.selected").forEach(n => n.classList.remove("selected"));
                        target.classList.add("selected");

                        onPick(value);
                    });
                }

                // Build items
                const diagnosisItems = [
                    { value: "All", label: "All" },
                    ...Object.entries(DIAGNOSIS_REGISTRY.diagnosis)
                        .sort(([, a], [, b]) => a.order - b.order)
                        .map(([key, d]) => ({ value: key, label: d.label }))
                ];

                const overlayItems = [
                    { value: "None", label: "None" },
                    ...Object.entries(WASTEWATER_REGISTRY.wastewater_sources)
                        .sort(([, a], [, b]) => a.order - b.order)
                        .map(([key, w]) => ({ value: key, label: w.label }))
                ];

                // Render initial lists
                renderLinks(self.controls.diagnosisList, diagnosisItems, self.state.diagnosis);
                renderLinks(self.controls.overlayList, overlayItems, self.state.overlay);

                // Aggregation list is in HTML; ensure we have a selected item + sync state
                if (self.controls.aggregationList) {
                    const selectedAggregationNode = self.controls.aggregationList.querySelector(".path-link.selected");
                    if (selectedAggregationNode) {
                        self.state.aggregation = selectedAggregationNode.getAttribute("data-value") || "month";
                    } else {
                        // If HTML forgot to set selected, default to month
                        const first = self.controls.aggregationList.querySelector(".path-link[data-value='month']");
                        if (first) first.classList.add("selected");
                        self.state.aggregation = "month";
                    }
                }

                // Bind clicks
                bindLinkClicks(self.controls.diagnosisList, (v) => { self.state.diagnosis = v; self.update(); });
                bindLinkClicks(self.controls.overlayList, (v) => { self.state.overlay = v; self.update(); });
                bindLinkClicks(self.controls.aggregationList, (v) => { self.state.aggregation = v; self.update(); });

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

            // ------------------------------------------------------------
            // Wastewater fetch
            // ------------------------------------------------------------
            if (this._wwFetched === false) {
                this.wwRequestRange = deriveWastewaterDateRangeFromBreakdown(this.data.new);

                if (this.wwRequestRange && this.wwRequestRange.ok) {
                    this._wwFetched = true;

                    fetchWastewater(this.wwRequestRange.startStr, this.wwRequestRange.endStr).then(data => {
                        if (Array.isArray(data)) {
                            this.wastewater = data;
                        } else if (data?.data && Array.isArray(data.data)) {
                            this.wastewater = data.data;
                        } else if (data?.result && Array.isArray(data.result)) {
                            this.wastewater = data.result;
                        } else {
                            console.warn("Unrecognized wastewater payload shape", data);
                            this.wastewater = [];
                        }
                        this.update(); // redraw once wastewater arrives
                    });

                } else {
                    console.warn("[WASTEWATER] skipping fetch:", this.wwRequestRange ? this.wwRequestRange.reason : "no range");
                    this._wwFetched = true;
                    this.wastewater = [];
                }
            }

            // If template/SVG not ready yet, bail without drawing (but wastewater fetch can still run above)
            if (!this.svg || !this.controls || !this.state) return;

            const selectedDiagnosis = this.state?.diagnosis || "All";
            const selectedOverlay = this.state?.overlay || "None";
            const selectedAggregation = this.state?.aggregation || "month"; // "month" | "year"

            //console.log("printing raw");
            //console.log(raw);
            if (selectedAggregation === "yoy") {

                const yoyRows = raw.filter(r => (r.grain || "").trim().toUpperCase() === "M");

                let yoyFilteredRows = null;

                if(selectedDiagnosis === "All"){
                   yoyFilteredRows = yoyRows;
                } else{
                    yoyFilteredRows = yoyRows.filter(r => r.diagnosis === selectedDiagnosis);
                }
                
                const yoyPivotRows = pivotToYOYRows(yoyFilteredRows);

                const byDiagnosisYear = {};

                for(const row of yoyPivotRows){

                    let diagnosis = row.diagnosis;
                    let year = row.year;
                    let monthIndex = row.monthIndex;
                    let value = row.value;   

                    if (byDiagnosisYear[diagnosis] === undefined){
                        byDiagnosisYear[diagnosis] = {};
                    }
                   
                    if (byDiagnosisYear[diagnosis][year] === undefined){
                        byDiagnosisYear[diagnosis][year] = [];
                    }
                  
                    let point = {"monthIndex": monthIndex, "value": value}

                    byDiagnosisYear[diagnosis][year].push(point);                 
                   
                }
                //sort the data --we could have used a nested for loop here, but that looked smelly (even though in this case it wouldn't be)
                Object.values(byDiagnosisYear)
                    .flatMap(yearMap => Object.values(yearMap))
                    .forEach(pointsArr => {
                        pointsArr.sort((a, b) => a.monthIndex - b.monthIndex);});
               
                //create the series
                const series = Object.entries(byDiagnosisYear).flatMap(([diagnosis, years]) => 
                Object.entries(years).map(([yearKey, monthlyDataArray]) => ({
                    diagnosis,
                    year: Number(yearKey),
                    points: monthlyDataArray
                    }))
                );
                  
                // Order series by diagnosis registry order, then by ascending year
                series.sort((a, b) => { 
                    const orderA = DIAGNOSIS_REGISTRY.diagnosis?.[a.diagnosis]?.order ?? 9999;
                    const orderB = DIAGNOSIS_REGISTRY.diagnosis?.[b.diagnosis]?.order ?? 9999;
                    return (orderA - orderB) || (a.year - b.year);

                })
                // create a lookup for the min year and max year to draw offset color lines
                const lookup = series.reduce((acc, { diagnosis: dx, year }) => {
                const range = acc[dx];

                    if (!range) {
                        acc[dx] = { min: year, max: year };
                    } else {
                        range.min = Math.min(range.min, year);
                        range.max = Math.max(range.max, year);
                    }

                    return acc;
                }, {});
         
                // create an item.stroke value for the renderer
                const T_MIN = 0.3;

                series.forEach((item) => {
                    const { diagnosis: dx, year } = item;

                    const range = lookup[dx];
                    if (!range) return;

                    const { min, max } = range;

                    const u = (min === max) ? 1 : (year - min) / (max - min);

                    const t = T_MIN + u * (1 - T_MIN);

                    const baseColor = DIAGNOSIS_REGISTRY.diagnosis?.[dx]?.color;
                    if (!baseColor) return;

                    item.stroke = blendWithWhite(baseColor, t);
                });

                //create a render model for drawing
                const renderModel = {
                    "months" : ["Jan","Feb", "Mar", "Apr","May","Jun","Jul","Aug","Sep","Oct", "Nov","Dec" ],
                    "series" : series,
                    "xDomain": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 
                    "yLeftLabel": "Number of Patients"

                }

                this.drawYOY(renderModel);
                // console.log(renderModel.months.length);
                // console.log(renderModel.series.length);

                return;
            }


            // IMPORTANT: filter by grain so month aggregation doesn't accidentally include year rows (and vice versa)
            const aggregationGrain = (selectedAggregation === "year") ? "Y" : "M";
            const aggregationRows = raw.filter(r => (r.grain || "").toUpperCase() === aggregationGrain);

            const filtered = filterBreakdown(aggregationRows, selectedDiagnosis);

            const diagnosisInAggregation = filtered.map(row => row.diagnosis);
            const currentKeys = Array.from(new Set(diagnosisInAggregation));

            // Clear legend
            if (this.controls?.legend) this.controls.legend.innerHTML = "";

            currentKeys.forEach((key) => {
                const diagnosisConfig = DIAGNOSIS_REGISTRY.diagnosis[key];
                if (!diagnosisConfig) return;
                $(this.controls.legend).append(
                    `<span class="legend-row">
                        <span class="legend-swatch" style="background:${diagnosisConfig.color}"></span>
                        <span>${diagnosisConfig.label}</span>
                    </span>`
                );
            });

            const hasWastewater = (selectedOverlay !== "None");
            if (hasWastewater) {
                const waterConfig = WASTEWATER_REGISTRY.wastewater_sources[selectedOverlay];
                if (waterConfig) {
                    $(this.controls.legend).append(
                        `<span class="legend-row">
                            <span class="legend-swatch" style="background:${waterConfig.color}"></span>
                            <span>${waterConfig.label}</span>
                        </span>`
                    );
                }
            }

            this.draw(filtered, selectedOverlay, selectedAggregation);

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

    drawYOY(renderModel){
        if (!renderModel.series || renderModel.series === 0) {
            this.svg.selectAll("*").remove();
            return;
        }

        const width = this.width - margin.left - margin.right;
        const height = this.height;

        this.svg.selectAll("*").remove();

        const xScale = d3.scaleLinear()
            .domain([0, 11])
            .range([0, width]);

        const maxY = Math.max(...renderModel.series.flatMap(item => 
            item.points.map(point => point.value)
            ));

        //console.log(maxY);

        const yLeft = d3.scaleLinear()
            .domain([0, maxY])
            .nice()            
            .range([height, 0]);

       //Append to x axis

        this.svg.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0,${height})`)
            .call(
                d3.axisBottom(xScale)
                    .ticks(11)
                    .tickValues(renderModel.xDomain)
                    .tickFormat(i => renderModel.months[i])
            )

        // append to Left Y 
        const yAxisLeft = this.svg.append("g")
            .classed("y-axis left", true)
            .call(
                d3.axisLeft(yLeft)
                    .tickFormat(d3.format(".2~s")));

        const yLabelText =  renderModel.yLeftLabel;

        const yLabelLeft = yAxisLeft.append("text")
            .attr("class", "y-label")
            .attr("fill", "currentColor")
            .attr("letter-spacing", "1.16")
            .attr("text-anchor", "middle")
            .text(yLabelText)
            .attr("transform", "rotate(-90)");

        // After render, center it using SVG bbox
        yLabelLeft.each(function () {
            let w = 0;
            try { w = this.getBBox().width || 0; } catch (e) { w = 0; }

            const x = -(height / 2);          // centered vertically
            const y = -margin.left + 28;      // gutter position

            d3.select(this)
                .attr("x", x)
                .attr("y", y);
        });


  
        // -----------------------------
        // Line Gen
        // -----------------------------

        const patientLine = d3.line()
            .x(point => xScale(point.monthIndex))
            .y(point => yLeft(point.value));


        // -----------------------------
        // Draw diagnosis points
        // -----------------------------
        

            // Line
            this.svg.append("path")
                .datum(rows)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("d", patientLine);

            // Points
            this.svg.selectAll(`circle.${cssSafeKey(diagnosis)}`)
                .data(rows)
                .enter()
                .append("circle")
                .attr("class", `point ${cssSafeKey(diagnosis)}`)
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yLeft(d.value))
                .attr("r", 4)
                .attr("fill", color)
                .attr("stroke", color)
                .append("title")
                .text(d => {
                    const label = tickFormat(d.date);
                    return `${d.diagnosisRaw ?? d.diagnosis} — ${label}\n[ ${d.display ?? d.value} patients ]`;
                });
       


  
    }

    

    draw(records, selectedOverlay, selectedAggregation) {
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
        const bucketedPatients = collectPatientsByAggregation(records, selectedAggregation);

        // If (for some reason) nothing survived bucketing, bail cleanly
        if (!bucketedPatients || bucketedPatients.length === 0) {
            return;
        }

        // Group diagnosis series
        const seriesByDiagnosis = d3.group(bucketedPatients, d => d.diagnosis);

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

        if (selectedOverlay !== "None" && this.wastewater && this.wastewater.length > 0) {
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

                        if (selectedAggregation === "year") {
                            return `${dt.getFullYear()}`;
                        }
                        // month (0-based month key, used consistently below)
                        return `${dt.getFullYear()}-${dt.getMonth()}`;
                    }
                );

                wwPoints = Array.from(wwRollup.entries())
                    .filter(([k, v]) => k !== null && v !== null)
                    .map(([key, value]) => {
                        if (selectedAggregation === "year") {
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
        const tickFormat = (selectedAggregation === "year")
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

        const yLabelText = "Number of Patients";

        const yLabelLeft = yAxisLeft.append("text")
            .attr("class", "y-label")
            .attr("fill", "currentColor")
            .attr("letter-spacing", "1.16")
            .attr("text-anchor", "middle")
            .text(yLabelText)
            .attr("transform", "rotate(-90)");

        // After render, center it using SVG bbox
        yLabelLeft.each(function () {
            let w = 0;
            try { w = this.getBBox().width || 0; } catch (e) { w = 0; }

            const x = -(height / 2);          // centered vertically
            const y = -margin.left + 28;      // gutter position

            d3.select(this)
                .attr("x", x)
                .attr("y", y);
        });

        // Right Y axis (wastewater)
        if (yRight) {
            const yAxisRight = this.svg.append("g")
                .classed("y-axis right", true)
                .attr("transform", `translate(${width},0)`)
                .call(d3.axisRight(yRight));

            yAxisRight.append("text")
                .attr("class", "y-label")
                .attr("text-anchor", "middle")
                .attr("letter-spacing", "1.16")
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
        // DRAW DIAGNOSIS LINES + POINTS
        // -----------------------------
        for (let [diagnosis, rows] of seriesByDiagnosis.entries()) {
            rows = rows.slice().sort((a, b) => a.date - b.date);
            const color = DIAGNOSIS_REGISTRY.diagnosis[diagnosis]?.color || "#999";

            // Line
            this.svg.append("path")
                .datum(rows)
                .attr("fill", "none")
                .attr("stroke", color)
                .attr("stroke-width", 2)
                .attr("d", patientLine);

            // Points
            this.svg.selectAll(`circle.${cssSafeKey(diagnosis)}`)
                .data(rows)
                .enter()
                .append("circle")
                .attr("class", `point ${cssSafeKey(diagnosis)}`)
                .attr("cx", d => xScale(d.date))
                .attr("cy", d => yLeft(d.value))
                .attr("r", 4)
                .attr("fill", color)
                .attr("stroke", color)
                .append("title")
                .text(d => {
                    const label = tickFormat(d.date);
                    return `${d.diagnosisRaw ?? d.diagnosis} — ${label}\n[ ${d.display ?? d.value} patients ]`;
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
        // Grain ^ YYYY-MM-DD ^ YYYY Mon ^ Diagnosis
        const parts = column.split("^");
        if (parts.length < 4) continue;

        const grain = parts[0].trim().toUpperCase();
        const dateStr = parts[1].trim();
        const label = parts[2].trim();
        const diagnosisRaw = parts[3].trim();
        const diagnosis = DIAGNOSIS_REGISTRY.canonicalize(diagnosisRaw);

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
                    advancedConfig.hideEntries.includes(diagnosis) ||
                    advancedConfig.hideEntries.includes(column)
                ) {
                    include = false;
                }
            }
        }

        if (!include) continue;

        breakdown.result.push({
            grain,
            diagnosis,
            diagnosisRaw,
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

function filterBreakdown(rows, diagnosisFilter) {
    if (!rows) return [];
    return rows.filter(row => {
        const diagnosisOk =
            !diagnosisFilter ||
            diagnosisFilter === "All" ||
            diagnosisFilter === "ALL" ||
            row.diagnosis === diagnosisFilter;
        return diagnosisOk;
    });
}

function cssSafeKey(str) {
    return String(str)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function blendWithWhite(hexColor, t){
    const hexCleaned = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;   

    const r = parseInt(hexCleaned.slice(0, 2), 16); 
    const g = parseInt(hexCleaned.slice(2, 4), 16);
    const b = parseInt(hexCleaned.slice(4, 6), 16);    

    const r2 = 255 - (255 - r) * t;
    const g2 = 255 - (255 - g) * t; 
    const b2 = 255 - (255 - b) * t;

    const rI = Math.round(r2);
    const gI = Math.round(g2);
    const bI = Math.round(b2);

    const rHex= rI.toString(16).padStart(2, "0")
    const gHex= gI.toString(16).padStart(2, "0")
    const bHex= bI.toString(16).padStart(2, "0")

    const finalHex = "#" + rHex + gHex + bHex;
    return finalHex;
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
function bucketDate(dt, aggregation) {
    if (!(dt instanceof Date) || isNaN(dt.getTime())) return null;
    if (aggregation === "year") {
        return new Date(dt.getFullYear(), 0, 1);
    }
    return new Date(dt.getFullYear(), dt.getMonth(), 1);
}

/**
 * Collect patient records to month/year buckets per diagnosis.
 * Sums values per (diagnosis, bucket).
 */
function collectPatientsByAggregation(records, aggregation) {
    const rolled = d3.rollup(
        records,
        rows => {
            const sum = d3.sum(rows, r => Number(r.value) || 0);
            return {
                value: sum,
                display: String(sum),
                diagnosisRaw: rows[0]?.diagnosisRaw,
                diagnosis: rows[0]?.diagnosis,
                date: bucketDate(rows[0]?.date, aggregation)
            };
        },
        r => r.diagnosis,
        r => {
            const b = bucketDate(r.date, aggregation);
            return b ? +b : null;
        }
    );

    const out = [];
    for (const [diagnosis, dateMap] of rolled.entries()) {
        for (const [dateKey, agg] of dateMap.entries()) {
            if (dateKey === null) continue;

            const date = new Date(Number(dateKey));
            if (isNaN(date.getTime())) continue;

            out.push({
                diagnosis,
                diagnosisRaw: agg.diagnosisRaw,
                date,
                value: agg.value,
                display: agg.display
            });
        }
    }

    return out;
}

function pivotToYOYRows(aggregatedRecords){
    if (!aggregatedRecords || !Array.isArray(aggregatedRecords) || aggregatedRecords.length === 0) {
        return [];
    } 

    const out = [];

    for (const row of aggregatedRecords) {
        let date = row.date;

        if (!(date instanceof Date) || isNaN(date.getTime())) continue;

        let year = date.getFullYear();
        let monthIndex = date.getMonth();
        let diagnosis = row.diagnosis;
        let value = row.value;

        out.push({
            year,
            monthIndex,
            diagnosis,
            value
        });
    }
    return out;
}


// ------------------------------------------------------------
// Wastewater service plumbing
// ------------------------------------------------------------
const WASTEWATER_URLS = {
    dev: "http://shrine-masscpr-dev-hub-i2b2.catalyst.harvard.edu:9090/i2b2/services/ExternalDataService/getWasteWaterData",
    prod: "http://prod-i2b2.network.masscpr.hms.harvard.edu:9090/i2b2/services/ExternalDataService/getWasteWaterData"
};

function detectEnv() {
    const override = (window.PATHOGEN_TIMELINE_ENV || "").toLowerCase();
    if (override === "dev" || override === "prod") return override;

    const host = (window.location?.hostname || "").toLowerCase();

    // Local dev should use dev backend by default
    if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".local")) return "dev";

    if (host.includes("dev") || host.includes("catalyst")) return "dev";

    return "prod";
}

function getWastewaterServiceUrl() {
    const env = detectEnv();
    return WASTEWATER_URLS[env] || WASTEWATER_URLS.prod;
}

async function fetchWastewater(startDate, endDate) {
    const redirectUrl = getWastewaterServiceUrl();
    const env = detectEnv();
    console.info(
        `[WASTEWATER] ${env.toUpperCase()} detected; calling ${env.toUpperCase()} wastewater service`
    );

    const msg = `
    <ns6:request xmlns:ns6="http://www.i2b2.org/xsd/hive/msg/1.1/">
        <message_header>
        <proxy>
            <redirect_url>${redirectUrl}</redirect_url>
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
            console.error("Wastewater /~proxy call failed:", response.status, "env:", detectEnv(), "redirect:", redirectUrl);
            return null;
        }

        const text = await response.text();
        const xml = new DOMParser().parseFromString(text, "text/xml");
        const bodyNode = xml.querySelector("message_body");

        return bodyNode ? JSON.parse(bodyNode.textContent) : null;

    } catch (err) {
        console.error("Failed to fetch wastewater data", err, "env:", detectEnv(), "redirect:", redirectUrl);
        return null;
    }
}

// ------------------------------------------------------------
// Derive wastewater request date range from patient breakdown
// ------------------------------------------------------------
function deriveWastewaterDateRangeFromBreakdown(breakdown) {
    if (!breakdown || !Array.isArray(breakdown.result) || breakdown.result.length === 0) {
        return { ok: false, startStr: null, endStr: null, reason: "missing/empty breakdown.result" };
    }

    var minT = null, maxT = null;

    for (var i = 0; i < breakdown.result.length; i++) {
        var dt = breakdown.result[i] && breakdown.result[i].date;
        if (!(dt instanceof Date)) continue;
        var t = dt.getTime();
        if (isNaN(t)) continue;

        if (minT === null || t < minT) minT = t;
        if (maxT === null || t > maxT) maxT = t;
    }

    if (minT === null || maxT === null || maxT < minT) {
        return { ok: false, startStr: null, endStr: null, reason: "could not derive valid min/max dates" };
    }

    function toMDY(t) {
        var d = new Date(t);
        return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
    }

    return { ok: true, startStr: toMDY(minT), endStr: toMDY(maxT), reason: null };
}
