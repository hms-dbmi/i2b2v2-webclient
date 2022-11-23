/**
 * @projectDescription	View controller for CRC Query Tool window.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QT
 * @version 	2.0
 **/

// create and save the view objects
i2b2.CRC.view.QT = new i2b2Base_cellViewController(i2b2.CRC, 'QT');


// ================================================================================================== //
i2b2.CRC.view.QT.updateQueryName = function() {
    // update the transformed model and set the title
    i2b2.CRC.ctrlr.QT._processModel();
    $('.CRC_QT_runbar input.name').attr("placeholder", i2b2.CRC.model.transformedQuery.name);
};


// ================================================================================================== //
i2b2.CRC.view.QT.resetToCRCHistoryView = function() {
    i2b2.CRC.view.search.reset();
    $("#i2b2TreeviewQueryHistoryFinder").hide();
    $("#i2b2TreeviewQueryHistory").show();
}
// ================================================================================================== //
i2b2.CRC.view.QT.showRun = function() {

    // show the options modal screen
    if ($('body #crcModal').length === 0) {
        $('body').append("<div id='crcModal'/>");
    }

    $('body #crcModal').load('js-i2b2/cells/CRC/assets/modalRunQuery.html', function() {
        // populate the results list based on...
        // ==> i2b2.CRC.model.resultTypes
        // ==> i2b2.CRC.model.selectedResultTypes
        let checkContainer = $("#crcModal .ResultTypes");
        for (let code in i2b2.CRC.model.resultTypes) {
            let descriptions = i2b2.CRC.model.resultTypes[code];
            descriptions.forEach(description => {
                let checked = '';
                if (i2b2.CRC.model.selectedResultTypes.includes(code)) checked = ' checked="checked" ';
                $('<div id="crcDlgResultOutput' + code + '"><input type="checkbox" class="chkQueryType" name="queryType" value="' + code + '"' + checked + '> ' + description + '</div>').appendTo(checkContainer);
            });
        }

        // now show the modal form
        $('body #crcModal div:eq(0)').modal('show');

        // run the query on button press
        $('body #crcModal button.i2b2-save').on('click', (evt) => {
            i2b2.CRC.view.QT.resetToCRCHistoryView();
            // build list of selected result types
            let reqResultTypes = $('body #crcModal .chkQueryType:checked').map((idx, rec) => { return rec.value; }).toArray();
            // run the query
            i2b2.CRC.ctrlr.QT.runQuery(reqResultTypes);
            // close the modal
            $('body #crcModal div:eq(0)').modal('hide');
        });

        //if the user presses enter in one of the input fields on the crcModal form
        //then run the query
        $("#crcModal").submit(function(evt) {
            $('body #crcModal button.i2b2-save').click();
            evt.preventDefault();
        });

    });
};


// ================================================================================================== //
i2b2.CRC.view.QT._correctQgTitles = function() {
    // this function makes sure that the first query group always says "Find Patients"
    $(" .JoinText:first", i2b2.CRC.view.QT.containerDiv).text("Find Patients");
};


// ================================================================================================== //
i2b2.CRC.view.QT.termActionInfo = function(evt) {
    let conceptIdx = $(evt.target).closest('.concept').data('conceptIndex');
    let eventIdx = $(evt.target).closest('.event').data('eventidx');
    let queryGroupIdx = $(evt.target).closest('.QueryGroup').data("queryGroup");
    i2b2.ONT.view.info.load(i2b2.CRC.model.query.groups[queryGroupIdx].events[eventIdx].concepts[conceptIdx], true);
};


// ================================================================================================== //
i2b2.CRC.view.QT.termActionDelete = function(evt) {
    let conceptIdx = $(evt.target).closest('.concept').data('conceptIndex');
    let eventIdx = $(evt.target).closest('.event').data('eventidx');
    let queryGroupIdx = $(evt.target).closest('.QueryGroup').data("queryGroup");

    // TODO: break this into the query controller file
    i2b2.CRC.model.query.groups[queryGroupIdx].events[eventIdx].concepts.splice(conceptIdx, 1);
    // re-render the concept list
    i2b2.CRC.view.QT.renderTermList(i2b2.CRC.model.query.groups[queryGroupIdx].events[eventIdx], $(evt.target).closest('.TermList'));
    // update the query name
    i2b2.CRC.view.QT.updateQueryName();

    //clear any existing query results;
    i2b2.CRC.view.QS.clearStatus();
};

// ================================================================================================== //
i2b2.CRC.view.QT.termActionDateConstraint = function(evt) {
    let conceptIdx = $(evt.target).closest('.concept').data('conceptIndex');
    let eventIdx = $(evt.target).closest('.event').data('eventidx');
    let queryGroupIdx = $(evt.target).closest('.QueryGroup').data("queryGroup");
    let sdx = i2b2.CRC.model.query.groups[queryGroupIdx].events[eventIdx].concepts[conceptIdx];
    let callbackFunc = function(){
        let temp = $(evt.target).closest(".event");
        let cncptListEl = $('.TermList', temp[0]);
        let eventData = i2b2.CRC.model.query.groups[queryGroupIdx].events[eventIdx];
        i2b2.CRC.view.QT.renderTermList(eventData, cncptListEl);
    }
    i2b2.CRC.view.QT.addConceptDateConstraint(sdx, callbackFunc);
};

