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
