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
    i2b2.ONT.view.search.enableSearch("");
    $("#searchTermError").empty();
  
    // reset the info icon
    $('i.srTooltip').attr('data-bs-original-title', "A maximum of " + i2b2.ONT.view.nav.params.max + " records per category will be returned.");
    $('i.srTooltip').removeClass("warn");

    // hide and clear the search results
    i2b2.ONT.view.search.treeview.hide();
    i2b2.ONT.view.search.treeview.data('treeview').clear();

    // show the navigation treeview
    i2b2.ONT.view.nav.treeview.show();
    i2b2.ONT.view.search.toggleSearchClearIcon();

    $("#ontNavTreeToggle").addClass("hidden");
    $("#ontSearchTreeToggle").addClass("hidden");
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
            let temp = "A maximum of " + i2b2.ONT.view.nav.params.max + " records per category will be returned.";
            $('.srTooltip').attr('data-bs-original-title', temp);
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
        data: [],
        showTags: true
    });
    i2b2.ONT.view.search.treeview.on('onRedraw', () =>{
        // attach drag drop attribute after the tree has been redrawn
        i2b2.ONT.view.search.treeview.find('li:not(:has(span.tvRoot))').attr("draggable", true);
        // disable dragging for some nodes in the search tree
        i2b2.ONT.view.search.treeview.find('li:has(span.noDrag)').attr("draggable", false);

        // TECHNICAL DEBT: Change this when CSS selector :has() is implemented
        // applies the highlighting CSS style to indicated nodes
        $("#i2b2TreeviewOntSearch li:has(.sdxStyleONT-CONCPT.highlight)").addClass("search-highlighted");
        i2b2.ONT.view.search.treeview.find('li:has(span.inactiveTerm)').attr("draggable", false)
            .addClass("inactiveTerm").find(".expand-icon").css("color","#212529");

    });
    i2b2.ONT.view.search.treeview.on('onDrag', i2b2.sdx.Master.onDragStart);

    // -------------------- setup context menu --------------------
    i2b2.ONT.view.search.ContextMenu = i2b2.ONT.view.nav.createContextMenu('i2b2TreeviewOntSearch',i2b2.ONT.view.search.treeview, true);
};
// ================================================================================================== //
i2b2.ONT.view.search.nodeClickedAction =  function(event) {
    let target = $(event.target);
    let nodeId = parseInt(target.closest('li.list-group-item').attr('data-nodeid'));
    let nodeData = i2b2.ONT.view.search.treeview.treeview("getNodes", (snode)=> (snode.nodeId === nodeId));
    if(nodeData.length > 0) {
        i2b2.ONT.view.info.load(nodeData[0].i2b2, true);
    }
};
//================================================================================================== //

i2b2.ONT.view.search.displayResults = function(treeData) {
    $("#i2b2OntSearchStatus").hide();
    let treeview = i2b2.ONT.view.search.treeview.data('treeview');
    treeview.clear();
    treeview.init({data: treeData, showTags: true});
    i2b2.ONT.view.search.treeview.on('click', i2b2.ONT.view.search.nodeClickedAction);
};
//================================================================================================== //

i2b2.ONT.view.search.showModifiers = function(node){
    i2b2.sdx.TypeControllers.CONCPT.LoadModifiers(node, function(newNodes) {
        if (newNodes.length === 0) {
            i2b2.ONT.view.nav.displayAlertDialog({
                title: "Show Modifiers",
                alertMsg: "No modifiers found for " + node.text + "."
            });
            node.hasModifier = false;
        } else {
            // add data for proper matching of parent nodes
            newNodes.forEach((newNode) => {
                newNode.parentKey = node.key;
                newNode.parentText = node.text;
            })

            //get existing children
            let getAllChildren = function (childNode, allChildren) {
                if (childNode.nodes) {
                    childNode.nodes.forEach((n) => {
                        let parentNode = i2b2.ONT.view.search.treeview.treeview('getParent', [n]);
                        n.parentKey = parentNode.key;
                        n.parentText = parentNode.text;
                        allChildren.push(n);

                        if (n.nodes !== undefined && n.nodes.length >= 0) {
                            return getAllChildren(n, allChildren);
                        }

                    });
                }
            }

            let temp_childrenAll = [];
            getAllChildren(node, temp_childrenAll);
            if(Array.isArray(node.nodes)) {
                let temp_childrenId = node.nodes.map(function (node) {
                    return node.nodeId;
                });
                i2b2.ONT.view.search.treeview.treeview('deleteNodes', [temp_childrenId]);
            }
            //append existing children so that the modifiers appear first in the tree
            newNodes = newNodes.concat(temp_childrenAll);
            node.state.expanded = true;
            i2b2.ONT.view.search.treeview.treeview('addNodes', [
                newNodes,
                function(parent, child) { return (parent.key === child.parentKey) && (parent.text === child.parentText) },
                false
            ]);

            // render tree
            i2b2.ONT.view.search.treeview.treeview('redraw', []);
        }
    }, true);
}
//================================================================================================== //

