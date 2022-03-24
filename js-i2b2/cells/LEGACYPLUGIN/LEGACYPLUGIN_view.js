// create and save the view object
i2b2.LEGACYPLUGIN.view.main = new i2b2Base_cellViewController(i2b2.LEGACYPLUGIN, 'main');

// ==================================================================================================

i2b2.LEGACYPLUGIN.view.main.onPluginFrameLoad = function(){
    if(!i2b2.PM.model.data.loginXMLStr)
    {
        i2b2.PM.model.data.loginXMLStr = i2b2.h.Xml2String(i2b2.PM.model.data.refXML);
        delete i2b2.PM.model.data.refXML;
    }

    let loginData = JSON.stringify(i2b2.PM.model.data);
    document.getElementById("pluginframe").contentWindow.postMessage(loginData, window.location.origin);
}

// ==================================================================================================

i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode === "LEGACYPLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.LEGACYPLUGIN.view.main",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE LEGACY PLUGIN CELL'S MAIN VIEW
                let iframe = $("<iframe id='pluginframe' onload='i2b2.LEGACYPLUGIN.view.main.onPluginFrameLoad()' src='' class='pluginCell'></iframe>");
                iframe.attr("src", "js-i2b2/cells/LEGACYPLUGIN/legacy_plugin/index.html");

                let frameDiv = $("<div class='cellWhite'></div>");
                frameDiv.append(iframe);
                container.getElement().append(frameDiv);
            }).bind(this)
        );
    }
}));