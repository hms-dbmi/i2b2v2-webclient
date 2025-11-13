i2b2.WasteWaterVisualization = {};


// ---------------------------------------------------------------------------------------
// Mock data for now
// i2b2.WasteWaterVisualization.fetchWasteWaterData = async function() {
//     // Mock API response
//     return Promise.resolve([
//         { date: "2024-10-01", viralLoad: 120 },
//         { date: "2024-10-08", viralLoad: 140 },
//         { date: "2024-10-15", viralLoad: 95 }
//     ]);
// };

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
    //i2b2.WasteWaterVisualization.renderQIList();
});

// ---------------------------------------------------------------------------------------

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

    // // Start a crawl to retrieve subdocuments of dropped QI's
    // i2b2.WasteWaterVisualization.parseQIXML([sdxData.sdxInfo.sdxKeyValue]);

    // //trigger separate render function that displays the list
    // i2b2.WasteWaterVisualization.renderQIList();

 
};
// ---------------------------------------------------------------------------------------

// i2b2.WasteWaterVisualization.renderQIList = function(){

//     let wasteWaterPSMainDiv = document.getElementsByClassName("WasteWaterVisualization-psmaindiv")[0];

//     //create an array to store the names of each query
//     let instanceNames = [];

//     //for each of the keys in the list, push an element containing the name into an array
//     Object.keys(i2b2.model.qiList).forEach(qiKeyValue => {
//         let qiColor = i2b2.model.qiList[qiKeyValue].color;
//         instanceNames.push("<div class='qi-row' data-qi-id='" + qiKeyValue + "' style='background-color:"+qiColor+"'>" + "<button class ='delete-qi'><i class='fas fa-times-circle mx-2' title='Delete'></i><span class='sr-only'>Delete</span></button>" +  i2b2.model.qiList[qiKeyValue].cleanTitle + "</div>");
//     });
//     if (instanceNames.length > 0){
//         document.getElementById("qi-drop-ph").classList.remove("d-block");
//         document.getElementById("qi-drop-ph").classList.add("d-none");
//     }
//     wasteWaterPSMainDiv.innerHTML = instanceNames.join("");

//     //delete individual QI and when we render, we re-attach handlers
//     document.querySelectorAll('.delete-qi').forEach(function(node){
//         node.addEventListener("click", function(){
//             let deleteTargetId = this.parentNode.dataset['qiId'];
//             delete i2b2.model.qiList[deleteTargetId];
//             i2b2.model.isDirty = true;
//             i2b2.state.save();
//             i2b2.WasteWaterVisualization.renderQIList();
//         });
//     });
// };
// ---------------------------------------------------------------------------------------
//Parse XML for saved QI's
// i2b2.WasteWaterVisualization.parseQIXML = function(keyValue){
//     keyValue.forEach(parent => {
//         i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryInstanceId({qi_key_value: parent}).then(function(data){
//             const xmlStr = data;
//             const parser = new DOMParser();
//             const doc = parser.parseFromString(xmlStr, "text/xml");
//             let queryResultInst = doc.getElementsByTagName("query_result_instance");
//             for (let  i = 0;i < queryResultInst.length; i++) {
//                 if (queryResultInst[i].getElementsByTagName("display_type")[0].childNodes[0].nodeValue.toUpperCase() === "CATNUM") {
//                     let resultInstId = queryResultInst[i].getElementsByTagName("result_instance_id")[0].childNodes[0].nodeValue;
//                     let resultTypeId = queryResultInst[i].getElementsByTagName("result_type_id")[0].childNodes[0].nodeValue;
//                     let queryInstId = queryResultInst[i].getElementsByTagName("query_instance_id")[0].childNodes[0].nodeValue;
//                     let resultTypeName = queryResultInst[i].getElementsByTagName("description")[1].childNodes[0].nodeValue;
//                     i2b2.model.qiList[queryInstId].qriList[resultInstId]= {typeId : resultTypeId, name: resultTypeName, data: {}};
//                     i2b2.WasteWaterVisualization.parseQRIXML(queryInstId, resultInstId);
//                 }
//             }
//             // print the name of the root element or error message
//             const errorNode = doc.querySelector("parsererror");
//             if (errorNode) {
//                 console.log("error while parsing");
//             } else {
//                 console.log(doc.documentElement.nodeName);
//             }
//         })
//     });
// };

// ---------------------------------------------------------------------------------------
//Parse XML for QRI's from QI's
// i2b2.WasteWaterVisualization.parseQRIXML = function(queryInstId, resultInstId){
//         i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId({qr_key_value : resultInstId}).then(function(data){
//             const xmlStr = data;
//             const parser = new DOMParser();
//             const doc = parser.parseFromString(xmlStr, "text/xml");
//             let crcXMLResult = doc.getElementsByTagName("crc_xml_result");
//             for ( let i = 0;i < crcXMLResult.length; i++) {
//                 let xmlValue = crcXMLResult[i].getElementsByTagName("xml_value")[0].childNodes[0].nodeValue;
//                 const snip = parser.parseFromString(xmlValue, "text/xml");
//                 let resultTag = snip.getElementsByTagName("body")[0].childNodes; //this might not always be the namespace, try body: first-child
//                 //console.dir(xmlValue);
//                 const dataTags = snip.querySelectorAll("data");
//                 dataObj ={};
//                 dataTags.forEach(tag =>{
//                     try {
//                         let col = tag.attributes.column.nodeValue;
//                         let val = tag.textContent;
//                         dataObj[col] = val;
//                     } catch (e) {
//                         //do nothing
//                     }
//                 });
//                 //The try catch above allows us to look for data tags that have actual patient counts or breakdown data associated with it. If we don't find data we're deleting this QI from the candidate list
//                  if (Object.keys(dataObj).length > 0){
//                     i2b2.model.qiList[queryInstId].qriList[resultInstId].data= dataObj;
//                  } else {
//                     delete i2b2.model.qiList[queryInstId].qriList[resultInstId];
//                  }
//             }
//             //console.dir(dataObj);
//             // print the name of the root element or error message
//             const errorNode = doc.querySelector("parsererror");
//             if (errorNode) {
//             console.log("error while parsing");
//             } else {
//             console.log(doc.documentElement.nodeName);
//             }
//         })
// };

// ---------------------------------------------------------------------------------------
i2b2.WasteWaterVisualization.fetchWaterData = function(startDateValue, endDateValue) {
    console.log('Start Date:', startDateValue);
    console.log('End Date:', endDateValue);
    const mockData = window.outputData;

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

    // next: feed filteredRecords into your D3 drawing function
    //i2b2.WasteWaterVisualization.drawChart(filteredRecords);
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

        i2b2.WasteWaterVisualization.fetchWaterData(startDateValue, endDateValue);

    });
});