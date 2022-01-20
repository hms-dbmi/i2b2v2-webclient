/**
 * Created by nbeni on 10/16/2018.
 */



// ================================================================================================== //
i2b2.CRC.ctrlr.showOptions = function(component_name) {
    // show the options modal screen
    if ($('body #crcModal').length === 0) {
        $('body').append("<div id='crcModal'/>");
    }

    // display the correct options screen based on name of the first component of the stack
    switch(component_name) {
        case "i2b2.CRC.view.history":
            $('body #crcModal').load('/js-i2b2/cells/CRC/assets/modalOptionsHistory.html', function() {
                // pre populate data
                // TODO: populate the data

                // TODO: save the data back into the system if needed

                // now show the modal form
                $('body #crcModal div:eq(0)').modal('show');
            });
            break;
        case "i2b2.CRC.view.QT":
            $('body #crcModal').load('/js-i2b2/cells/CRC/assets/modalOptionsQT.html', function() {
                // pre populate data
                // TODO: populate the data

                // TODO: save the data back into the system if needed

                // now show the modal form
                $('body #crcModal div:eq(0)').modal('show');
            });
            break;
    }


};


i2b2.CRC.ctrlr.refreshAll = function(view_component) {
    switch (view_component) {
        case "i2b2.CRC.view.history":
            i2b2.CRC.view.history.doRefreshAll();
            break;
        default:
            alert('CRC_ctrlr_Options.js |> Refresh treeview for ' + view_component);
    }
};