i2b2.ONT.view.search.viewInNavTree = function(node, nodeSubList){
    let parentNode = i2b2.ONT.view.search.treeview.treeview('getParent', node.nodeId);

    //if this is a root node
    if (parentNode.nodeId === undefined && nodeSubList === undefined) {
        nodeSubList = [node];
    }
    if (parentNode.nodeId === undefined && (nodeSubList !== undefined  && nodeSubList.length >= 0)) {
        let nodesToExpand = [];
        nodesToExpand = nodesToExpand.concat(nodeSubList);

        $("#ontNavTreeToggle").click();

        let currentNode = nodesToExpand.shift();
        // look up node in search tree in the nav tree using the key
        if (!currentNode.key.endsWith("\\")) currentNode.key = currentNode.key + "\\";
        let topLevelNode = i2b2.ONT.view.nav.treeview.treeview('getNodes', function(snode) {
            return snode.key === currentNode.key;
        });

        // skip over any nodes that are already loaded in the nav tree
        while (nodesToExpand.length >= 1 && (topLevelNode.length === 1 && topLevelNode[0].state.loaded === true)) {
            //expand any collapsed nodes that were already loaded
            if (topLevelNode[0].state.loaded === true && topLevelNode[0].state.expanded === false) {
                i2b2.ONT.view.nav.treeview.treeview('expandNode',topLevelNode[0].nodeId);
            }

            currentNode = nodesToExpand.shift();
            // look up node in search tree in the nav tree using the key
            if (!currentNode.key.endsWith("\\")) currentNode.key = currentNode.key + "\\";
            topLevelNode = i2b2.ONT.view.nav.treeview.treeview('getNodes', function(snode) {
                return snode.key === currentNode.key;
            });
        }

        // if this is the last node highlight it since that is the node the user selected
        if (nodesToExpand.length === 0 && topLevelNode.length === 1) {
            let selectNodeElem = $('[data-nodeid="' + topLevelNode[0].nodeId + '"]');
            selectNodeElem.get(0).scrollIntoView({alignToTop: false, behavior: 'smooth', block: 'center'});

            if (nodesToExpand.length === 0) {
                $(".viewInTreeNode").removeClass("viewInTreeNode");
                selectNodeElem.addClass("viewInTreeNode");
            }
        }

        if (topLevelNode.length === 1 && nodesToExpand.length >= 1) {
            topLevelNode = topLevelNode[0];
            let onLoadChildrenComplete = function(nodeData) {
                i2b2.ONT.view.nav.treeview.treeview('expandNode', nodeData.nodeId);

                let currentNode = nodesToExpand.shift();
                // look up node in search tree in the nav tree using the key
                if (!currentNode.key.endsWith("\\")) currentNode.key = currentNode.key + "\\";
                let topLevelNode = i2b2.ONT.view.nav.treeview.treeview('getNodes', function(snode) {
                    return snode.key === currentNode.key;
                });

                if (topLevelNode.length === 0) {
                    console.error("A searched/found ONT node [" + currentNode.key + "] cannot be access via ontology browsing method");
                } else {
                    let selectNodeElem = $('[data-nodeid="' + topLevelNode[0].nodeId + '"]');
                    //scroll to selected node
                    selectNodeElem.get(0).scrollIntoView({alignToTop:false, behavior: 'smooth', block: 'center' });

                    if (nodesToExpand.length >= 1) {
                        i2b2.ONT.view.nav.loadChildren(topLevelNode[0], onLoadChildrenComplete);
                    } else {
                        //highlight the node the user selected
                        $(".viewInTreeNode").removeClass("viewInTreeNode");
                        selectNodeElem.addClass("viewInTreeNode");
                    }
                }
            };
            i2b2.ONT.view.nav.loadChildren(topLevelNode, onLoadChildrenComplete);
        }
    } else {
        if (nodeSubList === undefined) {
            nodeSubList = [node];
        }
        nodeSubList.unshift(parentNode);
        i2b2.ONT.view.search.viewInNavTree(parentNode, nodeSubList);
    }
}
//================================================================================================== //

