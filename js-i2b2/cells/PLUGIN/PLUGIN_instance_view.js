i2b2.PLUGIN.view = {
    windows: [],
    newInstance: function(pluginId) {
        // get the plugin info from the model
        const pluginData = i2b2.PLUGIN.model.plugins[pluginId];
        if (pluginData === undefined) {
            console.error("Plugin does not exist: " + pluginId);
            return false;
        }

        // create the new tab configuration
        let newPluginWindow = {
            type:'component',
            isClosable:false,
            componentName: 'i2b2.PLUGIN.view',
            componentPlugin: pluginData,
            title:pluginData.title
        };

        // this function creates a new plugin instance
        i2b2.layout.gl_instances.rightCol.root.contentItems[0].contentItems[0].addChild(newPluginWindow);
    }
};



//================================================================================================== //
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode == "PLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.PLUGIN.view",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                let windowEntry = {
                    lm_view: container,
                    data: container._config.componentPlugin,
                    title: container._config.title
                };

                // i2b2.ONT.view.info.newInstance()
                i2b2.PLUGIN.view.windows.push(windowEntry);

                // change the tab's hover over to be the name of the plugin
                let funcRetitle = (function(title) {
                    // this can only be run after a bit when the tab has been created in the DOM
                    this.tab.element[0].title = title;
                }).bind(container, windowEntry.title);

                container.on("titleChanged", funcRetitle);
                container.on("tab", funcRetitle);

                // add the cellWhite flare
                let iframeTarget = $('<iframe class="i2b2PluginIFrame" src="'+windowEntry.data.url+'" title="'+windowEntry.data.title+'"></iframe>').appendTo(container._contentElement)[0];

                // we must delay attachement of an event listener until after the IFrame is attached to the DOM
                setTimeout(()=> {
                    windowEntry.window = iframeTarget.contentWindow;
                    // windowEntry.window.addEventListener("message", (event) => {
                    //     console.log("received by parent");
                    //     console.dir(event);
                    // });
                }, 10);

            }).bind(this)
        );
    }
}));
