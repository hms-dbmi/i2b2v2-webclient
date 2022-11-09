//init for mb only for now
i2b2.MultisetBreakdowns = {};

i2b2.MultisetBreakdowns.labelCreateButton = function() {
    let button = document.getElementById("createGraphs");
    if (Object.keys(i2b2.model.renderCharts).length === 0) {
        button.innerHTML = "Create Graphs";
    } else {
        button.innerHTML = "Update Graphs";
    }
    // if (i2b2.model.isDirty && Object.keys(i2b2.model.qiList) > 0) {
    //     button.classList.remove("disabled");
    // } else {
    //     button.classList.add("disabled");
    //     if (Object.keys(i2b2.model.qiList).length === 0) document.getElementById("qi-drop-ph").classList.remove('d-none');
    // }
}



//drop handler
i2b2.MultisetBreakdowns.qiDropHandler = function(sdxData){
    // process title
    let titleFull = sdxData.renderData.title;
    sdxData.cleanTitle = titleFull.replace('Results of', '').replace(' - FINISHED','').replace(/^\s*/gm, '');

    // save to the model
    i2b2.model.qiList[sdxData.sdxInfo.sdxKeyValue] = sdxData; //data packet
    i2b2.model.qiList[sdxData.sdxInfo.sdxKeyValue].qriList = {};
    i2b2.model.isDirty = true;

    // recolor the QI instances
    let cnt = Object.keys(i2b2.model.qiList).length;
    if (cnt < 3) cnt = 3;
    qiColors = d3.schemeSpectral[cnt];
    Object.values(i2b2.model.qiList).forEach((qi, idx) => qi.color = qiColors[idx] );

    // save the state
    i2b2.state.save();

    // Start a crawl to retrieve subdocuments of dropped QI's
    i2b2.MultisetBreakdowns.parseQIXML([sdxData.sdxInfo.sdxKeyValue]);

    //trigger separate render function that displays the list
    i2b2.MultisetBreakdowns.renderQIList();

    //i2b2.MultisetBreakdowns.qiChartHandler(sdxData);
};

//Render List function
i2b2.MultisetBreakdowns.renderQIList = function(){
    i2b2.MultisetBreakdowns.labelCreateButton();

    let multiSetPSMainDiv = document.getElementsByClassName("multiset-breakdowns-psmaindiv-content")[0];

    //create an array to store the names of each query
    let instanceNames = [];

    //for each of the keys in the list, push an element containing the name into an array
    Object.keys(i2b2.model.qiList).forEach(qiKeyValue => {
        let qiColor = i2b2.model.qiList[qiKeyValue].color;
        instanceNames.push("<div class='qi-row' data-qi-id='" + qiKeyValue + "' style='background-color:"+qiColor+"'>" + "<button class ='delete-qi'><i class='fas fa-times-circle mx-2' title='Delete'></i><span class='sr-only'>Delete</span></button>" +  i2b2.model.qiList[qiKeyValue].cleanTitle + "</div>");
    });
    if (instanceNames.length > 0){
        document.getElementById("qi-drop-ph").classList.remove("d-block");
        document.getElementById("qi-drop-ph").classList.add("d-none");
    }
    multiSetPSMainDiv.innerHTML = instanceNames.join("");

    //delete individual QI and when we render, we re-attach handlers
    document.querySelectorAll('.delete-qi').forEach(function(node){
        node.addEventListener("click", function(){
            let deleteTargetId = this.parentNode.dataset['qiId'];
            delete i2b2.model.qiList[deleteTargetId];
            i2b2.model.isDirty = true;
            i2b2.state.save();
            i2b2.MultisetBreakdowns.renderQIList();
        });
    });
};

//Parse XML for saved QI's
i2b2.MultisetBreakdowns.parseQIXML = function(keyValue){
    keyValue.forEach(parent => {
        i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryInstanceId({qi_key_value: parent}).then(function(data){
            const xmlStr = data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlStr, "text/xml");
            let queryResultInst = doc.getElementsByTagName("query_result_instance");
            for (let  i = 0;i < queryResultInst.length; i++) {
                if (queryResultInst[i].getElementsByTagName("display_type")[0].childNodes[0].nodeValue.toUpperCase() === "CATNUM") {
                    let resultInstId = queryResultInst[i].getElementsByTagName("result_instance_id")[0].childNodes[0].nodeValue;
                    let resultTypeId = queryResultInst[i].getElementsByTagName("result_type_id")[0].childNodes[0].nodeValue;
                    let queryInstId = queryResultInst[i].getElementsByTagName("query_instance_id")[0].childNodes[0].nodeValue;
                    let resultTypeName = queryResultInst[i].getElementsByTagName("description")[1].childNodes[0].nodeValue;
                    i2b2.model.qiList[queryInstId].qriList[resultInstId]= {typeId : resultTypeId, name: resultTypeName, data: {}};
                    i2b2.MultisetBreakdowns.parseQRIXML(queryInstId, resultInstId);
                }
            }
            // print the name of the root element or error message
            const errorNode = doc.querySelector("parsererror");
            if (errorNode) {
                console.log("error while parsing");
            } else {
                console.log(doc.documentElement.nodeName);
            }
        })
    });
};


