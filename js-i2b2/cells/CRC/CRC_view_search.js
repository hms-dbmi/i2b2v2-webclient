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
    if (newValue && newValue.trim().length > 2 ) {
        $("#submitQueryHistorySearch").attr('disabled', false);
    } else {
        $("#submitQueryHistorySearch").attr('disabled', true);
    }
};
//================================================================================================== //
i2b2.CRC.view.search.toggleSearchClearIcon = function(newValue){
    if (newValue){
        $("#querySearchTerm .clearIcon").removeClass("hidden");
    } else {
        $("#querySearchTerm .clearIcon").addClass("hidden");
    }
};
//================================================================================================== //

i2b2.CRC.view.search.clearSearchInput = function(){
    $("#querySearchTermText").val("");
    $("#querySearchTermError").empty();
    i2b2.CRC.view.search.handleSearchInputChange("");
    $("#querySearchFilterText").text("Any Category");
    $("#querySearchFilter").data("selectedFilterValue", "@");
};
//================================================================================================== //
i2b2.CRC.view.search.selectSearchType = function(elem) {
    console.log("select search type");
    $("#i2b2QueryHistoryFinder .active").removeClass("active");
    let liItem = $(elem);
    let newDisplayText = liItem.addClass("active").text();
    let filterValue = liItem.addClass("active").data("searchFilterValue");
    $("#querySearchFilterText").text(newDisplayText);
    $("#querySearchFilter").data("selectedFilterValue", filterValue);
    i2b2.ONT.view.search.handleSearchInputChange($('#i2b2QueryHistoryFinder #querySearchTerm input').val());
};
