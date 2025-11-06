i2b2.WasteWaterVisualization = {};

window.addEventListener("I2B2_SDX_READY", (event) => {
    // drop event handlers used by this plugin
    i2b2.sdx.AttachType("WasteWaterVisualization-psmaindiv", "QI");
    i2b2.sdx.setHandlerCustom("WasteWaterVisualization-psmaindiv", "QI", "DropHandler", i2b2.WasteWaterVisualization.qiDropHandler);
});

// ---------------------------------------------------------------------------------------

//drop handler
i2b2.WasteWaterVisualization.qiDropHandler = function(sdxData){
   console.log(sdxData)
   let titleFull = sdxData.renderData.title;
    sdxData.cleanTitle = titleFull.replace('Results of', '').replace(' - FINISHED','').replace(/^\s*/gm, '');

    let multiSetPSMainDiv = document.getElementById("WasteWaterVisualization-psmaindiv");

    multiSetPSMainDiv.innerHTML = sdxData.cleanTitle


    console.log(titleFull)
 
};

// ---------------------------------------------------------------------------------------
function saveState() {
    i2b2.model.stateString = document.getElementById("stateString").value;
    i2b2.state.save();
}
// ---------------------------------------------------------------------------------------
function sendInitMsg() {
    console.log("sending Init message...");
    window.parent.postMessage({"msgType":"INIT"}, "/");
}
// ---------------------------------------------------------------------------------------
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
// ---------------------------------------------------------------------------------------
function testAuthTunnelVar() {
    i2b2.authorizedTunnel.variable["i2b2.PM.model.isAdmin"].then((isReallyAnAdmin) => {
        if (isReallyAnAdmin) {
            alert("You ARE logged in as an Administrator");
        } else {
            alert("You are NOT logged in as an Administrator");
        }
    });
}
// ---------------------------------------------------------------------------------------
function testAuthTunnelFunc() {
    i2b2.authorizedTunnel.function["i2b2.h.getDomain"]().then((domain) => {
        alert("The i2b2 domain is: "+domain);
    });
}




// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", ()=> {
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    if (i2b2.model.stateString === undefined) i2b2.model.stateString = "";
    document.getElementById("stateString").value = i2b2.model.stateString;
});
