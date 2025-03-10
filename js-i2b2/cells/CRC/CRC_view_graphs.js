/**
 * @projectDescription	D3-based graphs for display of breakdowns
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.graphs
 * @author		Nick Benik
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 */

i2b2.CRC.view.graphs = new i2b2Base_cellViewController(i2b2.CRC, 'graphs');
i2b2.CRC.view.graphs.visible = false;
i2b2.CRC.view.graphs.iObfuscatedFloorNumber = i2b2.UI.cfg.obfuscatedDisplayNumber;  // this is the amount reported that the numbers are obfuscated by
i2b2.CRC.view.graphs.sObfuscatedText = "< "+i2b2.UI.cfg.obfuscatedDisplayNumber.toString();  // this is the text that is replaced for a small number in obfuscated mode so that it can be cleaned up before the next display
i2b2.CRC.view.graphs.sObfuscatedEnding = "±"+i2b2.UI.cfg.obfuscatedDisplayNumber.toString();  //this is the text that is added to all numbers in obfuscated mode

i2b2.CRC.cfg.params.maxBarLabelLength = 30;

// ======================================================================================================
i2b2.CRC.view.graphs.createGraph = function(sDivName, breakdownData, breakdownIndex) {
    // function to shorten long labels on the graph X axis
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

    const isShrine = (breakdownData?.SHRINE?.sites.length > 0);

    // sort the results [TODO: MAKE THIS PROGRAMATICLY ENABLED OR NOT]
    // =====================
    // let data = breakdownData.result.sort((b, a) => {
    //     return parseFloat(a.value) - parseFloat(b.value);
    // });
    let data = breakdownData.result.map((d) => {return {...d, name: $('<div>').html(d.name).text()}})


    let parentContainer = $("#"+sDivName);
    if (parentContainer.length === 0) {
        console.error("Cannot render chart to invalid container");
        return;
    }
    parentContainer = parentContainer[0];
    const subcontainer = $('<div class="graph-container"/>').appendTo(parentContainer)[0];

    let margin = {top: 30, right: 30, bottom: 70, left: 60},
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the target div
    var svg = d3.select(subcontainer)
        .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // bug fix: make sure this is displayed so we get proper width of container for graph calculations
    $('#infoQueryStatusGraph').css("display", "");

    // get proper width for rendering
    width = svg.node().parentElement.clientWidth;
    if (width < 10) width = i2b2.CRC.view.QueryMgr.lm_view.width - 28;
    width = width - margin.left - margin.right;

    // see if we add extra padding for download button based on SHRINE site count
    if (isShrine === true) {
        svg.attr('class','SHRINE');
        width = width - 34;
        const downloadIcon = $('<i class="bi bi-download SHRINE" title="Download"></i>').appendTo(subcontainer);
        const downloadClickHandler = (d) => {
            let dlLink = document.createElement('a');
            let data = new Blob([i2b2.CRC.view.graphs.generateShrineDownload(d)], {'type':'text/csv'});
            dlLink.href = URL.createObjectURL(data);
            dlLink.download = d.title.replaceAll(' ','_') + ".csv";
            document.body.appendChild(dlLink);
            dlLink.click()
            document.body.removeChild(dlLink);
        };
        downloadIcon.on('click', () => { downloadClickHandler(breakdownData); });
    }

    // generate the X axis calc object
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.name; }))
        .padding(0.2);

    // build the X axis and detect the largest label height for latter use
    let maxHeight = 0;
    // build the X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
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
    if (maxHeight > margin.bottom) svg.node().parentElement.attributes.height.value = height + margin.top + maxHeight + 10;

    // generate the Y axis calc object
    let maxValue = Math.max(...data.map((d) => parseFloat(d.value)));
    var y = d3.scaleLinear()
        .domain([0, maxValue])
        .range([ height, 0]);
    // build the Y axis
    let y_axis = svg.append("g")
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


    // Bars
    svg.selectAll("graphbar")
        .data(data)
        .enter()
        .append("rect")
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
        })

    // Graph title
    svg.append("text")
        .classed("graph-title", true)
        .text(breakdownData.title)
        .attr("y", -10)
        .attr("x", (a,b,c) => {
            return (width - c[b].getBoundingClientRect().width) / 2;
        });
};


// ======================================================================================================
// this function is called when the center bar is moved or window is resized
i2b2.CRC.view.graphs.rerenderGraphs = function() {
    let chartContainer = $("#breakdownChartsBody");
    if (chartContainer.length === 0) return;

    let scrollPosition = chartContainer[0].offsetTop;
    chartContainer.empty();

    let isZeroPatients = parseInt(i2b2.CRC.view.QueryReport.breakdowns.patientCount.value || -1) === 0;
    if(!isZeroPatients) {
        i2b2.CRC.view.QueryReport.breakdowns.resultTable.forEach((breakdown, i) => {
            if (!["PATIENT_COUNT_SHRINE_XML", "PATIENT_COUNT_XML", "PATIENT_SITE_COUNT_SHRINE_XML"].includes(breakdown.type)) i2b2.CRC.view.graphs.createGraph("breakdownChartsBody", breakdown);
        })
    }
    chartContainer[0].offsetParent.scrollTo({top:scrollPosition});
};


// ======================================================================================================
// this function is called when the center bar is moved or window is resized
i2b2.CRC.view.graphs.generateShrineDownload = function(data) {
    const siteCnt = data.SHRINE.sites.length;
    let line, csv;
    // build the first line
    line = ['"' + data.description.replaceAll('"',"'") + '"'];
    line.push('""');
    for (let i=0; i<siteCnt; i++) line.push('"' + data.SHRINE.sites[i].name + '"');
    line.push('"Total"');
    csv = line.join(',') + "\n";
    // build the totals line
    line = ['"All Patients"', '""'];
    let total = 0;
    for (let i=0; i<siteCnt; i++) {
        let subtotal = data.SHRINE.sites[i].results.map((t) => t.value).reduce((parialSum, a) => parialSum + a, 0);
        total = total + subtotal;
        line.push(subtotal);
    }
    line.push(total);
    csv = csv + line.join(',') + "\n";
    // build the data lines' title
    let datalines = [];
    for (let i=0; i<data.result.length; i++) {
        let name = $('<div>').html(data.result[i].name).text();
        datalines[i] = ['"' + name  + '"', '""'];
        for (let a=0; a<siteCnt; a++) datalines[i].push(0);
        datalines[i].push(parseInt(data.result[i].value));
    }
    // build the data lines' site counts
    for (let i=0; i<datalines.length; i++) {
        for (let s=0; s<siteCnt; s++) {
            let subtotal = data.SHRINE.sites[s].results.filter((t) => t.name === datalines[i][0].substr(1,datalines[i][0].length-2));
            if (subtotal.length > 0) {
                subtotal = subtotal[0].value;
            } else {
                subtotal = 0;
            }
            let limit = data.SHRINE.sites[s].lowLimit;
            if (subtotal <= limit) {
                datalines[i][s+2] = '"'+limit+' patients or fewer"';
            } else {
                datalines[i][s+2] = subtotal;
            }
        }
    }
    // save the data lines
    for (let i=0; i<datalines.length; i++) {
        csv = csv + datalines[i].join(",") + "\n";
    }
    return csv;
}

