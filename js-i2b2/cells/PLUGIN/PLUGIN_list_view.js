if (i2b2.PLUGIN.view === undefined) i2b2.PLUGIN.view = {};
i2b2.PLUGIN.view.list = {};
i2b2.PLUGIN.view.list.category = {
    ALL: "ALL"
};

i2b2.PLUGIN.view.list.mode = {
    DETAIL:  "DETAIL",
    SUMMARY: "SUMMARY"
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.buildListCategory = function() {

    let pluginsListCategories = [i2b2.PLUGIN.view.list.category.ALL];

    // loop through all plugins in the framework
    let pluginsLoaded = i2b2.PLUGIN.model.plugins;
    for (let pluginName in pluginsLoaded) {
        let pluginRef = pluginsLoaded[pluginName];
        pluginRef.category.forEach((category) => {
            let uppercaseCategory = category.toUpperCase();
            if (pluginsListCategories.indexOf(uppercaseCategory) === -1) pluginsListCategories.push(uppercaseCategory);
        });
    }

    pluginsListCategories.sort();
    return pluginsListCategories;
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.buildListData = function(mode, category, searchString) {
    let xIconVarName = 'size32x32';
    if (mode === i2b2.PLUGIN.view.list.mode.SUMMARY) xIconVarName = 'size16x16';

    let pluginsListData = [];
    // loop through all plugins in the framework
    let pluginsLoaded = i2b2.PLUGIN.model.plugins;

    for (let pluginName in pluginsLoaded) {
        let pluginRef = pluginsLoaded[pluginName];
        let pluginCategories = [];
        pluginRef.category.forEach((cat) => {
            pluginCategories.push(cat.toUpperCase());
        });
        if ((!searchString
                || (searchString && (pluginRef.title.toLowerCase().includes(searchString.toLowerCase())
                    || pluginRef.description.toLowerCase().includes(searchString.toLowerCase()))))
            && (!category || category === i2b2.PLUGIN.view.list.category.ALL || pluginCategories.indexOf(category) !== -1)) {

            let pluginRecord = {};
            // change the entry id
            pluginRecord.id = pluginName;
            pluginRecord.name = "pluginViewList-" + pluginName;
            // change the plugin's icon
            if (pluginRef.icons && pluginRef.icons[xIconVarName]) {
                const loc = pluginName.replaceAll('.', '/');
                pluginRecord.iconSrc = "plugins/" + loc + "/" + pluginRef.assetDir + "/" + pluginRef.icons[xIconVarName];
            } else {
                pluginRecord.iconSrc = i2b2.PLUGIN.cfg.config.assetDir + i2b2.PLUGIN.cfg.config.defaultListIcons[xIconVarName];
            }

            // change name and description
            if (pluginRef.title) pluginRecord.title = pluginRef.title;
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


// ================================================================================================== //
i2b2.PLUGIN.view.list.load = function(template) {
    let pluginListCategory = i2b2.PLUGIN.view.list.buildListCategory();
    let pluginTemplateData = {"pluginCategory": pluginListCategory};
    let pluginListing = $("<div id='pluginListWrapper'></div>");
    $("#pluginListView").append(pluginListing);
    let pluginTemplate = Handlebars.compile(template);
    i2b2.PLUGIN.view.list.listContainerTemplate = pluginTemplate;

    $(pluginTemplate(pluginTemplateData)).appendTo(pluginListing);

    $.ajax("js-i2b2/cells/PLUGIN/templates/PluginListing.html", {
        success: (template) => {
            i2b2.PLUGIN.view.list.pluginListTemplate = Handlebars.compile(template);
            i2b2.PLUGIN.view.list.changeListMode(i2b2.PLUGIN.view.list.mode.DETAIL);

            // switch to default category if param is set
            i2b2.PLUGIN.view.list.initialCategory();
        },
        error: (error) => { console.error("Could not retrieve template: PluginListing.html"); }
    });
    // Add a class to the Analysis Tools Tab
    let panelTabs = document.querySelectorAll('.lm_tab');
    panelTabs.forEach((tab) => {
        if (tab.textContent === 'Analysis Tools') tab.classList.add('plugin-listing');
    });
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.initialCategory = function() {
    const param_config_name = 'DEFAULT_PLUGIN_CATEGORY';
    // set the default category if set with DEFAULT_PLUGIN_CATEGORY param in global or project level
    let initialCategory = i2b2.PLUGIN.view.list.category.ALL;
    if (i2b2.hive.model.globalParams[param_config_name]) initialCategory = i2b2.hive.model.globalParams[param_config_name].innerHTML;
    if (i2b2.PM.model.projects[i2b2.PM.model.login_project].details[param_config_name]) initialCategory = i2b2.PM.model.projects[i2b2.PM.model.login_project].details[param_config_name];
    initialCategory = initialCategory.toUpperCase();
    // make sure the category exists, if so then set it
    for (let t of $("#pluginCategory")[0].options) {
        if (t.value.toUpperCase() === initialCategory) {
            $("#pluginCategory").val(t.value);
            i2b2.PLUGIN.view.list.renderList(i2b2.PLUGIN.view.list.mode.DETAIL, t.value);
            break;
        }
    }
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.filterByCategory = function(category) {
    let listMode = $("#pluginListMode").val();
    i2b2.PLUGIN.view.list.renderList(listMode, category);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.changeListMode = function(listMode) {
    let category = $("#pluginCategory").val();
    i2b2.PLUGIN.view.list.renderList(listMode, category);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.renderList = function(listMode, category, searchString) {

    let pluginsListData = i2b2.PLUGIN.view.list.buildListData(listMode, category, searchString);
    let pluginTemplateData = {
        "pluginDetail": pluginsListData
    };

    if (listMode === i2b2.PLUGIN.view.list.mode.SUMMARY) {
        pluginTemplateData = {
            "pluginSummary": pluginsListData
        };
    }

    let pluginList = $("#pluginList");
    pluginList.empty();
    $(i2b2.PLUGIN.view.list.pluginListTemplate(pluginTemplateData)).appendTo(pluginList);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.loadPlugin = function(pluginId, initializationData) {
    i2b2.PLUGIN.view.newInstance(pluginId,  initializationData);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.resetSearchPluginList = function() {
    $("#pluginListMode").val(i2b2.PLUGIN.view.list.mode.DETAIL);
    $("#pluginCategory").val(i2b2.PLUGIN.view.list.category.ALL);
    $("#pluginSearchText").val("");
    i2b2.PLUGIN.view.list.renderList(i2b2.PLUGIN.view.list.mode.DETAIL, i2b2.PLUGIN.view.list.category.ALL);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.searchPluginList = function() {
    let category = $("#pluginCategory").val();
    let listMode = $("#pluginListMode").val();
    let searchString = $("#pluginSearchText").val();
    i2b2.PLUGIN.view.list.renderList(listMode, category, searchString);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.updateCategories = function() {
    let pluginListCategory = i2b2.PLUGIN.view.list.buildListCategory();
    let pluginTemplateData = {"pluginCategory": pluginListCategory};
    let pluginListing = $("<div id='pluginListWrapper'></div>");
    $("#pluginListView").empty().append(pluginListing);
    $(i2b2.PLUGIN.view.list.listContainerTemplate(pluginTemplateData)).appendTo(pluginListing);
    i2b2.PLUGIN.view.list.changeListMode(i2b2.PLUGIN.view.list.mode.DETAIL);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.updatePluginDescription = function() {
    let pluginListCategory = i2b2.PLUGIN.view.list.buildListCategory();
    let pluginTemplateData = {"pluginCategory": pluginListCategory};
    let pluginListing = $("<div id='pluginListWrapper'></div>");
    $("#pluginListView").empty().append(pluginListing);
    $(i2b2.PLUGIN.view.list.listContainerTemplate(pluginTemplateData)).appendTo(pluginListing);
    i2b2.PLUGIN.view.list.changeListMode(i2b2.PLUGIN.view.list.mode.DETAIL);
};


// ================================================================================================== //
i2b2.PLUGIN.view.list.onPluginFrameLoad = function() {
    if (!i2b2.PM.model.data.loginXMLStr) {
        i2b2.PM.model.data.loginXMLStr = i2b2.h.Xml2String(i2b2.PM.model.data.refXML);
        delete i2b2.PM.model.data.refXML;
    }

    i2b2.PM.model.data.login_project = i2b2.PM.model.login_project;
    i2b2.PM.model.data.login_projectname = i2b2.PM.model.login_projectname;

    let loginData = JSON.stringify(i2b2.PM.model.data);
    document.getElementById("pluginframe").contentWindow.postMessage(loginData, window.location.origin);
};


// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "PLUGIN") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.PLUGIN.view.list",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE Analysis Tools
                let mainDiv = $("<div class='cellWhite' id='pluginListView'></div>");
                container.getElement().append(mainDiv);

                $.ajax("js-i2b2/cells/PLUGIN/templates/PluginListingContainer.html", {
                    success: (template) => {
                        i2b2.PLUGIN.view.list.load(template);
                    },
                    error: (error) => { console.error("Could not retrieve template: PluginListingContainer.html"); }
                });

            }).bind(this)
        );
    }
});