// ================================================================================================== //
i2b2.CRC.view.QT.addConceptDateConstraint = function(sdx, callbackFunc) {
    if ($('body #termDateConstraintModal').length === 0) {
        $('body').append("<div id='termDateConstraintModal'/>");
    }
    let termDateConstraint = $("#termDateConstraintModal").empty();

    let dateStart = '';
    let dateEnd = '';
    if(sdx.dateRange !== undefined){
        if(sdx.dateRange.start !== undefined){
            dateStart = sdx.dateRange.start;
        }
        if(sdx.dateRange.end !== undefined){
            dateEnd = sdx.dateRange.end;
        }
    }

    let data = {
        concept: sdx.sdxInfo.sdxDisplayName,
        dateStart: dateStart,
        dateEnd: dateEnd
    };
    $(i2b2.CRC.view.QT.template.dateConstraint(data)).appendTo(termDateConstraint);


    $('#termDateConstraintModal button.i2b2-save').on('click', (evt) => {
        let startDateStr = $("#termDateConstraintModal .DateStart").val();
        let endDateStr = $("#termDateConstraintModal .DateEnd").val();

        let isStartDateValid = i2b2.CRC.view.QT.isValidDate(startDateStr);
        let isEndDateValid =  i2b2.CRC.view.QT.isValidDate(endDateStr);

        if ((startDateStr.length === 0 || isStartDateValid) && (endDateStr.length === 0 || isEndDateValid)) {
            let dateRange = sdx.dateRange;
            if (dateRange === undefined) {
                dateRange = {};
            }

            dateRange.start = startDateStr;
            dateRange.end = endDateStr;

            sdx.dateRange = dateRange;
            $('#termDateConstraintModal div:eq(0)').modal('hide');

            //clear eny existing query results
            i2b2.CRC.view.QS.clearStatus();

            callbackFunc();
        }
    });

    $("#termDateConstraintModal .DateStart").datepicker({
        uiLibrary: 'bootstrap4',
        change: function() {
            let startDateElem = $("#termDateConstraintModal .DateStart");
            let endDateElem = $("#termDateConstraintModal .DateEnd");
            let startDate =  startDateElem.val();
            let endDate =  endDateElem.val();

            let isDateValid = i2b2.CRC.view.QT.isValidDate(startDate); //startDate.isValid();

            startDate = new Date(startDate);
            endDate = new Date(endDate);

            if(startDate > endDate){
                endDateElem.datepicker().value("");
            }

            let date = moment(startDate, 'MM-DD-YYYY');
            //let isDateValid = date.isValid();

            !isDateValid ? $("#termDateConstraintModal .startDateError").show() : $("#termDateConstraintModal .startDateError").hide();
        }
    });

    $("#termDateConstraintModal .DateEnd").datepicker({
        uiLibrary: 'bootstrap4',
        change: function() {
            let startDateElem = $("#termDateConstraintModal .DateStart");
            let endDateElem = $("#termDateConstraintModal .DateEnd");
            let startDate =  startDateElem.val();
            let endDate =  endDateElem.val();

            let isDateValid = i2b2.CRC.view.QT.isValidDate(endDate); //startDate.isValid();

            startDate = new Date(startDate);
            endDate = new Date(endDate);

            if(startDate > endDate){
                startDateElem.datepicker().value("");
            }

            let date = moment(endDate, 'MM-DD-YYYY');
            //let isDateValid = date.isValid();
            !isDateValid ? $("#termDateConstraintModal .endDateError").show() : $("#termDateConstraintModal .endDateError").hide();
        }
    });

    $("#termDateConstraintModal div:eq(0)").modal('show');
}
// ================================================================================================== //
i2b2.CRC.view.QT.renderTermList = function(data, targetEl) {
    // rerender the query event and add to the DOM
    $(targetEl).empty();
    $(i2b2.CRC.view.QT.template.qgcl(data)).appendTo(targetEl);
    // clear the first "or" in the term list
    $('.termOr:first', targetEl).text("");
    // add event listeners for term options functionality
    $('.concept .actions .editLabValue', targetEl).on('click', i2b2.CRC.view.QT.labValue.editLabValue);
    $('.concept .actions .info', targetEl).on('click', i2b2.CRC.view.QT.termActionInfo);
    $('.concept .actions .delete', targetEl).on('click', i2b2.CRC.view.QT.termActionDelete);
    $('.concept .actions .dateConstraint', targetEl).on('click', i2b2.CRC.view.QT.termActionDateConstraint);
};


// ================================================================================================== //
i2b2.CRC.view.QT.deleteQueryGroup = function(event) {
    // TODO: this belongs in the query tool controller
    let qgRoot = $(event.target).closest(".QueryGroup");
    let qgIndex = qgRoot.data("queryGroup");
    // retag the higher query groups' indexes
    $(".QueryGroup").each((idx, el) => {
        let tmpEl = $(el);
        let tmpIdx = tmpEl.data("queryGroup");
        if (tmpIdx > qgIndex) tmpEl.data("queryGroup", tmpIdx - 1);
    });
    // delete the DOM element
    qgRoot.remove();
    // delete the entry from the data model
    i2b2.CRC.model.query.groups.splice(qgIndex, 1);
    // update the query name
    i2b2.CRC.view.QT.updateQueryName();
    // correct the query group titles so first one says "Find Patients"
    i2b2.CRC.view.QT._correctQgTitles();

    //clear any existing query results;
    i2b2.CRC.view.QS.clearStatus();
};


// ================================================================================================== //
i2b2.CRC.view.QT.isLabs = function(sdx) {
    // see if the concept is a lab, prompt for value if it is
    sdx.isLab = false;
    if (sdx.origData.basecode !== undefined) {
        if (sdx.origData.basecode.startsWith("LOINC") || sdx.origData.basecode.startsWith("LCS-I2B2")) sdx.isLab = true;
    }
    return sdx.isLab;
};


// ================================================================================================== //
i2b2.CRC.view.QT.HoverOver = function(el) { $(el).closest(".i2b2DropTarget").addClass("DropHover"); };
i2b2.CRC.view.QT.HoverOut = function(el) { $(el).closest(".i2b2DropTarget").removeClass("DropHover"); };

// ================================================================================================== //
i2b2.CRC.view.QT.addNewQueryGroup = function(sdxList, metadata){
    // append the new query group to the data model
    i2b2.CRC.model.query.groups.push({
        display: "with",
        with: true,
        without: false,
        when:{
            occurs: "occursBefore",
            occursNum: "1",
            occursUnit: "day"
        },
        events: [{
            dateRange: {
                start: "",
                end: ""
            },
            instances: 1,
            concepts: []
        }, {
            dateRange: {
                start: "",
                end: ""
            },
            instances: 1,
            concepts: []
        }]
    });

    // insert the new concept into the record
    let qgIdx = i2b2.CRC.model.query.groups.length - 1;
    let eventIdx = 0;
    i2b2.CRC.model.query.groups[qgIdx].events[eventIdx].concepts = sdxList;

    // set additional query group metadata if specified
    if(metadata) {
        let queryGroup = i2b2.CRC.model.query.groups[qgIdx];

        if(metadata.without !== undefined){
            queryGroup.without = metadata.without;
            queryGroup.with = !metadata.without;
            queryGroup.display = queryGroup.with ? "with": "without";
        }

        if(metadata.instances !== undefined){
            queryGroup.events[eventIdx].instances = metadata.instances;
        }

        if(metadata.startDate !== undefined){
            queryGroup.events[eventIdx].dateRange.start = metadata.startDate;
        }

        if(metadata.endDate !== undefined){
            queryGroup.events[eventIdx].dateRange.end = metadata.endDate;
        }
    }
}
// ================================================================================================== //
i2b2.CRC.view.QT.handleLabValues = function(sdx){
    // see if it is a lab
    let isLab = i2b2.CRC.view.QT.isLabs(sdx);

    if(isLab){
        i2b2.CRC.view.QT.current  = {"conceptSdx": sdx};
        i2b2.CRC.view.QT.labValue.showLabValues(sdx);
    }
}
// ================================================================================================== //
i2b2.CRC.view.QT.NewDropHandler = function(sdx, evt){
    i2b2.CRC.view.QT.addNewQueryGroup([sdx]);
    i2b2.CRC.view.QT.handleLabValues(sdx);
    // render the new query group (by re-rendering all the query groups)
    i2b2.CRC.view.QT.render();

    // update the query name
    i2b2.CRC.view.QT.updateQueryName();
    i2b2.CRC.view.QS.clearStatus();
};


