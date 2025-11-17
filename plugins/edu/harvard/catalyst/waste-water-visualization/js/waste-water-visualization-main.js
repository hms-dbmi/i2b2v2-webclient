i2b2.WasteWaterVisualization = {};

// ---------------------------------------------------------------------------------------

window.addEventListener("I2B2_SDX_READY", (event) => {
    // drop event handlers used by this plugin
    i2b2.sdx.AttachType("WasteWaterVisualization-psmaindiv", "QI");
    i2b2.sdx.setHandlerCustom("WasteWaterVisualization-psmaindiv", "QI", "DropHandler", i2b2.WasteWaterVisualization.qiDropHandler);
});

// ---------------------------------------------------------------------------------------

window.addEventListener("I2B2_READY", ()=> { 
    if (!i2b2.model.qiList) i2b2.model.qiList = {};
    if (!i2b2.model.renderCharts) i2b2.model.renderCharts = {};
    if (!i2b2.WasteWaterVisualization.mockData) i2b2.WasteWaterVisualization.mockData = window.outputData;
    i2b2.WasteWaterVisualization.cleanedData = i2b2.WasteWaterVisualization.fetchAndCleanData(i2b2.WasteWaterVisualization.mockData);
    i2b2.WasteWaterVisualization.dateRangeDisplay(i2b2.WasteWaterVisualization.cleanedData);
    //i2b2.WasteWaterVisualization.renderQIList();
});

// ---------------------------------------------------------------------------------------

i2b2.WasteWaterVisualization.fetchAndCleanData = function(mockData){

    //console.log(mockData)
    return mockData.map(item => {
        const cleanItem = {};
        Object.keys(item).forEach(key => {
            const cleanKey = key.replace(/\n/g, " ").trim();
            cleanItem[cleanKey] = item[key];
        });
        return cleanItem;
    });
};

i2b2.WasteWaterVisualization.dateRangeDisplay = function(cleanedData){
    let dateSpread = []
    let targetDiv = document.getElementById("dataDetail");
    cleanedData.forEach(key => {
        dateSpread.push(key["Sample Date"])
    });
    
    console.log(dateSpread)
    const firstItem = dateSpread.at(0);
    const lastItem = dateSpread.at(-1);
    
    console.log(firstItem);
    console.log(lastItem);
    targetDiv.innerHTML = "Select Waste Water measurement dates between " + firstItem + " and " + lastItem + ".";
};


//drop handler
i2b2.WasteWaterVisualization.qiDropHandler = function(sdxData){
    console.log(sdxData)
    let titleFull = sdxData.renderData.title;
    sdxData.cleanTitle = titleFull.replace('Results of', '').replace(' - FINISHED','').replace(/^\s*/gm, '');

    let wasteWaterPSMainDiv = document.getElementById("WasteWaterVisualization-psmaindiv");

    wasteWaterPSMainDiv.innerHTML = sdxData.cleanTitle

      // save to the model
    i2b2.model.qiList[sdxData.sdxInfo.sdxKeyValue] = sdxData; //data packet
    i2b2.model.qiList[sdxData.sdxInfo.sdxKeyValue].qriList = {};

    // recolor the QI instances
    let cnt = Object.keys(i2b2.model.qiList).length;
    if (cnt < 3) cnt = 3;
    qiColors = d3.schemeSpectral[cnt];
    Object.values(i2b2.model.qiList).forEach((qi, idx) => qi.color = qiColors[idx] );
    
    // save the state
    i2b2.state.save();

    // Start a crawl to retrieve subdocuments of dropped QI's
    i2b2.WasteWaterVisualization.parseQIXML([sdxData.sdxInfo.sdxKeyValue]);

    //trigger separate render function that displays the list
    i2b2.WasteWaterVisualization.renderQIList();

 
};
// ---------------------------------------------------------------------------------------

i2b2.WasteWaterVisualization.renderQIList = function(){

    let wasteWaterPSMainDiv = document.getElementsByClassName("WasteWaterVisualization-psmaindiv")[0];

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
    wasteWaterPSMainDiv.innerHTML = instanceNames.join("");

    //delete individual QI and when we render, we re-attach handlers
    document.querySelectorAll('.delete-qi').forEach(function(node){
        node.addEventListener("click", function(){
            let deleteTargetId = this.parentNode.dataset['qiId'];
            delete i2b2.model.qiList[deleteTargetId];
            i2b2.model.isDirty = true;
            i2b2.state.save();
            i2b2.WasteWaterVisualization.renderQIList();
        });
    });
};
// ---------------------------------------------------------------------------------------
//Parse XML for saved QI's
i2b2.WasteWaterVisualization.parseQIXML = function(keyValue){
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
                    let queryMasterId = i2b2.model.qiList[queryInstId].origData.query_master_id;
                    i2b2.model.qiList[queryInstId].qriList[resultInstId]= {typeId : resultTypeId, name: resultTypeName, data: {}};
                    i2b2.WasteWaterVisualization.parseQRIXML(queryInstId, resultInstId);
                    i2b2.WasteWaterVisualization.parseQMXML(queryMasterId, queryInstId);
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

// ---------------------------------------------------------------------------------------
//Parse XML for QRI's from QI's
i2b2.WasteWaterVisualization.parseQRIXML = function(queryInstId, resultInstId){
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

i2b2.WasteWaterVisualization.parseQMXML = function(queryMasterId, queryInstId){
    console.log("QM is " + queryMasterId)

    i2b2.ajax.CRC.getRequestXml_fromQueryMasterId({
        qm_key_value: queryMasterId
    }).then(xmlStr => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlStr, "text/xml");
        const constraints = i2b2.WasteWaterVisualization.extractDateConstraints(doc);

        i2b2.model.qiList[queryInstId].temporalConstraints = constraints;
    });
};

