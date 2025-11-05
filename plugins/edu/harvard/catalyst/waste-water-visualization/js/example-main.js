i2b2.ExamplePlugin = {};
// ---------------------------------------------------------------------------------------
i2b2.ExamplePlugin.prsDropped = function(sdxData) {
    console.dir("example plugin received patient drop " + JSON.stringify(sdxData));
    let mainDiv = document.getElementsByClassName("psmaindiv-content")[0];
    mainDiv.innerHTML= JSON.stringify(sdxData);
};
// ---------------------------------------------------------------------------------------
i2b2.ExamplePlugin.itemDropped = function(sdxData) {
    console.dir("example plugin received item drop " + JSON.stringify(sdxData));
    let mainDiv = document.getElementsByClassName("maindiv-content")[0];
    mainDiv.innerHTML= JSON.stringify(sdxData);
};
// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_SDX_READY", (event) => {
    i2b2.sdx.AttachType("ExamplePlugin-psmaindiv", "PRS");

    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "CONCPT");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "PRS");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "ENS");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "PRC");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QDEF");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QGDEF");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QI");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QM");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "WRK");
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "XML");

    // drop event handlers used by this plugin
    i2b2.sdx.setHandlerCustom("ExamplePlugin-psmaindiv", "PRS", "DropHandler", i2b2.ExamplePlugin.prsDropped);

    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "CONCPT", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "PRS", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "ENS", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "PRC", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "QDEF", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "QGDEF", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "Qi", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "QM", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "WRK", "DropHandler", i2b2.ExamplePlugin.itemDropped);
    i2b2.sdx.setHandlerCustom("ExamplePlugin-maindiv", "XML", "DropHandler", i2b2.ExamplePlugin.itemDropped);
});

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