// ================================================================================================== //
i2b2.CRC.view.QT.DropHandler = function(sdx, evt){
    // remove the hover and drop target fix classes
    $(evt.target).closest(".i2b2DropTarget").removeClass("DropHover");
    $(evt.target).closest(".i2b2DropTarget").removeClass("i2b2DropPrep");

    let qgIndex = $(evt.target).closest(".QueryGroup").data("queryGroup");
    let temp = $(evt.target).closest(".event");
    let eventIdx = temp.data('eventidx');
    let cncptListEl = $('.TermList', temp[0]);
    i2b2.CRC.view.QT.isLabs(sdx);

    // add the data to the correct terms list (also prevent duplicates)
    let eventData = i2b2.CRC.model.query.groups[qgIndex].events[eventIdx];
    temp = eventData.concepts.filter((term)=>{ return term.sdxInfo.sdxKeyValue === sdx.sdxInfo.sdxKeyValue; });
    if (temp.length === 0) {
        //add date constraint to concept if there is a group date range specified{
        if (i2b2.CRC.model.query.groups[qgIndex].events[eventIdx].dateRange !== undefined &&
            (sdx.dateRange === undefined || (sdx.dateRange.start === 0 && sdx.dateRange.end.length === 0))) {
            // only include date range for specific SDX types
            if (["CONCPT"].includes(sdx.sdxInfo.sdxType)) {
                if (sdx.dateRange === undefined) sdx.dateRange = {start: "", end: ""};
                sdx.dateRange.start = i2b2.CRC.model.query.groups[qgIndex].events[eventIdx].dateRange.start;
                sdx.dateRange.end = i2b2.CRC.model.query.groups[qgIndex].events[eventIdx].dateRange.end;
            }
        }

        // not a duplicate, add to the event's term list
        eventData.concepts.push(sdx);
        // rerender the query event and add to the DOM
        i2b2.CRC.view.QT.renderTermList(eventData, cncptListEl);

        if (sdx.isLab) {
            i2b2.CRC.view.QT.labValue.showLabValues(sdx);
        }
        // update the query name
        i2b2.CRC.view.QT.updateQueryName();
        i2b2.CRC.view.QS.clearStatus();
    }

};
// ================================================================================================== //
i2b2.CRC.view.QT.renderQueryGroup = function(qgModelIndex, funcName, funcTarget) {
    let qgModel = i2b2.CRC.model.query.groups[qgModelIndex];
    let newQG = $(i2b2.CRC.view.QT.template.qg(qgModel))[funcName](funcTarget);
    // set the query group index data
    newQG.data('queryGroup', qgModelIndex);
    // set the query group style
    switch (qgData.display) {
        case "with":
            newQG.addClass("with");
            break;
        case "without":
            newQG.addClass("without");
            break;
        case "when":
            newQG.addClass("when");
            break;
    }

    // populate the event1 concept list
    let temp = $('.Event1Container .TermList', newQG[0]);
    i2b2.CRC.view.QT.renderTermList(qgData.events[0], temp);

    // populate the event2 concept list
    if (qgData.events.length > 1) {
        let temp = $('.Event2Container .TermList', newQG[0]);
        i2b2.CRC.view.QT.renderTermList(qgData.events[1], temp);
    }
};
// ================================================================================================== //

i2b2.CRC.view.QT.clearQuery = function() {
    i2b2.CRC.view.QT.updateQueryName();
    i2b2.CRC.view.QT.render();
}
// ================================================================================================== //

i2b2.CRC.view.QT.isValidDate = function(dateStr) {
    let dateVal = String(dateStr);

    return !(dateVal.match(/^[0|1][0-9]\/[0|1|2|3][0-9]\/[1|2][0-9][0-9][0-9]$/) === null && dateVal !== '');
}

