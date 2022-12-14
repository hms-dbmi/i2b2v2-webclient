/**
 * @projectDescription	The main controller for the history viewport. (CRC's "previous queries" functionality)
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.history
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */


i2b2.CRC.ctrlr.history = {
    clickedID: false,
    queryNewName: false,

// ================================================================================================== //
    Refresh: function() {
         console.error("CALLED i2b2.CRC.ctrlr.history.Refresh()");
    },

// ================================================================================================== //
    clickSearchName: function() {
        console.info("CALLED i2b2.CRC.ctrlr.history.clickSearchName()");
        // THIS FUNCTION DOES THE FOLLOWING:
        //	1) fires a call to ajax.getCategories(),
        //	2) interprets the XML / populates the ONT data model,
        //	3) fires it's onDataUpdate event

        // Hide Navigate treeview and search results message and display search status message
        $("#i2b2TreeviewQueryHistoryFinder").hide();
        $("#i2b2TreeviewQueryHistory").hide();
        $("#i2b2QueryHistoryFinderMessage").hide();
        $("#i2b2QueryHistoryFinderStatus").text("Searching...").show();

        // clear treeview
        i2b2.CRC.view.history.treeviewFinder.treeview('clear');

        // create a scoped callback message
        var scopeCB = new i2b2_scopedCallback();
        scopeCB.scope = i2b2.CRC.model;
        scopeCB.callback = function(cellResult) {
            // auto-extract SDX objects from returned XML
            cellResult.parse();

            let sortResultsByDate = function(resultNode1, resultNode2){
                // proper date handling (w/improper handling for latest changes to output format)
                let dateStr1 = resultNode1.origData["created"];
                let dateStr2 = resultNode2.origData["created"];

                let dateTime1 = Date.parse(dateStr1);
                let dateTime2 = Date.parse(dateStr2);

                let result;
                if(dateTime1 < dateTime2){
                    result = -1;
                }
                else if(dateTime1 > dateTime2){
                    result = 1;
                }
                else {
                    result = 0;
                }

                return result;
            }
            // display the tree results
            let newNodes = {};
            cellResult.model.sort(sortResultsByDate);

            let isAscending = i2b2.CRC.view['history'].params.sortOrder.indexOf("DESC") === -1;
            if(!isAscending){
                cellResult.model.reverse();
            }
            for ( let i1=0; i1 < cellResult.model.length; i1++) {
                let sdxDataNode = cellResult.model[i1];
                let renderOptions = {
                    title: sdxDataNode.sdxDisplayName ,
                    icon: "sdx_CRC_QM.gif",
                    showchildren: true
                };
                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                sdxDataNode.renderData.idDOM = "CRC_H_TV-" + i2b2.GUID();
                let temp = {
                    title: sdxDataNode.renderData.moreDescriptMinor,
                    text: sdxDataNode.renderData.title,
                    icon: sdxDataNode.renderData.cssClassMain,
                    key: sdxDataNode.sdxInfo.sdxType + "-" + sdxDataNode.sdxInfo.sdxKeyValue,
                    iconImg: sdxDataNode.renderData.iconImg,
                    iconImgExp: sdxDataNode.renderData.iconImgExp,
                    i2b2: sdxDataNode
                };

                temp.state = sdxDataNode.renderData.tvNodeState;
                if(sdxDataNode.renderData.cssClassMinor !== undefined) {
                    temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
                }
                if(!newNodes[temp.key]) {
                    newNodes[temp.key] = temp;
                }
            }
            // push new nodes into the treeview
            i2b2.CRC.view.history.treeviewFinder.treeview('addNodes', [Object.values(newNodes), true]);

            // render tree
            i2b2.CRC.view.history.treeviewFinder.treeview('redraw', []);

            $("#i2b2QueryHistoryFinderStatus").hide();

            // Display search results treeview
            let historyFinderTreeview = $("#i2b2TreeviewQueryHistoryFinder").show();

            if(cellResult.model.length === 0){
                $("#i2b2QueryHistoryFinderMessage").text("No records found.").show();
                historyFinderTreeview.hide();
            }
        };

        let crc_find_strategy = "contains"
        let crc_find_category = $("#querySearchFilter").data("selectedFilterValue");
        if(crc_find_category === "pdo"){
            crc_find_strategy = "exact"
        }

        // fire the AJAX call
        let options = {
            result_wait_time: 180,
            crc_max_records: i2b2.CRC.view['history'].params.maxQueriesDisp,
            crc_sort_by: i2b2.CRC.view['history'].params.sortBy,
            crc_user_type: 	(i2b2.PM.model.userRoles.indexOf("MANAGER") === -1 ? "CRC_QRY_getQueryMasterList_fromUserId" : "CRC_QRY_getQueryMasterList_fromGroupId"),
            crc_sort_order: (i2b2.CRC.view['history'].params.sortOrder.indexOf("DESC") === -1?"true": "false"),
            crc_find_category: crc_find_category,
            crc_find_strategy: crc_find_strategy,
            crc_find_string: $("#querySearchTermText").val()
        };
        i2b2.CRC.ajax.getNameInfo("CRC:History", options, scopeCB);
    },

// ================================================================================================== //
    queryDelete: function(sdxPackage, tvNode) {
        // function requires a Query Master ID
        var QueryName = sdxPackage.origData.name;
        if (confirm('Delete Query "' + QueryName + '"?')) {
            // create a scoped callback message
            var scopeCB = new i2b2_scopedCallback();
            scopeCB.scope = i2b2.CRC.model.QueryMasters;
            scopeCB.callback = function(i2b2CellMsg) {
                // define the XML processing function
                console.group("CALLBACK Processing AJAX i2b2CellMsg");
                if (i2b2CellMsg.error) {
                    alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
                }
                // refresh the Query History data
                i2b2.CRC.ctrlr.history.Refresh();
            };

            // fire the AJAX call
            var options = {
                result_wait_time: 180,
                qm_key_value: sdxPackage.sdxInfo.sdxKeyValue
            };
            i2b2.CRC.ajax.deleteQueryMaster("CRC:History", options, scopeCB);
        }
    },

// ================================================================================================== //
    queryDeleteNoPrompt: function(qmID) {
        // function requires a Query Master ID
            // create a scoped callback message
            var scopeCB = new i2b2_scopedCallback();
            scopeCB.scope = i2b2.CRC.model.QueryMasters;
            scopeCB.callback = function(i2b2CellMsg) {
                // define the XML processing function
                console.group("CALLBACK Processing AJAX i2b2CellMsg");
                //if (i2b2CellMsg.error) {
                //	alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
                //}
                // refresh the Query History data
                i2b2.CRC.ctrlr.history.Refresh();
            };

            // fire the AJAX call
            var options = {
                result_wait_time: 180,
                qm_key_value: qmID
            };
            i2b2.CRC.ajax.deleteQueryMaster("CRC:History", options, scopeCB);
    },

// ================================================================================================== //
    queryRename: function(sdxPackage, newQueryName, tvNode) {
        this.queryNewName = newQueryName || false;
        if (!this.queryNewName) {
            // callback for dialog submission
            var handleSubmit = function() {
                // submit value(s)
                var closure_sdx = sdxPackage;
                if(this.submit()) {
                    // run the query
                    i2b2.CRC.ctrlr.history.queryRename(sdxPackage.sdxInfo.sdxKeyValue, $('inputQueryName').value);
                }
            }
            // display the query name input dialog
            this._queryPromptName(handleSubmit);
            // get the old name (and trim whitespace)
            $('inputQueryName').value = sdxPackage.origData.name;
            return;
        }

        // create a scoped callback message
        var scopeCB = new i2b2_scopedCallback();
        scopeCB.scope = this;
        scopeCB.callback = function(i2b2CellMsg) {
            // define the XML processing function
            console.group("CALLBACK Processing AJAX i2b2CellMsg");
            if (i2b2CellMsg.error) {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }
            // refresh the Query History data
            i2b2.CRC.ctrlr.history.Refresh();
            console.groupEnd();
        };
        // fire the AJAX call
        var options = {
            qm_key_value: sdxPackage.sdxInfo.sdxKeyValue,
            qm_name: newQueryName
        };
        i2b2.CRC.ajax.renameQueryMaster("CRC:History", options, scopeCB);
    }

};



// signal that is fired when the CRC cell's data model is updated
// ================================================================================================== //
i2b2.CRC.ctrlr.history.events = new Object;
i2b2.CRC.ctrlr.history.events.onDataUpdate = $.Callbacks();
