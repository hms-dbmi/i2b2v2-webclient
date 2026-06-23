/**
 * @projectDescription	The main controller for the history viewport. (CRC's "previous queries" functionality)
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.history
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.8.2
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
    queryDelete: function(sdxPackage) {
        // function requires a Query Master ID
        //var QueryName = sdxPackage.origData.name;
        // create a scoped callback message
        let scopeCB = new i2b2_scopedCallback();
        scopeCB.scope = i2b2.CRC.model.QueryMasters;
        scopeCB.callback = function(i2b2CellMsg) {
            // define the XML processing function
            console.group("CALLBACK Processing AJAX i2b2CellMsg");
            if (i2b2CellMsg.error) {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }
            // refresh the Query History data
            i2b2.CRC.view.history.doRefreshAll();
        };

        // fire the AJAX call
        let options = {
            result_wait_time: 180,
            qm_key_value: sdxPackage.sdxInfo.sdxKeyValue
        };
        i2b2.CRC.ajax.deleteQueryMaster("CRC:History", options, scopeCB);
    },

    // ================================================================================================== //
    queryDeletePrompt: function(sdxPackage) {

        let okCallback = function(){
                i2b2.CRC.ctrlr.history.queryDelete(sdxPackage);
        };

        let realQueryName = i2b2.h.getXNodeVal(sdxPackage.origData.xmlOrig,'name');

        let data = {
            "title": "Delete Query",
            "confirmMsg": 'Delete Query "' + realQueryName + '"?',
            "onOk": okCallback,
        };
        i2b2.CRC.view.history.displayContextDialog(data);
    },

// ================================================================================================== //
    queryDeleteNoPrompt: function(qmID) {
        // function requires a Query Master ID
            // create a scoped callback message
            var scopeCB = new i2b2_scopedCallback();
            scopeCB.scope = i2b2.CRC.model.QueryMasters;
            scopeCB.callback = function(){
                //switch to the browse view and refresh the query history
                i2b2.CRC.view.history.showBrowseView();
                i2b2.CRC.view.history.doRefreshAll();
            }

            // fire the AJAX call
            var options = {
                result_wait_time: 180,
                qm_key_value: qmID
            };
            i2b2.CRC.ajax.deleteQueryMaster("CRC:History", options, scopeCB);
    },

// ================================================================================================== //
    queryRename: function(sdxPackage, newQueryName) {
        // create a scoped callback message
        let scopeCB = new i2b2_scopedCallback();
        scopeCB.scope = this;
        scopeCB.callback = function(i2b2CellMsg) {
            // define the XML processing function
            console.group("CALLBACK Processing AJAX i2b2CellMsg");
            if (i2b2CellMsg.error) {
                alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
            }
            // refresh the Query History data
            i2b2.CRC.view.history.doRefreshAll();
            console.groupEnd();
        };
        // fire the AJAX call
        let options = {
            qm_key_value: sdxPackage.sdxInfo.sdxKeyValue,
            qm_name: newQueryName
        };
        i2b2.CRC.ajax.renameQueryMaster("CRC:History", options, scopeCB);
    },
// ================================================================================================== //
    queryRenamePromptName: function(sdxPackage) {

        let origName = sdxPackage.origData.name;

        let okCallback = function(newValue){
            if(newValue && newValue.length > 0) {
                i2b2.CRC.ctrlr.history.queryRename(sdxPackage, newValue);
            }
        };

        let realName = i2b2.h.getXNodeVal(sdxPackage.origData.xmlOrig,'name');
        let data = {
            "title": "Rename Query",
            "prompt": "Please type a name for the query:",
            "placeHolder": realName,
            "inputValue": realName,
            "onOk": okCallback,
        };
        i2b2.CRC.view.history.displayContextDialog(data);
    }
};



// signal that is fired when the CRC cell's data model is updated
// ================================================================================================== //
i2b2.CRC.ctrlr.history.events = new Object;
i2b2.CRC.ctrlr.history.events.onDataUpdate = $.Callbacks();