// ================================================================================================== //
i2b2.CRC.view.QT.render = function() {
    // render HTML based on "i2b2.CRC.model.query" data

    $(i2b2.CRC.view.QT.containerDiv).empty();

    // first render the main query groups
    for (let qgnum = 0; qgnum < i2b2.CRC.model.query.groups.length; qgnum++) {
        let qgData = i2b2.CRC.model.query.groups[qgnum];
        // Done in handlebars template:
        // - populate Instances number
        // - Populate dates -> StartDate & DateRange1Start (synced existence)
        // - Populate dates -> EndDate & DateRange1End (synced existence)
        // - Populate dates -> DateRange2Start
        // - Populate dates -> DateRange2End
        // - populate when "occurs before" / "occurs at least"
        // - populate when "the first" / "any"
        // - populate when "day" / "month" / "year"

        let newQG = $(i2b2.CRC.view.QT.template.qg(i2b2.CRC.model.query.groups[qgnum])).appendTo(i2b2.CRC.view.QT.containerDiv);
        // set the query group index data
        newQG.data('queryGroup', qgnum);
        // set the query group style
        switch (qgData.display) {
            case "with":
                newQG.addClass("with");
                break;
            case "without":
                newQG.addClass("without");
                break;
            case "when":
                newQG.addClass("when");
                break;
        }
        // Change first query group title to display "Find Patients"
        if (qgnum === 0) $(".JoinText", newQG).text("Find Patients");

        // populate the event1 concept list
        let temp = $('.Event1Container .TermList', newQG[0]);
        i2b2.CRC.view.QT.renderTermList(qgData.events[0], temp);

        // populate the event2 concept list
        if (qgData.events.length > 1) {
            let temp = $('.Event2Container .TermList', newQG[0]);
            i2b2.CRC.view.QT.renderTermList(qgData.events[1], temp);
        }

        // attach the date picker functionality
        $('.DateStart', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateEnd', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange1Start', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange1End', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange2Start', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange2End', newQG).datepicker({uiLibrary: 'bootstrap4'});

        // attach the i2b2 SDX handlers
        let dropTarget = $(".Event1Container", newQG);
        i2b2.sdx.Master.AttachType(dropTarget, "CONCPT");
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "DropHandler", i2b2.CRC.view.QT.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOver", i2b2.CRC.view.QT.HoverOver);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOut", i2b2.CRC.view.QT.HoverOut);
        i2b2.sdx.Master.AttachType(dropTarget, "QM");
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "DropHandler", i2b2.CRC.view.QT.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "onHoverOver", i2b2.CRC.view.QT.HoverOver);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "onHoverOut", i2b2.CRC.view.QT.HoverOut);
        dropTarget = $(".Event2Container", newQG);
        i2b2.sdx.Master.AttachType(dropTarget, "CONCPT");
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "DropHandler", i2b2.CRC.view.QT.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOver", i2b2.CRC.view.QT.HoverOver);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOut", i2b2.CRC.view.QT.HoverOut);
        i2b2.sdx.Master.AttachType(dropTarget, "QM");
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "DropHandler", i2b2.CRC.view.QT.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "onHoverOver", i2b2.CRC.view.QT.HoverOver);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "onHoverOut", i2b2.CRC.view.QT.HoverOut);
    }

    // attach the event listeners
    // -----------------------------------------
    // Top bar events (with / without / when)
    $('.QueryGroup .topbar .with', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // change the CSS styling
        let qgRoot = $(event.target).closest(".QueryGroup");
        qgRoot.removeClass(['without', 'when']);
        qgRoot.addClass("with");
        // modify the model
        let qgIndex = qgRoot.data("queryGroup");
        i2b2.CRC.model.query.groups[qgIndex].display = "with";
        i2b2.CRC.model.query.groups[qgIndex].with = true;
        i2b2.CRC.model.query.groups[qgIndex].without = false;
        i2b2.CRC.model.query.groups[qgIndex].when = false;
        i2b2.CRC.view.QS.clearStatus();
    });
    $('.QueryGroup .topbar .without', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // change the CSS styling
        let qgRoot = $(event.target).closest(".QueryGroup");
        qgRoot.removeClass(['with', 'when']);
        qgRoot.addClass("without");
        // modify the model
        let qgIndex = qgRoot.data("queryGroup");
        i2b2.CRC.model.query.groups[qgIndex].display = "without";
        i2b2.CRC.model.query.groups[qgIndex].with = false;
        i2b2.CRC.model.query.groups[qgIndex].without = true;
        i2b2.CRC.model.query.groups[qgIndex].when = false;
        i2b2.CRC.view.QS.clearStatus();
    });
    $('.QueryGroup .topbar .when', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // change the CSS styling
        let qgRoot = $(event.target).closest(".QueryGroup");
        qgRoot.removeClass(['without', 'with']);
        qgRoot.addClass("when");
        // modify the model
        let qgIndex = qgRoot.data("queryGroup");
        i2b2.CRC.model.query.groups[qgIndex].display = "when";
        i2b2.CRC.model.query.groups[qgIndex].with = false;
        i2b2.CRC.model.query.groups[qgIndex].without = false;
        i2b2.CRC.model.query.groups[qgIndex].when = true;
        i2b2.CRC.view.QS.clearStatus();
    });
    // Query Group delete button
    $('.QueryGroup .topbar .qgclose i', i2b2.CRC.view.QT.containerDiv).on('click', i2b2.CRC.view.QT.deleteQueryGroup);

    // Sequence bar events
    $('.QueryGroup .SequenceBar .occurs', i2b2.CRC.view.QT.containerDiv).on('change', (event) => {
        event.target.blur();
        // change the CSS styling
        let qgRoot = $(event.target).closest(".SequenceBar");
        qgRoot.removeClass(['occursBefore','occursAtLeast']);
        let setting = event.target.value;
        $(qgRoot).addClass(setting);
        // update data model
        let qgIndex = $(event.target).closest(".QueryGroup").data("queryGroup");
        let qgData = i2b2.CRC.model.query.groups[qgIndex];
        if (setting === "occursBefore") {
            qgData.when.occurs = "before";
        } else {
            qgData.when.occurs = "atleast";
        }
    });
    $('.QueryGroup .thefirstany', i2b2.CRC.view.QT.containerDiv).on('change', (event) => {
        event.target.blur();
        // match the selected value between the two controls in the QueryGroup
        let qgEl = $(event.target).closest(".QueryGroup");
        $('.thefirstany', qgEl).val(event.target.value);
        // update the data model
        let qgIndex = qgEl.data("queryGroup");
        i2b2.CRC.model.query.groups[qgIndex].when.firstany = event.target.value;
    });
    $('.QueryGroup .occursUnit', i2b2.CRC.view.QT.containerDiv).on('change', (event) => {
        event.target.blur();
        // match the selected value between the two controls in the QueryGroup
        let qgIndex = $(event.target).closest(".QueryGroup").data("queryGroup");
        i2b2.CRC.model.query.groups[qgIndex].when.occursUnit = event.target.value;
    });
    $('.QueryGroup .occursNumber', i2b2.CRC.view.QT.containerDiv).on('blur', (event) => {
        // parse (and if needed correct) the number value for days/months/years
        let qgIndex = $(event.target).closest(".QueryGroup").data("queryGroup");
        let correctedVal = 1;
        if (!isNaN(event.target.value)) {
            correctedVal = parseInt(event.target.value);
            if (correctedVal < 1) correctedVal = 1;
        }
        i2b2.CRC.model.query.groups[qgIndex].when.occursNum = correctedVal;
        event.target.value = correctedVal;
    });

    // date dropdowns and calendars
    $('.QueryGroup .DateOccursLbl', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // parse (and if needed correct) the number value for days/months/years
        let event1Container = $(event.target).closest(".Event1Container");
        let body = $('.DateOccursBody', event1Container);
        let icon = $(".DateOccursLbl i", event1Container);
        if (body.hasClass('hidden')) {
            body.removeClass('hidden');
            //icon.prevObject.removeClass('bi-chevron-down');
            //icon.prevObject.addClass('bi-chevron-up');
            icon.removeClass('bi-chevron-down');
            icon.addClass('bi-chevron-up');
        } else {
            body.addClass('hidden');
            icon.removeClass('bi-chevron-up');
            icon.addClass('bi-chevron-down');
        }
    });
    $('.QueryGroup .DateRange1Lbl', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // parse (and if needed correct) the number value for days/months/years
        let event1Container = $(event.target).closest(".Event1Container");
        let body = $('.DateRange1Body', event1Container);
        let icon = $(".DateRange1Lbl i", event1Container);
        if (body.hasClass('hidden')) {
            body.removeClass('hidden');
            icon.removeClass('bi-chevron-down');
            icon.addClass('bi-chevron-up');
        } else {
            body.addClass('hidden');
            icon.removeClass('bi-chevron-up');
            icon.addClass('bi-chevron-down');
        }
    });
    $('.QueryGroup .DateRange2Lbl', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // parse (and if needed correct) the number value for days/months/years
        let event2Container = $(event.target).closest(".Event2Container");
        let body = $('.DateRange2Body', event2Container);
        let icon = $(".DateRange2Lbl i", event2Container);
        if (body.hasClass('hidden')) {
            body.removeClass('hidden');
            icon.removeClass('bi-chevron-down');
            icon.addClass('bi-chevron-up');
        } else {
            body.addClass('hidden');
            icon.removeClass('bi-chevron-up');
            icon.addClass('bi-chevron-down');
        }
    });


    let funcValidateDate = (event) => {
        let jqTarget = $(event.target);
        let errorFrameEl = $(jqTarget)[0].parentNode;

        let isValid = false;

        // display red box on error
        if (!i2b2.CRC.view.QT.isValidDate(jqTarget.val())) {
            $(errorFrameEl).css('border', 'solid');
        } else {
            $(errorFrameEl).css('border', '');
            isValid = true;
        }

        return isValid;
    };

    $('.DateStart, .DateEnd, .DateRange1Start, .DateRange1End, .DateRange2Start, .DateRange2End', i2b2.CRC.view.QT.containerDiv).on('input', (event) => {
        funcValidateDate(event);
    });

    $('.DateStart, .DateEnd, .DateRange1Start, .DateRange1End, .DateRange2Start, .DateRange2End', i2b2.CRC.view.QT.containerDiv).on('change', (event) => {
        let jqTarget = $(event.target);
        let newDate = jqTarget.val();
        let qgBody = jqTarget.closest(".QueryGroup");
        let qgIndex = qgBody.data("queryGroup");
        let qgData = i2b2.CRC.model.query.groups[qgIndex];
        let eventIdx = 0;
        if (jqTarget.hasClass('DateRange2Start') || jqTarget.hasClass('DateRange2End')) eventIdx = 1;
        if (qgData.events[eventIdx] === undefined) qgData.events[eventIdx] = {};
        if (qgData.events[eventIdx].dateRange === undefined) qgData.events[eventIdx].dateRange = {"start":"", "end":""};

        let isValidDate = funcValidateDate(event);

        if (isValidDate) {

            if (jqTarget.hasClass('DateStart') || jqTarget.hasClass('DateRange1Start') || jqTarget.hasClass('DateRange2Start')) {
                qgData.events[eventIdx].dateRange.start = event.target.value;
                // keep both Event 1 start date inputs synced
                if (eventIdx === 0) $('.DateStart, .DateRange1Start', qgBody).val(event.target.value);
            } else {
                qgData.events[eventIdx].dateRange.end = event.target.value;
                // keep both Event 1 end date inputs synced
                if (eventIdx === 0) $('.DateEnd, .DateRange1End', qgBody).val(event.target.value);
            }

            if(qgData.events[eventIdx].concepts && qgData.events[eventIdx].concepts.length > 0) {
                qgData.events[eventIdx].concepts.forEach(concept => {
                    // only include date range for specific SDX types
                    if (["CONCPT"].includes(concept.sdxInfo.sdxType)) {
                        if (concept.dateRange === undefined) concept.dateRange = {
                            "start": "",
                            "end": ""
                        };
                        concept.dateRange.start = qgData.events[eventIdx].dateRange.start;
                        concept.dateRange.end = qgData.events[eventIdx].dateRange.end;
                    }
                });

                let temp = $(event.target).closest(".event");
                let cncptListEl = $('.TermList', temp[0]);
                let eventData = i2b2.CRC.model.query.groups[qgIndex].events[eventIdx];
                i2b2.CRC.view.QT.renderTermList(eventData, cncptListEl);
            }
        }

        i2b2.CRC.view.QS.clearStatus();
    });

    $('.QueryGroup .OccursCount', i2b2.CRC.view.QT.containerDiv).on('blur', (event) => {
        // parse (and if needed correct) the number value for days/months/years
        let qgIndex = $(event.target).closest(".QueryGroup").data("queryGroup");
        let correctedVal = 1;
        event.target.value = event.target.value.trim();
        let isEmpty = event.target.value === '';
        if (!isNaN(parseInt(event.target.value)) || isEmpty) {
            if (isEmpty) {
                correctedVal = 1;
            } else {
                correctedVal = parseInt(event.target.value);
                if (correctedVal < 1) correctedVal = 1;
            }
            i2b2.CRC.model.query.groups[qgIndex].events[0].instances = correctedVal;
            $(event.target).css('border','').val(correctedVal);
        } else {
            $(event.target).css('border','solid 2px red');
        }
    });

    $('body').on('click', '.refreshStartDate, .refreshEndDate', (event) => {
        let jqTarget = $(event.target);
        let dateElement = jqTarget.parents(".dateRange").find(".DateStart");
        if (dateElement.length === 0) {
            dateElement = jqTarget.parents(".dateRange").find(".DateEnd");
        }
        dateElement.val("");
        dateElement.trigger("change");
    });

    // append the final query group drop target
    let newQG = $(i2b2.CRC.view.QT.template.qgadd({})).appendTo(i2b2.CRC.view.QT.containerDiv);
    // fix query groups titles so that the first one always says "Find Patients"
    i2b2.CRC.view.QT._correctQgTitles();
    // wire drop handler to the final query group
    let dropTarget = $(".Event1Container .i2b2DropTarget", newQG);
    i2b2.sdx.Master.AttachType(dropTarget, "CONCPT");
    i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "DropHandler", i2b2.CRC.view.QT.NewDropHandler);
    i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOver", i2b2.CRC.view.QT.HoverOver);
    i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOut", i2b2.CRC.view.QT.HoverOut);
    i2b2.sdx.Master.AttachType(dropTarget, "QM");
    i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "DropHandler", i2b2.CRC.view.QT.NewDropHandler);
    i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "onHoverOver", i2b2.CRC.view.QT.HoverOver);
    i2b2.sdx.Master.setHandlerCustom(dropTarget, "QM", "onHoverOut", i2b2.CRC.view.QT.HoverOut);
};
// ==================================================================================================
i2b2.CRC.view.QT.labValue = {};

