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

    let parentContainer = $("#"+sDivName);
    if (parentContainer.length === 0) {
        console.error("Cannot render chart to invalid container");
        return;
    }
    parentContainer = parentContainer[0];
    let margin = {top: 30, right: 30, bottom: 70, left: 60},
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the target div
    var svg = d3.select(parentContainer)
        .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    queueMicrotask(() => {
        // get proper width for rendering
        width = svg.node().parentElement.clientWidth - margin.left - margin.right;

        // sort the results [TODO: MAKE THIS PROGRAMATICLY ENABLED OR NOT]
        // =====================
        // let data = breakdownData.result.sort((b, a) => {
        //     return parseFloat(a.value) - parseFloat(b.value);
        // });
        let data = breakdownData.result;


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
            .call(d3.axisLeft(y));
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
    });
};


// ======================================================================================================
// this function is called when the center bar is moved or window is resized
i2b2.CRC.view.graphs.rerenderGraphs = function() {
    let chartContainer = $("#breakdownChartsBody");
    if (chartContainer.length === 0) return;

    chartContainer.empty();
    i2b2.CRC.view.QueryReport.breakdowns.resultTable.forEach((breakdown,i) => {
        if (breakdown.title !== "Number of patients") i2b2.CRC.view.graphs.createGraph("breakdownChartsBody", breakdown, i);
    })
};

