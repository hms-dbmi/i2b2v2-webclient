i2b2.WasteWaterVisualization = {};
// ---------------------------------------------------------------------------------------
// Mock data for now
i2b2.WasteWaterVisualization.fetchWasteWaterData = async function() {
    // Mock API response
    return Promise.resolve([
        { date: "2024-10-01", viralLoad: 120 },
        { date: "2024-10-08", viralLoad: 140 },
        { date: "2024-10-15", viralLoad: 95 }
    ]);
};

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
    i2b2.WasteWaterVisualization.renderQIList();
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

    // Start a crawl to retrieve subdocuments of dropped QI's
    i2b2.WasteWaterVisualization.parseQIXML([sdxData.sdxInfo.sdxKeyValue]);

    //trigger separate render function that displays the list
    i2b2.WasteWaterVisualization.renderQIList();

 
};
// ---------------------------------------------------------------------------------------

i2b2.WasteWaterVisualization.renderQIList = function(){

    let wasteWaterPSMainDiv = document.getElementsByClassName("WasteWaterVisualization-psmaindiv-content")[0];

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






