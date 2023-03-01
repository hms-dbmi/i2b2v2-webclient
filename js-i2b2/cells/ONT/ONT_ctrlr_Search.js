/**
 * @projectDescription	Event controller for functionality in the "Find By" sub-tab.
 * @inherits 	i2b2.ONT.ctrlr
 * @namespace	i2b2.ONT.ctrlr.Search
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.7.12
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 * updated 01-12-18: Mauro Bucalo
 * hierarchical result display 08-19 by Jeff Klann, PhD
 */

i2b2.ONT.ctrlr.Search = {
    clickSearch: function() {
        // hide nav and show search results
        i2b2.ONT.view.nav.treeview.hide();
        i2b2.ONT.view.search.treeview.show();

        let status = $("#i2b2OntSearchStatus");
        status[0].innerHTML = "Searching...";
        status.show();

        i2b2.ONT.model.searchResults = {};
        let search_info = {};
        search_info.SearchStr = $("#searchTermText").val();
        let searchFilterElem = $("#searchFilter");
        let filterValue = searchFilterElem.data("selectedFilterValue");
        let filterType = searchFilterElem.data("selectedFilterType");
        if (filterType === "category") {
            search_info.Category = filterValue;
            search_info.Strategy = "contains";
            i2b2.ONT.ctrlr.Search.doNameSearch(search_info);
        } else {
            //Search by code
            search_info.Coding =  filterValue;
            i2b2.ONT.ctrlr.Search.doCodeSearch(search_info);
        }
    },
// ================================================================================================== //
    doNameSearch: function(inSearchData) {
        // inSearchData is expected to have the following attributes:
        //   SearchStr:  what is being searched for
        //   Category: what category is being searched.
        //   Strategy: what matching strategy should be used

        i2b2.ONT.model.searchParams = inSearchData;
        i2b2.ONT.model.searchResultCount = 0;
        i2b2.ONT.model.searchResultsExceeded = false;

        // Debug: add time check
        let mytime = new Date().getTime();

        // VERIFY that the above information has been passed
        if (!inSearchData) return false;

        // special client processing to search all categories
        let searchCats = [];
        if (inSearchData.Category === "ALL CATEGORIES") {
            let d = i2b2.ONT.model.Categories;
            let l = d.length;
            // build list of all categories to search
            for (let i=0; i<l; i++) {
                let cid = d[i].key;
                cid = cid.substring(2);
                cid = cid.substring(0,cid.indexOf("\\"));
                if (cid !== null) searchCats.push(cid);
            }
        } else {
            // just a single category to search
            searchCats.push(inSearchData.Category);
        }

        let scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        // define our callback function
        scopedCallback.callback = function(results) {
            searchCatsCount++;

            // extract any returned info
            let hasError = false;
            if (results.error) {
                let status = i2b2.h.XPath(results.refXML, "//status/text()")[0].nodeValue;
                if (status == "MAX_EXCEEDED") {
                    i2b2.ONT.model.searchResultsExceeded = true;
                } else {
                    hasError = true;
                }
            }
            if (!hasError) {
                let c = results.refXML.getElementsByTagName('concept');
                for (let i=0; i<1*c.length; i++) {
                    i2b2.ONT.model.searchResultCount++;
                    i2b2.ONT.ctrlr.Search.addResultNode(c[i], true);
                }
            } else {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }

            // search is finished
            if (searchCatsCount === searchCats.length) {
                // How long did it take?
                let outtime = new Date().getTime()-mytime;
                console.log("ONT:Search took "+outtime+"ms");
                let status = $("#i2b2OntSearchStatus");
                if (i2b2.ONT.model.searchResultCount === 0) {
                    status[0].innerHTML = "No Records Found.";
                } else {
                    status[0].innerHTML = "Found " + i2b2.ONT.model.searchResultCount + " Records...";
                    i2b2.ONT.ctrlr.Search.backfillResultNodes();
                }
            }
        };


        // add AJAX options
        let searchOptions = {};
        searchOptions.ont_max_records = "max='200'";
        searchOptions.ont_synonym_records = false;
        searchOptions.ont_hidden_records = i2b2.ONT.view.nav.params.hiddens;
        searchOptions.ont_reduce_results = false;
        searchOptions.ont_hierarchy = false;
        searchOptions.ont_search_strategy = inSearchData.Strategy;
        searchOptions.ont_search_string = inSearchData.SearchStr;

        let totalCount = 0;
        let searchCatsCount = 0;
        for (let i=0; i<searchCats.length; i++) {
            searchOptions.ont_category = searchCats[i];
            i2b2.ONT.ajax.GetNameInfo("ONT:FindBy", searchOptions, scopedCallback);
        }
    },

// ================================================================================================== //
    doCodeSearch: function(inSearchData) {
        // VERIFY that the above information has been passed
        if (!inSearchData) return false;

        i2b2.ONT.model.searchParams = inSearchData;
        i2b2.ONT.model.searchResultCount = 0;
        i2b2.ONT.model.searchResultsExceeded = false;

        // Debug: add time check
        let mytime = new Date().getTime();

        // scope our callback function
        let scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        // define our callback function
        scopedCallback.callback = function(results) {

            // How long did it take?
            let outtime = new Date().getTime()-mytime;
            console.log("ONT:Search took "+outtime+"ms");

            let hasError = false;
            if (results.error) {
                let status = i2b2.h.XPath(results.refXML, "//status/text()")[0].nodeValue;
                if (status == "MAX_EXCEEDED") {
                    i2b2.ONT.model.searchResultsExceeded = true;
                } else {
                    hasError = true;
                }
            }
            if (!hasError) {
                let c = results.refXML.getElementsByTagName('concept');

                let status = $("#i2b2OntSearchStatus");
                if (c.length === 0) {
                    status[0].innerHTML = "No Records Found.";
                } else {
                    status[0].innerHTML = "Found " + c.length + " Records...";
                }
                status.show();

                for (let i=0; i<1*c.length; i++) {
                    i2b2.ONT.model.searchResultCount++;
                    i2b2.ONT.ctrlr.Search.addResultNode(c[i], true);
                }
                i2b2.ONT.ctrlr.Search.backfillResultNodes();
            } else {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }
        };

        // add options
        let searchOptions = {};
        searchOptions.ont_max_records = "max='200'";
        searchOptions.ont_synonym_records = false;
        searchOptions.ont_hidden_records = i2b2.ONT.view.nav.params.hiddens;
        searchOptions.ont_search_strategy = "exact";
        searchOptions.ont_search_coding = (inSearchData.Coding === 'ALL CODING'  ? '' : inSearchData.Coding);
        searchOptions.ont_search_string = inSearchData.SearchStr;
        i2b2.ONT.ajax.GetCodeInfo("ONT:Search", searchOptions, scopedCallback);
    },

// ================================================================================================== //
    addResultNode: function(node, highlight) {
        // extract data
        let {sdx, tv} = i2b2.ONT.ctrlr.gen.generateNodeData(node);

        // build the path that the node sits on in ONT search results data model
        let model = i2b2.ONT.model.searchResults;
        let paths = sdx.sdxInfo.sdxKeyValue.substr(2).split('\\');
        let parent = model;
        let fullPath = "\\\\";
        let root;
        do {
            let subpath = paths.shift();
            if (subpath.trim().length) {
                if (parent[subpath] === undefined) parent[subpath] = {};
                fullPath = fullPath + subpath + "\\";
//                let root = i2b2.ONT.model.Categories.filter((node) => { return node.key === fullPath });
                if (root === undefined) {
                    root = i2b2.ONT.model.Categories.filter((node) => { return fullPath.indexOf(node.dim_code) > 0 });
                    if (root.length) {
                        root = root.pop();
                        let temp = i2b2.ONT.ctrlr.gen.generateNodeData(false, root);
                        parent[subpath]._$R$_ = temp.tv;
                    } else {
                        root = undefined;
                    }
                }
                parent = parent[subpath];
            }
        } while (paths.length > 0);
        parent['_$$_'] = tv;
        // color the node for matching our search criteria
        if (highlight) parent['_$$_'].icon += " highlight";
    },

// ================================================================================================== //
    backfillResultNodes: function() {
        let model = i2b2.ONT.model.searchResults;
        let nodesToLoad = [];
        let loadCount = 0;
        let func_recurseWalk = (targetNode, path) =>  {
            let loaded = false;
            for (let node in targetNode) {
                if (node === '_$$_' || node === '_$R$_') {
                    loaded = true;
                } else {
                    func_recurseWalk(targetNode[node], path + node + "\\");
                }
            }
            if (!loaded) nodesToLoad.push(path);
        };
        // start recursion at the roots
        for (let initial in model) {
            func_recurseWalk(model[initial], "\\\\" + initial + "\\");
        }
        loadCount = nodesToLoad.length;

        // fire off requests to the server
        let scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        // define our callback function
        scopedCallback.callback = function(results) {
            if (!results.error) {
                let c = results.refXML.getElementsByTagName('concept');
                for(let i=0; i<1*c.length; i++) {
                    i2b2.ONT.ctrlr.Search.addResultNode(c[i]);
                }
            } else {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }

            // see if we are done with all our requests
            loadCount = loadCount - 1;
            if (loadCount === 0) {
                // render the results tree
                console.warn("Render Search Results Treeview!");
                let treeStruct = [];
                let func_crawl_builder = (node, parent) => {
                    let ret = [];
                    let bypass = (node._$$_ === undefined && node._$R$_ === undefined) || (node._$$_ !== undefined && parent === null);
                    if (bypass) {
                        // passes back only a collection of child nodes (which should be built)
                        // this bubbles up navigatable nodes through non-navigatable nodes
                        for (let subpath in node) {
                            if (!["_$$_", "_$R$_"].includes(subpath)) {
                                ret = ret.concat(func_crawl_builder(node[subpath], parent));
                            }
                        }
                    } else {
                        // passes back current node fully built with its "nodes" attribute populated
                        ret = node._$$_ !== undefined ? node._$$_ : node._$R$_;
                        ret.state = {
                            loaded: true,
                            expanded: true
                        };
                        let children = [];
                        for (let subpath in node) {
                            if (!["_$$_", "_$R$_"].includes(subpath)) {
                                children = children.concat(func_crawl_builder(node[subpath], node));
                            }
                        }
                        ret.nodes = children
                    }
                    return ret;
                };

                for (let subpath in i2b2.ONT.model.searchResults) {
                    let subtree = func_crawl_builder(i2b2.ONT.model.searchResults[subpath], null);
                    treeStruct = treeStruct.concat(subtree);
                }

                // display the tree
                i2b2.ONT.view.search.displayResults(treeStruct);
            }
        };

        // add options
        let searchOptions = {};
        searchOptions.ont_max_records = "max='200'";
        searchOptions.ont_synonym_records = false;
        searchOptions.ont_hidden_records = false;
        do {
            searchOptions.concept_key_value = nodesToLoad.pop();
            if (searchOptions.concept_key_value !== undefined) i2b2.ONT.ajax.GetTermInfo("ONT:Search", searchOptions, scopedCallback);
        } while (nodesToLoad.length > 0);
    }
};
