i2b2.ExamplePlugin = {};
i2b2.ExamplePlugin.prsDropped = function(sdxData) {
    console.dir("example plugin received patient drop " + JSON.stringify(sdxData));
    let mainDiv = document.getElementsByClassName("psmaindiv-content")[0];
    mainDiv.innerHTML= JSON.stringify(sdxData);
};

i2b2.ExamplePlugin.itemDropped = function(sdxData) {
    console.dir("example plugin received item drop " + JSON.stringify(sdxData));
    let mainDiv = document.getElementsByClassName("maindiv-content")[0];
    mainDiv.innerHTML= JSON.stringify(sdxData);
};

window.addEventListener("I2B2_SDX_READY", (event) => {
    let op_trgt = {dropTarget:true};
    i2b2.sdx.AttachType("ExamplePlugin-psmaindiv", "PRS", op_trgt);

    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "CONCPT", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "PRS", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "ENS", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "PRC", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QDEF", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QGDEF", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QI", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "QM", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "WRK", op_trgt);
    i2b2.sdx.AttachType("ExamplePlugin-maindiv", "XML", op_trgt);

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

window.addEventListener("I2B2_READY", ()=> {
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    if (i2b2.model.stateString === undefined) i2b2.model.stateString = "";
    document.getElementById("stateString").value = i2b2.model.stateString;
});
