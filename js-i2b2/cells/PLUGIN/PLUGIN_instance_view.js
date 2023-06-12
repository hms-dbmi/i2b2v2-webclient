if (i2b2.PLUGIN.view === undefined) i2b2.PLUGIN.view = {};

i2b2.PLUGIN.view.windows = [];
i2b2.PLUGIN.view.newInstance = function(pluginId, timelinePluginData) {
    // get the plugin info from the model
    const pluginData = i2b2.PLUGIN.model.plugins[pluginId];
    if (pluginData === undefined) {
        console.error("Plugin does not exist: " + pluginId);
        return false;
    }
    pluginData.setUpData = timelinePluginData;

    let componentName = 'i2b2.PLUGIN.view';
    let pluginTitle = pluginData.title;
    if(pluginData.isLegacy){
        componentName = 'i2b2.LEGACYPLUGIN.view.main';
        pluginTitle = pluginData.name;
    }

    // create the new tab configuration
    let newPluginWindow = {
        type:'component',
        isClosable:false,
        componentName: componentName,
        componentPlugin: pluginData,
        componentPluginCode: pluginId,
        title:pluginTitle
    };
    // this function creates or replaces the current plugin tab with this new plugin
    if (i2b2.layout.gl_instances.rightCol.root.contentItems[0].contentItems[0].contentItems.length > 2) {
        i2b2.layout.gl_instances.rightCol.root.contentItems[0].contentItems[0].contentItems[2].remove();
    }
    i2b2.layout.gl_instances.rightCol.root.contentItems[0].contentItems[0].addChild(newPluginWindow, 2);
};

//================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "PLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.PLUGIN.view",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                let windowEntry = {
                    lm_view: container,
                    data: container._config.componentPlugin,
                    title: container._config.title,
                    state: {}
                };
                windowEntry.data.code = container._config.componentPluginCode;

                // i2b2.ONT.view.info.newInstance()
                i2b2.PLUGIN.view.windows.push(windowEntry);

                // change the tab's hover over to be the name of the plugin
                let funcRetitle = (function(title) {
                    // this can only be run after a bit when the tab has been created in the DOM
                    this.tab.element[0].title = title;
                }).bind(container, windowEntry.title);

                container.on("titleChanged", funcRetitle);
                container.on("tab", funcRetitle);

                // create the iframe and load the plugin into it
                let iframeTarget = $('<iframe class="i2b2PluginIFrame" src="'+windowEntry.data.url+'" title="'+windowEntry.data.title+'"></iframe>').appendTo(container._contentElement)[0];
            }).bind(this)
        );
    }
});
