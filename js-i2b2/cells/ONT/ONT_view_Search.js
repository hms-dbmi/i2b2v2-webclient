/**
 * @projectDescription	View controller for ONT's "Term Search" .
 * @inherits 	i2b2.ONT.view
 * @namespace	i2b2.ONT.view.search
 * @author		Marc-Danie
 * @version 	2.0
 * ----------------------------------------------------------------------------------------
 */
i2b2.ONT.view.search = {};

i2b2.ONT.view.search.template = {};

i2b2.ONT.view.search.toggleSearchOptions = function(elem){
    let currentVal = $(elem).val();
    if (currentVal === "coding"){
        $("#categoryOptions").addClass("hidden");
        $("#codingOptions").removeClass("hidden");
    } else {
        $("#categoryOptions").removeClass("hidden");
        $("#codingOptions").addClass("hidden");
    }
};

//================================================================================================== //
i2b2.ONT.view.search.handleSearchInputChange = function(newValue, oldValue){
    i2b2.ONT.view.search.toggleSearchClearIcon(newValue);
    i2b2.ONT.view.search.enableSearch(newValue);

    if(!newValue){
        i2b2.ONT.view.search.clearSearchInput();
    }
};
//================================================================================================== //

i2b2.ONT.view.search.enableSearch = function(newValue){
    let searchType = $("#searchFilter").data("selectedFilterType");
    if ((newValue && newValue.trim().length > 2 && searchType === 'category' ) || (newValue && newValue.trim().length > 0 && (searchType === 'coding' || $("#searchFilter").data("selectedFilterValue") === 'ALL CODING'))) {
        $("#submitTermSearch").attr('disabled', false);
    } else {
        $("#submitTermSearch").attr('disabled', true);
    }
};

//================================================================================================== //

i2b2.ONT.view.search.toggleSearchClearIcon = function(newValue){
    if (newValue){
        $("#termSearchClearBtn .clearIcon").removeClass("invisible");
        $("#termSearchClearBtn").attr('disabled', false);
    } else {
        $("#termSearchClearBtn .clearIcon").addClass("invisible");
        $("#termSearchClearBtn").attr('disabled', true);
    }
};

//================================================================================================== //

i2b2.ONT.view.search.clearSearchInput = function(){
    $("#searchTermText").val("");
    $("#searchTermError").empty();

    // Reset dropdown menu settings
    $("#searchFilterText").text("Any Category");
    $("#searchFilter").data("selectedFilterValue", "ALL CATEGORIES").data("selectedFilterType", "category");

    // hide and clear the search results
    i2b2.ONT.view.search.treeview.hide();
    i2b2.ONT.view.search.treeview.data('treeview').clear();

    // show the navigation treeview
    i2b2.ONT.view.nav.treeview.show();
    i2b2.ONT.view.search.toggleSearchClearIcon();
};

//================================================================================================== //

i2b2.ONT.view.search.initSearch = function(container){
    // Load the finder template
    $.ajax("js-i2b2/cells/ONT/assets/OntologyFinder.html", {
        success: (template) => {
            let finderTemplate = Handlebars.compile(template);
            $(finderTemplate({})).prependTo(container);

            //init search result tooltip
            $(".srTooltip").tooltip();
        },
        error: (error) => { console.error("Could not retrieve template: OntologyFinder.html"); }
    });
    // add the status DIV
    let status = $('<div id="i2b2OntSearchStatus"></div>').prependTo(container);
    status.hide();
    // add the results treeview
    let treeTarget = $('<div id="i2b2TreeviewOntSearch"></div>').prependTo(container);
    // create an empty treeview for navigation
    i2b2.ONT.view.search.treeview = $(treeTarget).treeview({
        showBorder: false,
        onhoverColor: "rgba(205, 208, 208, 0.56)",
        highlightSelected: false,
        dynamicLoading: false,
        levels: 1,
        data: []
    });
    i2b2.ONT.view.search.treeview.on('onRedraw', () =>{
        // attach drag drop attribute after the tree has been redrawn
        i2b2.ONT.view.search.treeview.find('li:not(:has(span.tvRoot))').attr("draggable", true);

        // put blank title attribute to suppress display of browser tooltip
        i2b2.h.suppressTvIconTitle();

        // TECHNICAL DEBT: Change this when CSS selector :has() is implemented
        // applies the highlighting CSS style to indicated nodes
        $("#i2b2TreeviewOntSearch li:has(.sdxStyleONT-CONCPT.highlight)").addClass("search-highlighted");
    });
    i2b2.ONT.view.search.treeview.on('onDrag', i2b2.sdx.Master.onDragStart);

    // -------------------- setup context menu --------------------
    i2b2.ONT.view.search.ContextMenu = i2b2.ONT.view.nav.createContextMenu('i2b2TreeviewOntSearch',i2b2.ONT.view.search.treeview);
};

