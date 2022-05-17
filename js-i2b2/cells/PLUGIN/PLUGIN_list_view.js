i2b2.PLUGIN.view.list = {};
i2b2.PLUGIN.view.list.mode = {
    DETAIL:  "DETAIL",
    SUMMARY: "SUMMARY"
};

i2b2.PLUGIN.view.list.buildListCategory = function() {

    let pluginsListCategories = ['ALL'];
    // loop through all plugins in the framework
    let pluginsLoaded = i2b2.PLUGIN.model.plugins;
    for (let pluginName in pluginsLoaded) {
        let pluginRef = pluginsLoaded[pluginName];
        if(pluginsListCategories.indexOf(pluginRef.category) === -1) {
            pluginsListCategories.push(pluginRef.category);
        }
    }

    pluginsListCategories.sort();
    return pluginsListCategories;
};

i2b2.PLUGIN.view.list.buildListData = function(mode){
    let xIconVarName = 'size32x32';
    if(mode === i2b2.PLUGIN.view.list.mode.SUMMARY){
        xIconVarName = 'size16x16';
    }

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

            if (pluginRef.icons && pluginRef.icons[xIconVarName]) {
                pluginRecord.iconSrc = pluginRef.assetDir + pluginRef.icons[xIconVarName];

            } else {
                pluginRecord.iconSrc = i2b2.PLUGIN.cfg.config.assetDir+i2b2.PLUGIN.cfg.config.defaultListIcons[xIconVarName];
            }

            // change name and description
            if (pluginRef.title) {
                pluginRecord.title = pluginRef.title;
            }

            if (pluginRef.description) {
                pluginRecord.description = pluginRef.description;
            } else {
                pluginRecord.description = "<I>No description available.</I>";
            }

            pluginsListData.push(pluginRecord);
        }
    }

    return pluginsListData;
};

i2b2.PLUGIN.view.list.load = function(template){
    let pluginListCategory = i2b2.PLUGIN.view.list.buildListCategory();
    let pluginTemplateData = {"pluginCategory": pluginListCategory};
    let pluginListing = $("<div id='pluginListWrapper'></div>");
    $("body").append(pluginListing);
    let pluginTemplate = Handlebars.compile(template);
    $(pluginTemplate(pluginTemplateData)).appendTo(pluginListing);

    $.ajax("js-i2b2/cells/PLUGIN/templates/PluginListing.html", {
        success: (template) => {
            i2b2.PLUGIN.view.list.pluginListTemplate = Handlebars.compile(template);
            i2b2.PLUGIN.view.list.changeListMode(i2b2.PLUGIN.view.list.mode.DETAIL);
        },
        error: (error) => { console.error("Could not retrieve template: PluginListing.html"); }
    });
};

i2b2.PLUGIN.view.list.filterByCategory = function(){
  //TO implement display by category functionality
};

i2b2.PLUGIN.view.list.changeListMode = function(listMode){
    //TO implement display by category functionality

    let pluginsListData = i2b2.PLUGIN.view.list.buildListData(listMode);

    let pluginTemplateData = {
        "pluginDetail": pluginsListData
    };

    if(listMode === i2b2.PLUGIN.view.list.mode.SUMMARY){
        pluginTemplateData = {
            "pluginSummary": pluginsListData
        };
    }
    let pluginList = $("#pluginList");
    pluginList.empty();
    $(i2b2.PLUGIN.view.list.pluginListTemplate(pluginTemplateData)).appendTo(pluginList);
};

i2b2.PLUGIN.view.list.loadPlugin= function(pluginId){
    $("#pluginListMain").offcanvas("hide");
    i2b2.PLUGIN.view.newInstance(pluginId);
};


// ================================================================================================== //
i2b2.events.afterLogin.add(
    (function() {
        $.ajax("js-i2b2/cells/PLUGIN/templates/PluginListingContainer.html", {
            success: (template) => {
              i2b2.PLUGIN.view.list.load(template);
            },
            error: (error) => { console.error("Could not retrieve template: PluginListingContainer.html"); }
        });
    })
);