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
            }
        }


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
    }
}

console.timeEnd('execute time');
console.groupEnd();