//Parse XML for QRI's from QI's
i2b2.MultisetBreakdowns.parseQRIXML = function(queryInstId, resultInstId){
        i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId({qr_key_value : resultInstId}).then(function(data){
            const xmlStr = data;
            const parser = new DOMParser();
            const doc = parser.parseFromString(xmlStr, "text/xml");
            let crcXMLResult = doc.getElementsByTagName("crc_xml_result");
            for ( let i = 0;i < crcXMLResult.length; i++) {
                let xmlValue = crcXMLResult[i].getElementsByTagName("xml_value")[0].childNodes[0].nodeValue;
                const snip = parser.parseFromString(xmlValue, "text/xml");
                let resultTag = snip.getElementsByTagName("body")[0].childNodes; //this might not always be the namespace, try body: first-child
                //console.dir(xmlValue);
                const dataTags = snip.querySelectorAll("data");
                dataObj ={};
                dataTags.forEach(tag =>{
                    try {
                        let col = tag.attributes.column.nodeValue;
                        let val = tag.textContent;
                        dataObj[col] = val;
                    } catch (e) {
                        //do nothing
                    }
                });
                //The try catch above allows us to look for data tags that have actual patient counts or breakdown data associated with it. If we don't find data we're deleting this QI from the candidate list
                 if (Object.keys(dataObj).length > 0){
                    i2b2.model.qiList[queryInstId].qriList[resultInstId].data= dataObj;
                 } else {
                    delete i2b2.model.qiList[queryInstId].qriList[resultInstId];
                 }
            }
            //console.dir(dataObj);
            // print the name of the root element or error message
            const errorNode = doc.querySelector("parsererror");
            if (errorNode) {
            console.log("error while parsing");
            } else {
            console.log(doc.documentElement.nodeName);
            }
        })
};

// new render object for the model
//1 array for each breakdown type

//display charts with button click
//i2b2.model.renderData

// where we have state we're going to have breakdown value (male)
// age would be query master identifier (query master 1)
// population is count (50 males)
// X val is breakdown bucket value
// z would be query master identifier
// y would be the count

//i2b2.ajax.CRC.getRequestXml_fromQueryMasterId({qm_key_value:"23473"}).then(function(data){console.dir(data)})

// //Render Breakdown Charts
// i2b2.MultisetBreakdowns.renderD3Charts = function(queryInstId, resultInstId){
//     let chartArea = document.getElementById('multiset-breakdowns-chartdiv');
//     let qriCollection = [];

//     Object.keys( i2b2.model.qiList[queryInstId].qriList).forEach(resultInstId =>{
//         let resInstObjects = i2b2.model.qiList[queryInstId].qriList[resultInstId].data;
//         qriCollection.push(resInstObjects);
//     });

//     console.dir(qriCollection);

//

//

//     //fire grouped bar chart here
// }

i2b2.MultisetBreakdowns.processData = function() {
    i2b2.model.renderCharts = {};

    // get a list of the unique reports
    let reportList = {};
    Object.values(i2b2.model.qiList).forEach((qi) => {
        Object.values(qi.qriList).forEach((qri) => {
            reportList[qri.typeId] = qri.name;
        });
    });
    i2b2.model.renderReports = reportList;

    // extract the data for each report
    Object.keys(reportList).forEach((reportId) => {
        let reportData = Object.entries(i2b2.model.qiList).map(([qiKey, qi]) => {
            return [
                qiKey,
                Object.values(qi.qriList).filter(qri => qri.typeId === reportId).map((qri2) => qri2.data)[0]
            ]
        });

        // build a list of all buckets
        let bucketNames = {};
        reportData.forEach((entry) => {
            if (entry[1] !== undefined) {
                Object.keys(entry[1]).forEach((value) => {
                    bucketNames[value] = true;
                });
            }
        });
        bucketNames = Object.keys(bucketNames);

        // build render data
        i2b2.model.renderCharts[reportId] = [];
        reportData.forEach((report) => {
            if (report[1] === undefined ) {
                // report does not exist, make 0-count entries
                bucketNames.forEach((name) => {
                    i2b2.model.renderCharts[reportId].push({qi: i2b2.model.qiList[report[0]].cleanTitle, bucket: name, count: 0});
                });
            } else {
                bucketNames.forEach((name) => {
                    let record = {qi: i2b2.model.qiList[report[0]].cleanTitle, bucket: name};
                    let ptCount = report[1][name];
                    if (ptCount === undefined) ptCount = 0;
                    record.count = parseInt(ptCount);
                    i2b2.model.renderCharts[reportId].push(record);
                });
            }
        });
    });

    i2b2.state.save();
};