i2b2.CRC.view.QT.labValue.editLabValue = function(evt) {
    let conceptIdx = $(evt.target).closest('.concept').data('conceptIndex');
    let eventIdx = $(evt.target).closest('.event').data('eventidx');
    let queryGroupIdx = $(evt.target).closest('.QueryGroup').data("queryGroup");
    let sdx = i2b2.CRC.model.query.groups[queryGroupIdx].events[eventIdx].concepts[conceptIdx];
    i2b2.CRC.view.QT.labValue.showLabValues(sdx);
};

i2b2.CRC.view.QT.labValue.showLabValues = function(sdxConcept) {

    let labValuesCallback = function() {

        let extractedLabValues = i2b2.CRC.ctrlr.labValues.extractedModel;

        if (extractedLabValues !== undefined) {

            let newLabValues = {
                valueType: null,
                valueOperator: null,
                value: null,
                flagValue: null,
                numericValueRangeLow: null,
                numericValueRangeHigh: null,
                unitValue: null,
                isEnum: false,
                isString: false
            };

            $("#labValuesModal div").eq(0).modal("show");

            $("#labValuesModal .dropdown-menu li").click(function () {
                $("#labDropDown").text($(this).text());
            });

            $("body #labValuesModal button.lab-save").click(function () {
                switch (newLabValues.valueType) {
                    case i2b2.CRC.ctrlr.labValues.VALUE_TYPES.FLAG:
                        newLabValues.numericValueRangeLow = null;
                        newLabValues.numericValueRangeHigh = null;
                        newLabValues.unitValue = null;
                        newLabValues.value = null;
                        newLabValues.isEnum = false;
                        break;
                    case null:
                        newLabValues = {};
                        break;
                    default:
                        newLabValues.flagValue = null;
                        break;
                }
                sdxConcept.LabValues = newLabValues;
                $("#labValuesModal div").eq(0).modal("hide");
                i2b2.CRC.view.QS.clearStatus();
            });

            $("#labAnyValueType").click(function () {
                $(".labValueSection").addClass("hidden");
                $(".labGraphUnitSection").addClass("hidden");
                $("#labEnumValueMain").addClass("hidden");
                $("#labFlag").addClass("hidden");
                newLabValues.valueType = null;
            });

            $("#labFlagType").click(function () {
                $(".labValueSection").addClass("hidden");
                $(".labGraphUnitSection").addClass("hidden");
                $("#labEnumValueMain").addClass("hidden");
                $("#labFlag").removeClass("hidden");
                newLabValues.valueType = i2b2.CRC.ctrlr.labValues.VALUE_TYPES.FLAG;
                newLabValues.valueOperator = 'EQ';
            });

            $("#labByValueType").click(function () {
                $("#labFlag").addClass("hidden");
                if (extractedLabValues.dataType === 'ENUM') {
                    $("#labEnumValueMain").removeClass("hidden");
                } else if (extractedLabValues.valueType === i2b2.CRC.ctrlr.labValues.VALUE_TYPES.NUMBER) {
                    $(".labGraphUnitSection").removeClass("hidden");
                    $(".labValueSection").removeClass("hidden");
                } else {
                    $(".labValueSection").removeClass("hidden");
                }
                newLabValues.valueType = extractedLabValues.valueType;
            });

            if (sdxConcept.LabValues && sdxConcept.LabValues.valueType) {
                newLabValues.valueType = sdxConcept.LabValues.valueType;
                switch (newLabValues.valueType) {
                    case i2b2.CRC.ctrlr.labValues.VALUE_TYPES.FLAG:
                        $("input[name='labType'][value='BY_FLAG']").trigger("click");
                        break;
                    case i2b2.CRC.ctrlr.labValues.VALUE_TYPES.NUMBER:
                    case i2b2.CRC.ctrlr.labValues.VALUE_TYPES.LARGETEXT:
                    case i2b2.CRC.ctrlr.labValues.VALUE_TYPES.TEXT:
                    case i2b2.CRC.ctrlr.labValues.VALUE_TYPES.MODIFIER:
                        $("input[name='labType'][value='BY_VALUE']").trigger("click");
                        break;
                }
            }

            $("#labHeader").text(extractedLabValues.name);

            if (extractedLabValues.flagType) {
                let labFlagValueSelection = $("#labFlagValue");
                for (let i = 0; i < extractedLabValues.flags.length; i++) {
                    let flagOption = $("<option></option>");
                    flagOption.text(extractedLabValues.flags[i].name);
                    flagOption.val(extractedLabValues.flags[i].value);
                    labFlagValueSelection.append(flagOption);
                }
                labFlagValueSelection.change(function () {
                    newLabValues.flagValue = $(this).val();
                });

                if (sdxConcept.LabValues && sdxConcept.LabValues.flagValue) {
                    labFlagValueSelection.val(sdxConcept.LabValues.flagValue);
                    newLabValues.flagValue = sdxConcept.LabValues.flagValue;
                    newLabValues.valueOperator = sdxConcept.LabValues.valueOperator;
                }

                labFlagValueSelection.trigger("change");
            }
            else{
                $("#labFlagTypeMain").hide();
            }

            switch (extractedLabValues.dataType) {
                case "POSFLOAT":
                case "POSINT":
                case "FLOAT":
                case "INT":
                    $("#labNumericValueOperatorMain").removeClass("hidden");
                    $("#labNumericValueMain").removeClass("hidden");

                    let numericValueOperatorSelection = $("#labNumericValueOperator");
                    numericValueOperatorSelection.change(function () {
                        let value = $(this).val();
                        if (value === "BETWEEN") {
                            $("#labNumericValueMain").addClass("hidden");
                            $("#labNumericValueRangeMain").removeClass("hidden");
                        } else {
                            $("#labNumericValueMain").removeClass("hidden");
                            $("#labNumericValueRangeMain").addClass("hidden");
                        }

                        newLabValues.valueOperator = value;
                    });
                    let numericValueSelection = $("#labNumericValue");
                    numericValueSelection.change(function () {
                        newLabValues.value = $(this).val();
                    });

                    let numericValueRangeLowSelection = $("#labNumericValueRangeLow");
                    numericValueRangeLowSelection.change(function () {
                        newLabValues.numericValueRangeLow = $(this).val();
                    });

                    let numericValueRangeHighSelection = $("#labNumericValueRangeHigh");
                    numericValueRangeHighSelection.change(function () {
                        newLabValues.numericValueRangeHigh = $(this).val();
                    });

                    if (sdxConcept.LabValues && sdxConcept.LabValues.valueOperator) {
                        numericValueOperatorSelection.val(sdxConcept.LabValues.valueOperator).trigger("change");
                        newLabValues.valueOperator = sdxConcept.LabValues.valueOperator;

                        if (sdxConcept.LabValues.valueOperator === "BETWEEN") {
                            newLabValues.numericValueRangeLow = sdxConcept.LabValues.numericValueRangeLow;
                            newLabValues.numericValueRangeHigh = sdxConcept.LabValues.numericValueRangeHigh;
                            numericValueRangeLowSelection.val(sdxConcept.LabValues.numericValueRangeLow);
                            numericValueRangeHighSelection.val(sdxConcept.LabValues.numericValueRangeHigh);
                        } else {
                            numericValueSelection.val(sdxConcept.LabValues.value);
                            newLabValues.value = sdxConcept.LabValues.value;
                        }
                    }
                    numericValueOperatorSelection.trigger("change");

                    //Bar segment
                    try {
                        if (extractedLabValues.rangeInfo.total !== 0) {
                            $("#barNormMain").removeClass("hidden");
                            if (isFinite(extractedLabValues.rangeInfo.LowOfToxic)) {
                                $("#lblToxL").text(extractedLabValues.rangeInfo.LowOfToxic);
                                $("#barToxL").click(function () {
                                    let value = $("#lblToxL").text();
                                    $("#labNumericValueOperator").val("LE");
                                    $("#labNumericValue").val(value);
                                });
                                $("#barToxLMain").removeClass("hidden");
                            } else {
                                $("#lblToxL").text("");
                            }
                            if (isFinite(extractedLabValues.rangeInfo.LowOfLow) && (extractedLabValues.rangeInfo.LowOfLowRepeat === false)) {
                                $("#lblLofL").text(extractedLabValues.rangeInfo.LowOfLow);
                                $("#barLofL").click(function (event) {
                                    let value = $("#lblLofL").text();
                                    $("#labNumericValueOperator").val("LE").trigger("change");
                                    $("#labNumericValue").val(value).trigger("change");
                                });
                                $("#barLofLMain").removeClass("hidden");
                            } else {
                                $("#lblLofL").text("");
                            }
                            if (isFinite(extractedLabValues.rangeInfo.HighOfLow) && (extractedLabValues.rangeInfo.HighOfLowRepeat === false)) {
                                $("#lblHofL").text(extractedLabValues.rangeInfo.HighOfLow);
                                $("#barHofL").click(function (event) {
                                    let value = $("#lblHofL").text();
                                    $("#labNumericValueOperator").val("LE").trigger("change");
                                    $("#labNumericValue").val(value).trigger("change");
                                });
                                $("#barHofLMain").removeClass("hidden");
                            } else {
                                $("#lblHofL").text("");
                            }
                            if (isFinite(extractedLabValues.rangeInfo.LowOfHigh) && (extractedLabValues.rangeInfo.LowOfHighRepeat === false)) {
                                $("#lblLofH").text(extractedLabValues.rangeInfo.LowOfHigh);
                                $("#barLofH").click(function (event) {
                                    let value = $("#lblLofH").text();
                                    $("#labNumericValueOperator").val("GE").trigger("change");
                                    $("#labNumericValue").val(value).trigger("change");
                                });
                                $("#barLofHMain").removeClass("hidden");
                            } else {
                                $("#lblLofH").text("");
                            }
                            if (isFinite(extractedLabValues.rangeInfo.HighOfHigh) && (extractedLabValues.rangeInfo.HighOfHighRepeat === false)) {
                                $("#lblHofH").text(extractedLabValues.rangeInfo.HighOfHigh);
                                $("#barHofH").click(function (event) {
                                    let value = $("#lblHofH").text();
                                    $("#labNumericValueOperator").val("GE").trigger("change");
                                    $("#labNumericValue").val(value).trigger("change");
                                });
                                $("#barHofHMain").removeClass("hidden");
                            } else {
                                $("#lblHofH").text("");
                            }
                            if (isFinite(extractedLabValues.rangeInfo.HighOfToxic)) {
                                $("#lblToxH").text(extractedLabValues.rangeInfo.HighOfToxic);
                                $("#barToxH").click(function (event) {
                                    let value = $("#lblToxH").text();
                                    $("#labNumericValueOperator").val("GE").trigger("change");
                                    $("#labNumericValue").val(value).trigger("change");
                                });
                                $("#barToxHMain").removeClass("hidden");
                            } else {
                                $("#lblToxH").text("");
                            }
                        } else {
                            $("#labBarMain").hide();
                        }
                    } catch (e) {
                        let errString = "Description: " + e.description;
                        alert(errString);
                    }

                    if (extractedLabValues.valueUnits.length !== 0) {
                        let labUnits = $("#labUnits");

                        let labUnitKeys = Object.keys(extractedLabValues.valueUnits);
                        for (let i = 0; i < labUnitKeys.length; i++) {
                            let unitOption = $("<option></option>");
                            unitOption.val(extractedLabValues.valueUnits[labUnitKeys[i]].name);
                            if (extractedLabValues.valueUnits[labUnitKeys[i]].masterUnit) {
                                labUnits.val(extractedLabValues.valueUnits[labUnitKeys[i]].name);
                                $("#labUnitsLabel").text(extractedLabValues.valueUnits[labUnitKeys[i]].name);
                            }
                            unitOption.text(extractedLabValues.valueUnits[labUnitKeys[i]].name);
                            labUnits.append(unitOption);
                        }

                        labUnits.change(function () {
                            // message if selected Unit is excluded from use
                            let value = $(this).val();
                            $("#labUnitsLabel").text(extractedLabValues.valueUnits[value].name);
                            if (extractedLabValues.valueUnits[value].excluded) {
                                $("#labUnitExcluded").removeClass("hidden");
                                $("#labNumericValue").prop("disabled", true);
                                $("#labNumericValueRangeLow").prop("disabled", true);
                                $("#labNumericValueRangeHigh").prop("disabled", true);
                            } else {
                                $("#labUnitExcluded").addClass("hidden");
                                $("#labNumericValue").prop("disabled", false);
                                $("#labNumericValueRangeLow").prop("disabled", false);
                                $("#labNumericValueRangeHigh").prop("disabled", false);
                            }

                            newLabValues.unitValue = value;
                        });
                        if (sdxConcept.LabValues && sdxConcept.LabValues.unitValue) {
                            labUnits.val(sdxConcept.LabValues.unitValue);
                            labUnits.trigger("change");
                            newLabValues.unitValue = sdxConcept.LabValues.unitValue;
                        }
                    }
                    break;
                case "LRGSTR":
                    let largeStringValueOperatorSelection = $("#labLargeStringValueOperator");
                    let stringValueSelection = $("#labStringValue");

                    $("#labLargeStringValueOperatorMain").removeClass("hidden");
                    $("#labStringValueMain").removeClass("hidden");
                    $("label[for='labAnyValueType']").text("No Search Requested");
                    $("label[for='labByValueType']").text("Search within Text");
                    largeStringValueOperatorSelection.change(function () {
                        let value = "CONTAINS";
                        if ($(this).is(":checked")) {
                            value = "CONTAINS[database]";
                        }
                        newLabValues.valueOperator = value;
                    });

                    stringValueSelection.change(function () {
                        newLabValues.value = $(this).val();
                    });

                    if (sdxConcept.LabValues) {
                        if (sdxConcept.LabValues.valueOperator === "CONTAINS[database]" ) {
                            largeStringValueOperatorSelection.trigger("click");
                        }

                        if (sdxConcept.LabValues.value) {
                            stringValueSelection.val(sdxConcept.LabValues.value).trigger("change");
                        }
                    }
                    largeStringValueOperatorSelection.trigger("change");
                    newLabValues.isString = true;
                    break;
                case "STR":
                    $("#labStringValueOperatorMain").removeClass("hidden");
                    $("#labStringValueMain").removeClass("hidden");
                    let stringSelection = $("#labStringValue");
                    let stringValueOperatorSelection = $("#labStringValueOperator");

                    stringValueOperatorSelection.change(function () {
                        newLabValues.valueOperator = $(this).val();
                    });

                    stringSelection.change(function () {
                        newLabValues.value = $(this).val();
                    });

                    if (sdxConcept.LabValues) {
                        if (sdxConcept.LabValues.valueOperator) {
                            stringValueOperatorSelection.val(sdxConcept.LabValues.valueOperator);
                            if (sdxConcept.LabValues.value) {
                                stringSelection.val(sdxConcept.LabValues.value).trigger("change");
                            }
                        }
                    }
                    stringValueOperatorSelection.trigger("change");
                    newLabValues.isString = true;
                    break;
                case "ENUM":
                    if (Object.keys(extractedLabValues.enumInfo).length > 0) {
                        let labEnumValueSelection = $("#labEnumValue");
                        Object.entries(extractedLabValues.enumInfo).forEach(([key, value]) => {
                            let enumOption = $("<option></option");
                            enumOption.text(value);
                            enumOption.val(key);
                            labEnumValueSelection.append(enumOption);
                        });

                        labEnumValueSelection.change(function () {
                            newLabValues.value = $(this).val();
                            newLabValues.valueOperator = "IN";
                        });

                        //scroll to selected enum value in list
                        const ro = new ResizeObserver(() => {
                            if (labEnumValueSelection.is(':visible')) {
                                let selectedOption = labEnumValueSelection.find(":selected");
                                let optionTop = selectedOption.offset().top;
                                let selectTop = labEnumValueSelection.offset().top;
                                labEnumValueSelection.scrollTop(labEnumValueSelection.scrollTop() + (optionTop - selectTop));
                            }
                        });
                        ro.observe(labEnumValueSelection[0]);

                        if (sdxConcept.LabValues && sdxConcept.LabValues.value) {
                            labEnumValueSelection.val(sdxConcept.LabValues.value);
                        }
                        labEnumValueSelection.trigger("change");
                        newLabValues.isEnum = true;
                    }
                    break;
                default:
                    $("#labByValueTypeMain").hide();
                    break
            }

            if (extractedLabValues.valueType === "LARGETEXT") {
                $("#labHelpText").text("You are allowed to search within the narrative text associated with the term "
                    + extractedLabValues.name);
            } else if (sdxConcept.isModifier) {
                $("#labHelpText").text("Searches by Modifier values can be constrained by either a flag set by the sourcesystem or by the values themselves.");
            } else {
                $("#labHelpText").text("Searches by Lab values can be constrained by the high/low flag set by the performing laboratory, or by the values themselves.");
            }
        }
    };

    let labValuesModal = $("#labValuesModal");

    if (labValuesModal.length === 0) {
        $("body").append("<div id='labValuesModal'/>");
        labValuesModal = $("#labValuesModal");
    }

    labValuesModal.load('js-i2b2/cells/CRC/assets/modalLabValues.html', function() {
        i2b2.CRC.ctrlr.labValues.loadData(sdxConcept, labValuesCallback);
    });
};
// ================================================================================================== //
i2b2.CRC.view.QT.clearAll = function(){
    // only run if the query has entries
    if (i2b2.CRC.model.query.groups.length === 0) return;
    i2b2.CRC.ctrlr.QT.clearQuery();
    i2b2.CRC.view.QT.clearQuery();
    i2b2.CRC.view.QS.clearStatus();
}


