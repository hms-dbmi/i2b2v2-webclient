//init for mb only for now
i2b2.MultisetBreakdowns = {};


//actual rendering of the breakdowns

i2b2.MultisetBreakdowns.prsDropped = function(sdxData) {
    //console.dir("multiset breakdowns plugin received patient drop " + JSON.stringify(sdxData));
    let mainDiv = document.getElementsByClassName("multiset-breakdowns-psmaindiv-content")[0];
    mainDiv.innerHTML= JSON.stringify(sdxData);
};

//drop handler
i2b2.MultisetBreakdowns.qiDropHandler = function(sdxData){
    i2b2.model.qiList[sdxData.sdxInfo.sdxKeyValue] = sdxData; //data packet 
    i2b2.model.qiList[sdxData.sdxInfo.sdxKeyValue].qriList = {}; 
    
    //console.dir(sdxData);
    i2b2.state.save();

    // Start a crawl to retrieve subdocuments of dropped QI's
    i2b2.MultisetBreakdowns.parseQIXML([sdxData.sdxInfo.sdxKeyValue]);    

    //trigger separate render function that displays the list    
    i2b2.MultisetBreakdowns.renderQIList([sdxData.sdxInfo.sdxKeyValue]); 
    
    //i2b2.MultisetBreakdowns.qiChartHandler(sdxData);
};

//Render List function
i2b2.MultisetBreakdowns.renderQIList = function(){ 
    
    let multiSetPSMainDiv = document.getElementsByClassName("multiset-breakdowns-psmaindiv-content")[0];
    
    //create an array to store the names of each query
    let instanceNames = [];

    //for each of the keys in the list, push an element containing the name into an array
    Object.keys(i2b2.model.qiList).forEach(qiKeyValue => {
        let titleFull = i2b2.model.qiList[qiKeyValue].renderData.title;        
        let titleTrimmed = titleFull.replace('Results of', '');
        let titleCleaned = titleTrimmed.replace(/^\s*/gm, '');
           
        instanceNames.push("<div class='qi-row' data-qi-id='" + qiKeyValue + "'>" + "<button class ='delete-qi'><i class='fas fa-times-circle mx-2'></i><span class='sr-only'>Delete</span></button>" +  titleCleaned + "</div>");
    }); 
    if (instanceNames.length > 0){
        document.getElementById("qi-drop-ph").classList.remove("d-block");
        document.getElementById("qi-drop-ph").classList.add("d-none");
    } 
    multiSetPSMainDiv.innerHTML = instanceNames.join("");  
    
    //delete individual QI and when we render, we re-attach handlers
    document.querySelectorAll('.delete-qi').forEach(function(node){node.addEventListener("click", function(){
        let deleteTargetId = this.parentNode.dataset['qiId'];
        delete i2b2.model.qiList[deleteTargetId];
        i2b2.state.save();
        i2b2.MultisetBreakdowns.renderQIList();
    });
});  
}

//Parse XML for saved QI's 
i2b2.MultisetBreakdowns.parseQIXML = function(keyValue){
    keyValue.forEach(parent => {
        i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryInstanceId({qi_key_value: parent}).then(function(data){            
            const xmlStr = data;
            const parser = new DOMParser();            
            const doc = parser.parseFromString(xmlStr, "text/xml");
            //console.dir(data);
            let queryResultInst = doc.getElementsByTagName("query_result_instance");  
            for (let  i = 0;i < queryResultInst.length; i++) { 
                let resultInstId = queryResultInst[i].getElementsByTagName("result_instance_id")[0].childNodes[0].nodeValue;
                let resultTypeId = queryResultInst[i].getElementsByTagName("result_type_id")[0].childNodes[0].nodeValue;
                let queryInstId = queryResultInst[i].getElementsByTagName("query_instance_id")[0].childNodes[0].nodeValue;               
                i2b2.model.qiList[queryInstId].qriList[resultInstId]= {typeId : resultTypeId, data : {}};
                i2b2.MultisetBreakdowns.parseQRIXML(queryInstId, resultInstId);
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
}

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
    
}


//Breakdown Data Organization
// i2b2.MultisetBreakdowns.qiChartHandler = function(sdxData){
//     i2b2.model.renderCharts[sdxData.sdxInfo.sdxKeyValue] = sdxData; //data packet 
//     i2b2.model.renderCharts[sdxData.sdxInfo.sdxKeyValue].chartList = {};     

//     //array({breakdownValue, QMid : count})
// }

document.addEventListener('DOMContentLoaded', function (){
    let graphsButton = document.getElementById("createGraphs");
    graphsButton.addEventListener('click', function(){
        alert("we're here!");
        let qilistph = i2b2.model.qiList;
        console.dir(qilistph);
        i2b2.model.renderCharts = qilistph;

     });
});


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
    i2b2.sdx.AttachType("multiset-breakdowns-psmaindiv", "QI");
    

    // drop event handlers used by this plugin
    i2b2.sdx.setHandlerCustom("multiset-breakdowns-psmaindiv", "QI", "DropHandler", i2b2.MultisetBreakdowns.qiDropHandler);            
});

function saveState() {
    i2b2.model.stateString = document.getElementById("stateString").value;
    i2b2.state.save();
}

function sendInitMsg() {
    console.log("sending Init message...");
    window.parent.postMessage({"msgType":"INIT"}, "/");
}

function sendTestMsg() {
    console.log("sending test message...");
    let ajaxData = {
        ont_synonym_records: "N",
        ont_hidden_records: "N"
    };
    i2b2.ajax.ONT.GetCategories(ajaxData).then((data)=> {
        console.log("Got response base from ONT.GetCategories()");
        console.log(data);
    })
}

window.addEventListener("I2B2_READY", ()=> { //anything we need initialized on plugin active
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    //trigger separate render function that displays the list
    if (i2b2.model.stateString === undefined) i2b2.model.stateString = "";
    document.getElementById("stateString").value = i2b2.model.stateString;
    if (i2b2.model.qiList === undefined) i2b2.model.qiList = {};
    if (i2b2.model.renderCharts === undefined) i2b2.model.renderCharts = {};    
    i2b2.MultisetBreakdowns.renderQIList();
});
