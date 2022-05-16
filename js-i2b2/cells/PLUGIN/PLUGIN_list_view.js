i2b2.PLUGIN.list = {}

i2b2.PLUGIN.list.load = function(template){
    let xIconVarName = 'size32x32';
    let pluginsListData = [];
    // loop through all plugins in the framework
    let pluginsLoaded = i2b2.PLUGIN.model.plugins;
    for (let pluginName in pluginsLoaded) {
        let pluginRef = pluginsLoaded[pluginName];
        if (pluginRef) {
            let pluginRecord = {};
            // change the entry id
            pluginRecord.id = pluginName;
            pluginRecord.name = "pluginViewList-"+pluginName;
            // change the plugin's icon
            try {
                if (pluginRef.icons && pluginRef.icons[xIconVarName]) {
                    pluginRecord.iconSrc = pluginRef.assetDir + pluginRef.icons[xIconVarName];

                } else {
                    pluginRecord.iconSrc = i2b2.PLUGIN.cfg.config.assetDir+i2b2.PLUGIN.cfg.config.defaultListIcons[xIconVarName];
                }
            } catch(e) {}
            // change name and description
            try {
                if (pluginRef.title) {
                    pluginRecord.title = pluginRef.title;
                } else {
                }
            } catch(e) {}
            try {
                if (pluginRef.description) {
                     pluginRecord.description = pluginRef.description;
                 } else {
                    pluginRecord.description = "<I>No description available.</I>";
                }
            } catch(e) {}
            //YAHOO.util.Event.addListener(pluginRecord.id, "click", i2b2.PLUGINMGR.view.list.recordClick);
            pluginsListData.push(pluginRecord);
        }
    }

    let pluginTemplateData = {"pluginDetail": pluginsListData};
    let pluginListing = $("<div id='pluginListWrapper'></div>");
    $("body").append(pluginListing);
    let pluginListingTemplate = Handlebars.compile(template);
    $(pluginListingTemplate(pluginTemplateData)).appendTo(pluginListing);
};

i2b2.PLUGIN.list.filterByCategory = function(){
  //TO implement display by category functionality
};

i2b2.PLUGIN.list.loadPlugin= function(pluginId){
    i2b2.PLUGIN.view.newInstance(pluginId);
};


// ================================================================================================== //
i2b2.events.afterLogin.add(
    (function() {
        $.ajax("js-i2b2/cells/PLUGIN/templates/PluginListing.html", {
            success: (template) => {
              i2b2.PLUGIN.list.load(template);
            },
            error: (error) => { console.error("Could not retrieve template: PluginListing.html"); }
        });
    })
);