i2b2.ONT.view.search.initSearchOptions = function(){
    $.ajax("js-i2b2/cells/ONT/templates/OntologyFinderFilterOptions.html", {
        success: (template) => {
            // generate a list of categories
            let submenuOptions = Handlebars.compile(template);
            let categories = [];
            categories.push({
                name: "-Any Category-",
                    value: "ANY",
                    filterType: "category"
            });
            for (let i=0; i<i2b2.ONT.model.Categories.length; i++) {
                let cat = i2b2.ONT.model.Categories[i];
                let catVal = cat.key.substring(2,cat.key.indexOf('\\',3));
                categories.push({
                    name: cat.name,
                    value: catVal,
                    filterType: "category"
                });
            }
            $("#categorySubmenu").empty();
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
            $("#codingSubmenu").empty();
            $(submenuOptions({"option": codingSystems})).appendTo("#codingSubmenu");

            $("#liCat").hover(function(){
                $("#codingSubmenu").hide().closest("li").removeClass("highlight-menu-item");
                $("#categorySubmenu").css("left", "100%").show();
            });

            $("#liCoding").hover(function(){
                $("#categorySubmenu").hide().closest("li").removeClass("highlight-menu-item");
                $("#codingSubmenu").css("left", "100%").show();
            });
            //look at this to get the any category if statement, existing code goes into else of an if search filter value = to any, reseset filter
            $("#i2b2FinderOnt .submenu li").on("click", function(){
                $("#i2b2FinderOnt .active").removeClass("active");
                let liItem = $(this).find("button");
                let newDisplayText = liItem.addClass("active").text();
                let filterValue = liItem.addClass("active").data("searchFilterValue");
                let filterType = liItem.data("searchFilterType");
                if(filterValue === "ANY"){                 
                    // Reset dropdown menu settings
                    $("#searchFilterText").text("Any Category");
                    $("#searchFilter").data("selectedFilterValue", "ALL CATEGORIES").data("selectedFilterType", "category");
               } else{             
                    $("#searchFilterText").text(newDisplayText).prop('title', newDisplayText);
                    $("#searchFilter").data("selectedFilterValue", filterValue).data("selectedFilterType", filterType);
               }
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
            }).on('input', function(e) {
                if(e.target.value.length >= 4){
                    console.log('searchTermText target value is ' + e.target.value);
                    let search_info = {};
                    search_info.Category = "ACT_DX_ICD10_2018_V42";
                    search_info.Strategy = "contains";
                    search_info.searchStr = e.target.value;
                    const suggestList = $("#suggestion-list").empty();

                    let scopedCallback = new i2b2_scopedCallback();
                    scopedCallback.scope = this;
                    // define our callback function
                    scopedCallback.callback = function(results) {
                        // extract any returned info
                        let hasError = false;
                        if (results.error) {
                                hasError = true;
                        }
                        if (!hasError) {
                            let c = results.refXML.getElementsByTagName('concept');
                            const conceptMatch = [];
                            const patientMatch = [];
                            for (let i=0; i<1*c.length; i++) {
                                const name = i2b2.h.getXNodeVal(c[i], 'name');
                                const level = i2b2.h.getXNodeVal(c[i], 'level');
                                const table_name = i2b2.h.getXNodeVal(c[i], 'tablename');
                                const basecode = i2b2.h.getXNodeVal(c[i], 'basecode');

                                let matchLabel = "Concepts";
                                if(basecode){
                                    matchLabel = "Patients";
                                }
                                const label = name + (table_name ? "-" +  table_name : "") + " (" +  level + ( " " + matchLabel)  + ")";
                                const listItem = $('<li><a class="dropdown-item" href="#">' + label + '</li>');
                                listItem.data("category", table_name);
                                listItem.data("name", name);

                                listItem.on("click", function(e){
                                    let parent =$(e.target).parent();
                                    let name = parent.data("name");
                                    $("#searchTermText").val(name);

                                    let category = parent.data("category");
                                    if(category) {
                                        $("#liCat").find('button[data-search-filter-value="' + category +'"]').click();
                                        i2b2.ONT.ctrlr.Search.clickSearch();
                                    }else{
                                        $("#liCat").find('button[data-search-filter-value="' + 'ANY' +'"]').click();
                                    }

                                    suggestList.addClass('d-none');
                                });

                                if(matchLabel === "Concepts"){
                                    conceptMatch.push(listItem);
                                }else{
                                    patientMatch.push(listItem);
                                }
                            }
                            if(patientMatch.length > 0) {
                                suggestList.append('<li><h6 class="dropdown-header fw-bold text-uppercase">Patients</h6></li>');
                                patientMatch.map(p => {
                                    suggestList.append(p);
                                });
                            }
                            if(conceptMatch.length > 0) {
                                if(patientMatch.length > 0) {
                                    suggestList.append('<li><hr class="dropdown-divider"></li>');
                                }
                                suggestList.append('<li><h6 class="dropdown-header fw-bold text-uppercase">Concepts</h6></li>');
                                conceptMatch.map(p => {
                                    suggestList.append(p);
                                });
                            }

                            if(c.length > 0){
                                let dropdownElement = document.getElementById('searchTerm');
                                let bsDropdown = new bootstrap.Dropdown(dropdownElement);
                                bsDropdown.show();
                                suggestList.removeClass('d-none');
                            }
                        } else {
                            console.log("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
                        }
                    };
                    // add AJAX options
                    let searchOptions = {};
                    searchOptions.ont_max_records = "max='200'";
                    searchOptions.ont_synonym_records = false;
                    searchOptions.ont_hidden_records = false;
                    searchOptions.ont_reduce_results = false;
                    searchOptions.ont_hierarchy = false;
                    searchOptions.ont_search_strategy = search_info.Strategy;
                    searchOptions.ont_search_string = search_info.searchStr;
                    searchOptions.ont_category = "";

                    i2b2.ONT.ajax.FindDocuments("ONT:AutoSuggest", searchOptions, scopedCallback);
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