//================================================================================================== //

i2b2.ONT.view.search.displayResults = function(treeData) {
    $("#i2b2OntSearchStatus").hide();
    let treeview = i2b2.ONT.view.search.treeview.data('treeview');
    treeview.clear();
    treeview.init({data: treeData});
};

//================================================================================================== //

i2b2.ONT.view.search.initSearchOptions = function(){
    $.ajax("js-i2b2/cells/ONT/templates/OntologyFinderFilterOptions.html", {
        success: (template) => {
            // generate a list of categories
            let submenuOptions = Handlebars.compile(template);
            let categories = [];
            for (let i=0; i<i2b2.ONT.model.Categories.length; i++) {
                let cat = i2b2.ONT.model.Categories[i];
                let catVal = cat.key.substring(2,cat.key.indexOf('\\',3));
                categories.push({
                    name: cat.name,
                    value: catVal,
                    filterType: "category"
                });
            }
            $(submenuOptions({"option": categories})).appendTo("#categorySubmenu");

            // generate a list of coding systems options
            let codingSystems = [];
            for (let i=0; i<i2b2.ONT.model.Schemes.length; i++) {
                let cat = i2b2.ONT.model.Schemes[i];
                codingSystems.push({
                    name: cat.name,
                    value: cat.key,
                    filterType: "coding"
                });
            }
            $(submenuOptions({"option": codingSystems})).appendTo("#codingSubmenu");

            $("#liCat").hover(function(){
                $("#codingSubmenu").hide().closest("li").removeClass("highlight-menu-item");
                $("#categorySubmenu").css("left", "100%").show();
            });

            $("#liCoding").hover(function(){
                $("#categorySubmenu").hide().closest("li").removeClass("highlight-menu-item");
                $("#codingSubmenu").css("left", "100%").show();
            });

            $("#i2b2FinderOnt .submenu li").on("click", function(){
                $("#i2b2FinderOnt .active").removeClass("active");
                let liItem = $(this).find("button");
                let newDisplayText = liItem.addClass("active").text();
                let filterValue = liItem.addClass("active").data("searchFilterValue");
                let filterType = liItem.data("searchFilterType");
                $("#searchFilterText").text(newDisplayText).prop('title', newDisplayText);
                $("#searchFilter").data("selectedFilterValue", filterValue).data("selectedFilterType", filterType);
            });

            $("#searchActions .reset").click(function() {
                i2b2.ONT.view.search.clearSearchInput();
            });

            $('#i2b2FinderOnt .navbar-nav').on('shown.bs.dropdown', function () {
                let navBarMain = $("#i2b2FinderOnt .navbarMain .active")
                let parentMenu = navBarMain.closest(".submenu").closest("li");
                navBarMain.closest(".submenu").each(function(){
                    $(this).css("left", parentMenu.width());
                    $(this).show();
                }).closest("li").addClass("highlight-menu-item");
            });

            $('#searchTermText').on('keypress',function(e) {
                if(e.which === 13) {
                    // enter key was pressed while in the search term entry box
                    if ($("#submitTermSearch").attr('disabled') === undefined) i2b2.ONT.ctrlr.Search.clickSearch();
                }
            });

        },
        error: (error) => { console.error("Could not retrieve template: OntologyFinderFilterOption.html"); }
    });

    $('#i2b2FinderOnt .navbar-nav').on('show.bs.dropdown', function () {
        $(".submenu").hide();
        $("#i2b2FinderOnt .navbarMain .active").closest(".submenu").each(function(){
            $(this).show();
        }).closest("li").addClass("highlight-menu-item");
    });
};