i2b2.WasteWaterVisualization.extractDateConstraints = function(queryDefinitionXML) {
    const panels = queryDefinitionXML.querySelectorAll("panel");
    const constraints = [];

    panels.forEach((panel, panelIndex) => {
        // A panel may have zero or many items
        const items = panel.querySelectorAll("item");

        items.forEach((item, itemIndex) => {
            const dateNode = item.querySelector("constrain_by_date");
            if (!dateNode) return;

            let dateFrom = null;
            let dateTo = null;

            const fromNode = dateNode.querySelector("date_from");
            const toNode = dateNode.querySelector("date_to");

            if (fromNode && fromNode.textContent.trim() !== "") {
                dateFrom = new Date(fromNode.textContent.trim());
            }
            if (toNode && toNode.textContent.trim() !== "") {
                dateTo = new Date(toNode.textContent.trim());
            }

            // Only add if at least one constraint exists
            if (dateFrom || dateTo) {
                constraints.push({
                    panel: panelIndex + 1,
                    item: itemIndex + 1,
                    dateFrom: dateFrom,
                    dateTo: dateTo
                });
            }
        });
    });

    return constraints;
};


// ---------------------------------------------------------------------------------------
i2b2.WasteWaterVisualization.filterWaterData = function(startDateValue, endDateValue, mockData) {
    console.log('Start Date:', startDateValue);
    console.log('End Date:', endDateValue);
   

    const dateIndex = {};
    const filteredRecords = [];

    mockData.forEach(item => {
        const sampleDate = i2b2.WasteWaterVisualization.normalizeDates(item["Sample Date"]);
        if (sampleDate) {
            const ts = sampleDate.getTime();
            dateIndex[ts] = item;

            // Filter here
            if (sampleDate >= startDateValue && sampleDate <= endDateValue) {
                filteredRecords.push(item);
            }
        }
    });

    console.log("All normalized dates:", dateIndex);
    console.log("Filtered records:", filteredRecords);
    console.table(filteredRecords);

    filteredRecords.forEach(d => {
  console.log("Sample Date:", d["Sample Date"], 
              "Southern 7 day avg raw:", d["Southern 7 day avg"],
              "Number conversion:", +d["Southern 7 day avg"]);
});
    
    i2b2.WasteWaterVisualization.drawChart(filteredRecords);
};

i2b2.WasteWaterVisualization.drawChart = function(filteredRecords) {
    console.log("Filtered records for chart:", filteredRecords);

    // Filter out points without numeric Y
    const validData = filteredRecords.filter(d => !isNaN(+d["Southern 7 day avg"]));

    // Get container + size
    const container = d3.select("#wasteWaterChart").node();
    const width = container.offsetWidth || 900;   
    const height = container.offsetHeight || 450;

    // Margins
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Prepare or update SVG
    let svg = d3.select("#wasteWaterChart").select("svg");
    if (svg.empty()) {
        svg = d3.select("#wasteWaterChart")
                .append("svg");
    }
    svg.attr("width", width)
       .attr("height", height);

    // Clear previous content
    svg.selectAll("*").remove();

    // Scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(validData, d => new Date(d["Sample Date"])))
        .range([margin.left, margin.left + innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(validData, d => +d["Southern 7 day avg"])])
        .range([margin.top + innerHeight, margin.top]);

    // X axis
    svg.append("g")
        .attr("transform", `translate(0, ${margin.top + innerHeight})`)
        .call(d3.axisBottom(xScale));

    // Y axis
    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    // Line generator
    const line = d3.line()
        .x(d => xScale(new Date(d["Sample Date"])))
        .y(d => yScale(+d["Southern 7 day avg"]));

    // Line path
    svg.append("path")
        .datum(validData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Circles
    svg.selectAll("circle")
        .data(validData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(new Date(d["Sample Date"])))
        .attr("cy", d => yScale(+d["Southern 7 day avg"]))
        .attr("r", 4)
        .attr("fill", "steelblue");
};



i2b2.WasteWaterVisualization.normalizeDates = function(dateStr) {
    if (!dateStr) return null;

    const cleaned = dateStr.replace(/[-.]/g, "/").trim();
    const parts = cleaned.split("/").map(Number);

    let year, month, day;

    if (parts[0] > 1900) {
        // format: YYYY/MM/DD
        [year, month, day] = parts;
    } else {
        // format: MM/DD/YYYY or MM/DD/YY
        [month, day, year] = parts;
        if (year < 100) {
            year += 2000;
        }
    }

    return new Date(year, month - 1, day);
};


document.addEventListener('DOMContentLoaded', () => {  
    
    // event listener for the Start Visualization button
    let startVisBtn = document.getElementById("visualizationTrigger");
    
    startVisBtn.addEventListener('click', function(){
        let startDateValue = i2b2.WasteWaterVisualization.normalizeDates(document.getElementById("startDate").value);
        let endDateValue = i2b2.WasteWaterVisualization.normalizeDates(document.getElementById("endDate").value);

        i2b2.WasteWaterVisualization.filterWaterData(startDateValue, endDateValue, i2b2.WasteWaterVisualization.cleanedData);

    });
});