i2b2.MultisetBreakdowns.renderGraphs = function() {
    // remove previous graphs
    Object.values(document.querySelectorAll('.graph-title')).forEach(el=>el.remove());
    Object.values(document.getElementsByTagName('svg')).forEach(el=>el.remove());


    Object.entries(i2b2.model.renderReports).forEach(([reportId, reportName]) => {
        let chartData = i2b2.model.renderCharts[reportId];
        let qiData = Object.entries(i2b2.model.qiList).map(([id, data]) => [data.cleanTitle, data.color]);
        let buckets = Array.from(new Set(chartData.map(x => x.bucket)));
        chart = GroupedBarChart(chartData, {
            x: d => d.bucket,
            y: d => d.count,
            z: d => d.qi,
            xDomain: buckets,
            yLabel: "↑ Patient Count",
            zDomain: qiData.map(x => x[0]),
            colors: qiData.map(x => x[1]),
            width: document.body.clientWidth - 60,
            height: 300,
            title: (d) => {
                let groupName = String(d.bucket).trim();
                if (groupName.length < 3) groupName = '"' + groupName + '"';
                return d.qi + "\r\n" + groupName + ": " + parseInt(d.count).toLocaleString() + " patients"
            }
        })
        let title = document.createElement("div");
        title.classList.add('graph-title');
        title.textContent = i2b2.model.renderReports[reportId];
        document.body.append(title);
        document.body.append(chart);
    });


};




//GroupedBarChart function
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/grouped-bar-chart
function GroupedBarChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    marginTop = 30, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [xmin, xmax]
    xPadding = 0.1, // amount of x-range to reserve to separate groups
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [ymin, ymax]
    zDomain, // array of z-values
    zPadding = 0.05, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    colors = d3.schemeTableau10, // array of colors
  } = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);

    // Compute default domains, and unique the x- and z-domains.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (zDomain === undefined) zDomain = Z;
    xDomain = new d3.InternSet(xDomain);
    zDomain = new d3.InternSet(zDomain);

    // Omit any data not present in both the x- and z-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]) && zDomain.has(Z[i]));

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
    const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
    const yScale = yType(yDomain, yRange);
    const zScale = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

    // Compute titles.
    if (title === undefined) {
      const formatValue = yScale.tickFormat(100, yFormat);
      title = i => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
    } else {
      const O = d3.map(data, d => d);
      const T = title;
      title = i => T(O[i], i, data);
    }

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));

    const bar = svg.append("g")
      .selectAll("rect")
      .data(I)
      .join("rect")
        .attr("x", i => xScale(X[i]) + xzScale(Z[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("width", xzScale.bandwidth())
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("fill", i => zScale(Z[i]));

    if (title) bar.append("title")
        .text(title);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    return Object.assign(svg.node(), {scales: {color: zScale}});
}


window.addEventListener("I2B2_SDX_READY", (event) => {
    // drop event handlers used by this plugin
    i2b2.sdx.AttachType("multiset-breakdowns-psmaindiv", "QI");
    i2b2.sdx.setHandlerCustom("multiset-breakdowns-psmaindiv", "QI", "DropHandler", i2b2.MultisetBreakdowns.qiDropHandler);
});


window.addEventListener("I2B2_READY", ()=> { //anything we need initialized on plugin active
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    //trigger separate render function that displays the list
    if (i2b2.model.isDirty === undefined) i2b2.model.isDirty = false;
    if (i2b2.model.qiList === undefined) i2b2.model.qiList = {};
    if (i2b2.model.renderCharts === undefined) i2b2.model.renderCharts = {};
    // display the QIs that are loaded
    i2b2.MultisetBreakdowns.renderQIList();
    // display the graphs if they have already been processed
    if (Object.keys(i2b2.model.renderCharts).length > 0) i2b2.MultisetBreakdowns.renderGraphs();
});

document.addEventListener('DOMContentLoaded', () => {
    // event listener for the Create Graphs button
    let graphsButton = document.getElementById("createGraphs");
    graphsButton.addEventListener('click', function(){
        graphsButton.classList.add("click");
        queueMicrotask(()=>{graphsButton.classList.remove("click")});
        i2b2.MultisetBreakdowns.processData();
        i2b2.MultisetBreakdowns.renderGraphs();

        i2b2.model.isDirty = false;
        i2b2.state.save();
        i2b2.MultisetBreakdowns.labelCreateButton();

    });
});
