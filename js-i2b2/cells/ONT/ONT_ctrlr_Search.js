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
console.group('Load & Execute component file: ONT > ctrlr > Search');
console.time('execute time');

i2b2.ONT.ctrlr.Search = {
    clickSearch: function() {
        i2b2.ONT.model.searchResults = {};
        let search_info = {};
        search_info.SearchStr = $("#searchTermText").val();
        let searchFilterElem = $("#searchFilter");
        let filterValue = searchFilterElem.data("selectedFilterValue");
        let filterType = searchFilterElem.data("selectedFilterType");
        if(filterType === "category") {
            search_info.Category = filterValue;
            search_info.Strategy = "contains";
            i2b2.ONT.ctrlr.Search.doNameSearch(search_info);
        } else{
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

        // Debug: add time check
        let mytime = new Date().getTime();

        // VERIFY that the above information has been passed
        if (!inSearchData) return false;

        // special client processing to search all categories
        let searchCats = [];
        if (inSearchData.Category === "ALL CATEGORIES") {
            let d = i2b2.ONT.model.Categories;
            let l = d.length
            // build list of all categories to search
            for (let i=0; i<l; i++) {
                let cid = d[i].key;
                cid = cid.substring(2);
                cid = cid.substring(0,cid.indexOf("\\"));
                if (cid != null) {
                    searchCats.push(cid);
                }
            }
        } else {
            // just a single category to search
            searchCats.push(inSearchData.Category);
        }

        let scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        // define our callback function
        scopedCallback.callback = function(results) {
            // THIS function is used to process the AJAX results of the getChild call
            //		results data object contains the following attributes:
            //			refXML: xmlDomObject <--- for data processing
            //			msgRequest: xml (string)
            //			msgResponse: xml (string)
            //			error: boolean
            //			errorStatus: string [only with error=true]
            //			errorMsg: string [only with error=true]


            // BUG FIX: WEBCLIENT-139 & WEBCLIENT-150
            searchCatsCount++;

            // How long did it take?
            if (searchCatsCount === searchCats.length) {
                let outtime = new Date().getTime()-mytime;
                console.log("ONT:Search took "+outtime+"ms");
                i2b2.ONT.ctrlr.Search.backfillResultNodes();
            }

            // extract any returned info
            if (!results.error) {
                let c = results.refXML.getElementsByTagName('concept');
                for(let i=0; i<1*c.length; i++) {
                    i2b2.ONT.ctrlr.Search.addResultNode(c[i]);
                }
            } else {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }

        };


        // add AJAX options
        let searchOptions = {};
        searchOptions.ont_max_records = "max='200'";
        searchOptions.ont_synonym_records = false;
        searchOptions.ont_hidden_records = false;
        searchOptions.ont_reduce_results = false;
        searchOptions.ont_hierarchy = false;
        searchOptions.ont_search_strategy = inSearchData.Strategy;
        searchOptions.ont_search_string = inSearchData.SearchStr;

        l = searchCats.length;
        let totalCount = 0;
        let searchCatsCount = 0;

        for (let i=0; i<l; i++) {
            searchOptions.ont_category = searchCats[i];
            i2b2.ONT.ajax.GetNameInfo("ONT:FindBy", searchOptions, scopedCallback);
        }
    },

// ================================================================================================== //
    doCodeSearch: function(inSearchData) {
        // VERIFY that the above information has been passed
        if (!inSearchData) return false;

        // scope our callback function
        let scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = this;
        // define our callback function
        scopedCallback.callback = function(results) {
            // THIS function is used to process the AJAX results of the getChild call
            //		results data object contains the following attributes:
            //			refXML: xmlDomObject <--- for data processing
            //			msgRequest: xml (string)
            //			msgResponse: xml (string)
            //			error: boolean
            //			errorStatus: string [only with error=true]
            //			errorMsg: string [only with error=true]

            let c = results.refXML.getElementsByTagName('concept');
            if (c.length === 0)
            {
                alert("No Records Found");
            }
        };

        // add options
        let searchOptions = {};

        searchOptions.ont_max_records = "max='200'";
        searchOptions.ont_synonym_records = false;
        searchOptions.ont_hidden_records = false;
        searchOptions.ont_search_strategy = "exact";
        searchOptions.ont_search_coding = (inSearchData.Coding === 'ALL CODING'  ? '' : inSearchData.Coding);
        searchOptions.ont_search_string = inSearchData.SearchStr;
        i2b2.ONT.ajax.GetCodeInfo("ONT:Search", searchOptions, scopedCallback);
    },

// ================================================================================================== //
    addResultNode: function(node) {
        // extract data
        let o = {};
        o.xmlOrig = node;
        o.name = i2b2.h.getXNodeVal(node, 'name');
        o.hasChildren = i2b2.h.getXNodeVal(node, 'visualattributes').substring(0, 2);
        o.level = i2b2.h.getXNodeVal(node, 'level');
        o.key = i2b2.h.getXNodeVal(node, 'key');
//console.log("X:"+o.key);
        o.tooltip = i2b2.h.getXNodeVal(node, 'tooltip');
        o.icd9 = '';
        o.table_name = i2b2.h.getXNodeVal(node, 'tablename');
        o.column_name = i2b2.h.getXNodeVal(node, 'columnname');
        o.operator = i2b2.h.getXNodeVal(node, 'operator');
        o.dim_code = i2b2.h.getXNodeVal(node, 'dimcode');

        // build the path that the node sits on in ONT search results data model
        let model = i2b2.ONT.model.searchResults;
        let paths = o.key.substr(2).split('\\');
        let parent = model;
        do {
            let subpath = paths.shift();
            if (subpath.trim().length) {
                if (parent[subpath] === undefined) parent[subpath] = {};
                parent = parent[subpath];
            }
        } while (paths.length > 0);
        parent['_$$_'] = o;
    },

// ================================================================================================== //
    backfillResultNodes: function() {
        let model = i2b2.ONT.model.searchResults;
        let nodesToLoad = [];
        let loadCount = 0;
        let func_recurseWalk = (targetNode, path) =>  {
            let loaded = false;
            for (let node in targetNode) {
                if (node === '_$$_') {
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
            // THIS function is used to process the AJAX results of the getChild call
            //		results data object contains the following attributes:
            //			refXML: xmlDomObject <--- for data processing
            //			msgRequest: xml (string)
            //			msgResponse: xml (string)
            //			error: boolean
            //			errorStatus: string [only with error=true]
            //			errorMsg: string [only with error=true]

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
            }
        };

        // add options
        let searchOptions = {};
        searchOptions.ont_max_records = "max='200'";
        searchOptions.ont_synonym_records = false;
        searchOptions.ont_hidden_records = false;
        do {
            searchOptions.concept_key_value = nodesToLoad.pop();
//console.log("O:"+searchOptions.concept_key_value);
            i2b2.ONT.ajax.GetTermInfo("ONT:Search", searchOptions, scopedCallback);
        } while (nodesToLoad.length > 0);
    }

};

console.timeEnd('execute time');
console.groupEnd();
