/**
 * @projectDescription	View controller for the Find viewport. (CRC's "previous queries" window)
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.find
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > view > Find');
console.time('execute time');


// create and save the screen objects
i2b2.CRC.view.search = {};
//================================================================================================== //
i2b2.CRC.view.search.handleSearchInputChange = function(newValue){
    i2b2.CRC.view.search.toggleSearchClearIcon(newValue);
    i2b2.CRC.view.search.enableSearch(newValue);
};
//================================================================================================== //
i2b2.CRC.view.search.enableSearch = function(newValue){
    if (newValue && newValue.trim().length > 0 ) {
        $("#submitQueryHistorySearch").attr('disabled', false);
    } else {
        $("#submitQueryHistorySearch").attr('disabled', true);
    }
};
//================================================================================================== //
i2b2.CRC.view.search.toggleSearchClearIcon = function(newValue){
    if (newValue){
        $("#querySearchTerm .clearIcon").removeClass("invisible");
    } else {
        $("#querySearchTerm .clearIcon").addClass("invisible");
    }
};
//================================================================================================== //
i2b2.CRC.view.search.selectSearchType = function(elem) {
    $("#i2b2QueryHistoryFinder .active").removeClass("active");
    let liItem = $(elem);
    let newDisplayText = liItem.addClass("active").text();
    let filterValue = liItem.addClass("active").find(".dropdown-item").data("searchFilterValue");
    $("#querySearchFilterText").text(newDisplayText);
    $("#querySearchFilter").data("selectedFilterValue", filterValue);
    i2b2.CRC.view.search.handleSearchInputChange($('#i2b2QueryHistoryFinder #querySearchTerm input').val());
};
//================================================================================================== //

i2b2.CRC.view.search.reset = function(){
    $("#querySearchTermText").val("");
    $("#querySearchTermError").empty();
    i2b2.CRC.view.search.handleSearchInputChange("");
    $("#querySearchFilterText").text("Any Category");
    $("#querySearchFilter").data("selectedFilterValue", "@");

    //Show Navigate treeview and hide search results treeview
    $("#i2b2TreeviewQueryHistory").show();
    $("#i2b2TreeviewQueryHistoryFinder").hide();
};