// This is done once the entire cell has been loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
        if (cell.cellCode === 'CRC') {
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.QT",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    cell.view.QT.lm_view = container;

                    // add the cellWhite flare
                    cell.view.QT.containerRoot = $('<div class="CRC_QT_view"></div>').appendTo(cell.view.QT.lm_view._contentElement);
                    let runBar = $('<div class="CRC_QT_runbar">' +
                            '<div class="left">' +
                                '<label>Name:</label>' +
                            '</div>' +
                        '</div>');
                    let queryName = $('<input id="queryName" class="name">');
                    $('<div class="center"></div>').append(queryName).appendTo(runBar);
                    runBar.append('<div class="right">' +
                        '<button type="button" class="btn btn-primary btn-sm button-run">Find Patients</button>' +
                        '<button type="button" class="btn btn-primary btn-sm button-clear">Clear All</button>' +
                        '</div>');

                    runBar.appendTo(cell.view.QT.containerRoot);

                    cell.view.QT.containerDiv = $('<div class="CRC_QT_query"></div>').appendTo(cell.view.QT.containerRoot);

                    i2b2.sdx.Master.AttachType(queryName, 'QM');
                    i2b2.sdx.Master.setHandlerCustom(queryName, 'QM', 'DropHandler',function(sdxData, elem) {
                        // handle if QM drag drop is comming from a WORK item
                        if (sdxData.sdxInfo.sdxType === "WRK") sdxData = sdxData.sdxUnderlyingPackage;
                        $(elem.target).prop("placeholder", sdxData.sdxInfo.sdxDisplayName);
                        $(elem.target).removeClass("DropHover");
                        let qm_id = sdxData.sdxInfo.sdxKeyValue;
                        i2b2.CRC.ctrlr.QT.doQueryLoad(qm_id);
                    });

                    i2b2.sdx.Master.setHandlerCustom(queryName, 'QM', 'onHoverOut', function(elem) {
                        $(elem).removeClass("DropHover");
                    });
                    i2b2.sdx.Master.setHandlerCustom(queryName, 'QM', 'onHoverOver', function(elem) {
                        $(elem).addClass("DropHover");
                    });

                    container.on('open', () => {
                        // capture "run query" button click ---------------------------------------------------
                        $(".CRC_QT_runbar .button-run", cell.view.QT.containerRoot).on("click", (evt)=> {
                            evt.target.blur();
                            // only run if the query has entries
                            if (i2b2.CRC.model.query.groups.length > 0) i2b2.CRC.view.QT.showRun();
                        });

                        // capture "clear query" button click -------------------------------------------------
                        $(".CRC_QT_runbar .button-clear", cell.view.QT.containerRoot).on("click", (evt)=> {
                            evt.target.blur();
                            i2b2.CRC.view.QT.clearAll();
                        });
                    });

                    i2b2.CRC.view.QT.render();


                }).bind(this)
            );

            // load the templates (TODO: Refactor this to loop using a varname/filename list)
            // TODO: Refactor templates to use Handlebars partals system
            cell.view.QT.template = {};
            // ... for query groups
            $.ajax("js-i2b2/cells/CRC/templates/QueryGroup.html", {
                success: (template) => {
                    cell.view.QT.template.qg = Handlebars.compile(template);
                },
                error: (error) => { console.error("Could not retrieve template: QueryGroup.html"); }
            });
            // ... for query group concepts list
            $.ajax("js-i2b2/cells/CRC/templates/QueryGroupConceptList.html", {
                success: (template) => {
                    cell.view.QT.template.qgcl = Handlebars.compile(template);
                },
                error: (error) => { console.error("Could not retrieve template: QueryGroupConceptList.html"); }
            });
            // ... for the final query group drop target / run button
            $.ajax("js-i2b2/cells/CRC/templates/QueryGroupAdder.html", {
                success: (template) => {
                    cell.view.QT.template.qgadd = Handlebars.compile(template);
                },
                error: (error) => { console.error("Could not retrieve template: QueryGroupAdder.html"); }
            });
            // ---------------------------------------------------------
            // ... XML for the query request (main body)
            $.ajax("js-i2b2/cells/CRC/templates/Query.xml", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("Query", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: Query.xml"); }
            });
            // ... XML for the query request (main body)
            $.ajax("js-i2b2/cells/CRC/templates/QueryPanel.xml", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryPanel", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryPanel.xml"); }
            });
            // ... XML for the query request (main body)
            $.ajax("js-i2b2/cells/CRC/templates/QueryPanelItem.xml", {
                success: (template, status, req) => {
                    Handlebars.registerPartial("QueryPanelItem", req.responseText);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: QueryPanelItem.xml"); }
            });

            //template for the setting date constraint on concept
            $.ajax("js-i2b2/cells/CRC/templates/ConceptDateConstraint.html", {
                success: (template) => {
                    cell.view.QT.template.dateConstraint = Handlebars.compile(template);
                },
                error: (error) => { console.error("Could not retrieve template: ConceptDateConstraint.html"); }
            });

            cell.model.query = {
                name: 'default query name',
                groups: []
            };

            //Update the result types from ajax call
            var scopedCallback = new i2b2_scopedCallback();
            scopedCallback.callback = function(results) {
                //var cl_onCompleteCB = onCompleteCallback;
                // THIS function is used to process the AJAX results of the getChild call
                //		results data object contains the following attributes:
                //			refXML: xmlDomObject <--- for data processing
                //			msgRequest: xml (string)
                //			msgResponse: xml (string)
                //			error: boolean
                //			errorStatus: string [only with error=true]
                //			errorMsg: string [only with error=true]
                cell.model.resultTypes = {};

                if(results.error){
                    console.log("ERROR: Unable to retrieve result types from server", results.msgResponse);
                }
                else{
                    // extract records from XML msg
                    let ps = results.refXML.getElementsByTagName('query_result_type');
                    cell.model.selectedResultTypes = [];
                    for(let i1=0; i1<ps.length; i1++) {
                        let name = i2b2.h.getXNodeVal(ps[i1],'name');
                        let visual_attribute_type = i2b2.h.getXNodeVal(ps[i1],'visual_attribute_type');
                        if (visual_attribute_type === "LA") {
                            if(cell.model.resultTypes[name] === undefined){
                                cell.model.resultTypes[name] = [];
                            }
                            cell.model.resultTypes[name].push(i2b2.h.getXNodeVal(ps[i1],'description'));
                            if(name === "PATIENT_COUNT_XML"){
                                cell.model.selectedResultTypes.push(name);
                            }
                        }
                    }
                }
            }
            i2b2.CRC.ajax.getQRY_getResultType("CRC:QueryTool", null, scopedCallback);
        }
    }
);
