/**
 * @projectDescription	View controller for CRC Query Tool window.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.QT
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > view > Main');
console.time('execute time');


// create and save the view objects
i2b2.CRC.view['QT'] = new i2b2Base_cellViewController(i2b2.CRC, 'QT');

// ================================================================================================== //
i2b2.CRC.view.QT.updateQueryName = function() {
    // update the transformed model and set the title
    i2b2.CRC.ctrlr.QT._processModel();
    $('.CRC_QT_runbar input.name').attr("placeholder", i2b2.CRC.model.transformedQuery.name);
};

// ================================================================================================== //
i2b2.CRC.view.QT.showRun = function() {
    // show the options modal screen
    if ($('body #crcModal').length === 0) {
        $('body').append("<div id='crcModal'/>");
    }

    $('body #crcModal').load('/js-i2b2/cells/CRC/assets/modalRunQuery.html', function() {
        // pre populate data
        // TODO: populate the data based on...
        // ==> i2b2.CRC.model.resultTypes
        // ==> i2b2.CRC.model.selectedResultTypes

        // now show the modal form
        $('body #crcModal div:eq(0)').modal('show');

        // run the query on button press
        $('body #crcModal button.i2b2-save').on('click', (evt) => {
            // build list of selected result types
            let reqResultTypes = $('body #crcModal .chkQueryType:checked').map((idx, rec) => { return rec.value; }).toArray();
            // run the query
            i2b2.CRC.ctrlr.QT.runQuery(reqResultTypes);
            // close the modal
            $('body #crcModal div:eq(0)').modal('hide');
        });
    });
};

// ================================================================================================== //
i2b2.CRC.view.QT._correctQgTitles = function() {
    // this function makes sure that the first query group always says "Find Patients"
    $(" .JoinText:first", i2b2.CRC.view.QT.containerDiv).text("Find Patients");
};

// ============ Actions on term list items ============
i2b2.CRC.view.QT.termActionInfo = function(evt) {
    let conceptIdx = $(evt.target).closest('.concept').data('conceptIndex');
    let eventIdx = $(evt.target).closest('.event').data('eventidx');
    let queryGroupIdx = $(evt.target).closest('.QueryGroup').data("queryGroup");
    alert("get term info for group-"+queryGroupIdx+"/event-"+eventIdx+"/concept-"+conceptIdx);
    i2b2.layout.gl_instances.leftCol.root.contentItems[0].contentItems[0].addChild({
            componentName: "i2b2.ONT.view.info",
            type: "component",
            isClosable: true,
            reorderEnabled: true,
            title: "Term Info",
            sdx: i2b2.CRC.model.query.groups[queryGroupIdx].events[eventIdx].concepts[conceptIdx]
    });
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
};

// ================================================================================================== //
i2b2.CRC.view.QT.renderTermList = function(data, targetEl) {
    // rerender the query event and add to the DOM
    $(targetEl).empty();
    $(i2b2.CRC.view.QT.template.qgcl(data)).appendTo(targetEl);
    // clear the first "or" in the term list
    $('.termOr:first', targetEl).text("");
    // add event listeners for term options functionality
    $('.concept .actions .info', targetEl).on('click', i2b2.CRC.view.QT.termActionInfo);
    $('.concept .actions .delete', targetEl).on('click', i2b2.CRC.view.QT.termActionDelete);
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
};

// ================================================================================================== //
i2b2.CRC.view.QT.handleLabs = function(sdx) {
    // see if the concept is a lab, prompt for value if it is
    sdx.isLab = false;
    if (sdx.origData.basecode !== undefined) {
        if (sdx.origData.basecode.startsWith("LOINC")) sdx.isLab = true;
    }
    return sdx.isLab;
};

// ================================================================================================== //
i2b2.CRC.view.QT.HoverOver = function(el) { $(el).closest(".i2b2DropTarget").addClass("DropHover"); };
i2b2.CRC.view.QT.HoverOut = function(el) { $(el).closest(".i2b2DropTarget").removeClass("DropHover"); };

// ================================================================================================== //
i2b2.CRC.view.QT.NewDropHandler = function(sdx, evt){
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
    i2b2.CRC.model.query.groups[qgIdx].events[0].concepts.push(sdx);

    // see if it is a lab
    let isLab = i2b2.CRC.view.QT.handleLabs(sdx);

    if(isLab){
        i2b2.CRC.view.QT.labValue.showLabValues(sdx);
    }
    // render the new query group (by re-rendering all the query groups)
    i2b2.CRC.view.QT.render();

    // update the query name
    i2b2.CRC.view.QT.updateQueryName();
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
    i2b2.CRC.view.QT.handleLabs(sdx);
    // add the data to the correct terms list (also prevent duplicates)
    let eventData = i2b2.CRC.model.query.groups[qgIndex].events[eventIdx];
    temp = eventData.concepts.filter((term)=>{ return term.sdxInfo.sdxKeyValue === sdx.sdxInfo.sdxKeyValue; });
    if (temp.length === 0) {
        // not a duplicate, add to the event's term list
        eventData.concepts.push(sdx);
        // rerender the query event and add to the DOM
        i2b2.CRC.view.QT.renderTermList(eventData, cncptListEl);

    }
    if (sdx.isLab) {
        i2b2.CRC.view.QT.labValue.showLabValues(sdx);
    }
    // update the query name
    i2b2.CRC.view.QT.updateQueryName();
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

        // attach the data picker functionality
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
        dropTarget = $(".Event2Container", newQG);
        i2b2.sdx.Master.AttachType(dropTarget, "CONCPT");
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "DropHandler", i2b2.CRC.view.QT.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOver", i2b2.CRC.view.QT.HoverOver);
        i2b2.sdx.Master.setHandlerCustom(dropTarget, "CONCPT", "onHoverOut", i2b2.CRC.view.QT.HoverOut);
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
    $('.DateStart, .DateEnd, .DateRange1Start, .DateRange1End, .DateRange2Start, .DateRange2End', i2b2.CRC.view.QT.containerDiv).on('change', (event) => {
        let jqTarget = $(event.target);
        let qgBody = jqTarget.closest(".QueryGroup");
        let qgIndex = qgBody.data("queryGroup");
        let qgData = i2b2.CRC.model.query.groups[qgIndex];
        let eventIdx = 0;
        if (jqTarget.hasClass('DateRange2Start') || jqTarget.hasClass('DateRange2End')) eventIdx = 1;
        if (qgData.events[eventIdx] === undefined) qgData.events[eventIdx] = {};
        if (qgData.events[eventIdx].dateRange === undefined) qgData.events[eventIdx].dateRange = {"start":"", "end":""};
        if (jqTarget.hasClass('DateStart') || jqTarget.hasClass('DateRange1Start') || jqTarget.hasClass('DateRange2Start')) {
            qgData.events[eventIdx].dateRange.start = event.target.value;
            // keep both Event 1 start date inputs synced
            if (eventIdx === 0) $('.DateStart, .DateRange1Start', qgBody).val(event.target.value);
        } else {
            qgData.events[eventIdx].dateRange.end = event.target.value;
            // keep both Event 1 end date inputs synced
            if (eventIdx === 0) $('.DateEnd, .DateRange1End', qgBody).val(event.target.value);
        }
    });

    $('.QueryGroup .OccursCount', i2b2.CRC.view.QT.containerDiv).on('blur', (event) => {
        // parse (and if needed correct) the number value for days/months/years
        let qgIndex = $(event.target).closest(".QueryGroup").data("queryGroup");
        let correctedVal = 1;
        if (!isNaN(event.target.value)) {
            correctedVal = parseInt(event.target.value);
            if (correctedVal < 1) correctedVal = 1;
        }
        i2b2.CRC.model.query.groups[qgIndex].events[0].instances = correctedVal;
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
};
// ==================================================================================================
i2b2.CRC.view.QT.labValue = {};

i2b2.CRC.view.QT.labValue.showLabValues = function(sdxConcept) {
    let labValuesModal = $("#labValuesModal");

    if (labValuesModal.length === 0) {
        $('body').append("<div id='labValuesModal'/>");
        labValuesModal = $("#labValuesModal");
    }

    labValuesModal.load('/js-i2b2/cells/CRC/assets/modalLabValues.html', function() {
        let labValuesCallback = function() {
            let labValues = i2b2.CRC.ctrlr.labValues.extractedModel;

            if (labValues !== undefined) {
                $('body #labValuesModal div:eq(0)').modal('show');

                $("#labValuesModal .dropdown-menu li").click(function () {
                    $("#labDropDown").text($(this).text());
                });

                $("body #labValuesModal button.lab-save").on("click", (evt) => {
                    $("body #labValuesModal").modal("hide");
                });

                $("#labAnyValueType").click(function(){
                    $(".labValueSection").addClass("hidden");
                    $("#labFlag").addClass("hidden");
                });

                $("#labFlagType").click(function(){
                    $(".labValueSection").addClass("hidden");
                    $("#labFlag").removeClass("hidden");
                });

                $("#labByValueType").click(function(){
                    $(".labValueSection").removeClass("hidden");
                    $("#labFlag").addClass("hidden");
                });

                $("#labHeader").text(labValues.name);

                for (let i = 0; i < labValues.flags.length; i++) {
                    let flagOption = $("<option></option>");
                    flagOption.text(labValues.flags[i].name);
                    flagOption.val(labValues.flags[i].value);
                    $("#labFlagValue").append(flagOption);
                }

                if(!labValues.flagType){
                    $("#labFlagTypeMain").hide();
                }

                $("#labNumericValueOperator").change(function(){
                    let value = $(this).val();

                    if(value === "BETWEEN") {
                        $("#labNumericValueMain").addClass("hidden");
                        $("#labNumericValueRangeMain").removeClass("hidden");
                    }else{
                        $("#labNumericValueMain").removeClass("hidden");
                        $("#labNumericValueRangeMain").addClass("hidden");
                    }
                });

                switch(labValues.valueType) {
                    case "POSFLOAT":
                    case "POSINT":
                    case "FLOAT":
                    case "INT":
                        $("#labNumericValueOperatorMain").removeClass("hidden");
                        $("#labNumericValueMain").removeClass("hidden");
                        break;
                    case "LRGSTR":
                        $("#labLargeStringValueOperatorMain").removeClass("hidden");
                        $("#labStringValueMain").removeClass("hidden");
                        break;
                    case "STR":
                        $("#labStringValueOperatorMain").removeClass("hidden");
                        $("#labStringValueMain").removeClass("hidden");
                        break;
                    case "ENUM":
                        $("#labEnumValueMain").removeClass("hidden");
                        $("#labStringValueMain").removeClass("hidden");
                        break;
                    default:
                        $("#labByValueTypeMain").hide();
                        break
                }

                if (labValues.valueType === "LRGSTR") {
                    $("#labHeader").text("You are allowed to search within the narrative text associated with the term "
                        + labValues.name);
                    /*$('mlvfrmTypeNONE').nextSibling.nodeValue = "No Search Requested";
                    $('mlvfrmTypeVALUE').nextSibling.nodeValue = "Search within Text";
                    */
                } else if (sdxConcept.isModifier) {
                    $("#labHelpText").text("Searches by Modifier values can be constrained by either a flag set by the sourcesystem or by the values themselves.");
                } else {
                    $("#labHelpText").text("Searches by Lab values can be constrained by the high/low flag set by the performing laboratory, or by the values themselves.");
                }

                if (labValues.valueUnits.length !==0) {
                    let labUnits = $("#labUnits");

                    //set the label to the first value in the units list
                    $("#labUnitsLabel").text(labValues.valueUnits[0].name);

                    for (let i=0; i<labValues.valueUnits.length; i++) {
                        let unitOption = $("<option></option>");
                        unitOption.val(i);
                        if (labValues.valueUnits[i].masterUnit) {
                            labUnits.val(i);
                        }
                        unitOption.text(labValues.valueUnits[i].name);
                        labUnits.append(unitOption);
                    }

                    labUnits.change(function(){
                        // message if selected Unit is excluded from use
                        let value= $(this).val();
                        $("#labUnitsLabel").text(labValues.valueUnits[value].name);
                        if (labValues.valueUnits[value].excluded) {
                            $("#labUnitExcluded").removeClass(hidden);
                            $("#labNumericValue").prop("disabled", true);
                            $("#labNumericValueRangeLow").prop("disabled", true);
                            $("#labNumericValueRangeHigh").prop("disabled", true);
                        } else {
                            $("#labUnitExcluded").addClass(hidden);
                            $("#labNumericValue").prop("disabled", false);
                            $("#labNumericValueRangeLow").prop("disabled", false);
                            $("#labNumericValueRangeHigh").prop("disabled", false);
                        }
                    })
                }
                else{
                    $("#labUnitsMain").hide();
                }

                //Bar segment
                try {
                    if (labValues.rangeInfo.total  !== 0) {
                        $("#barNormMain").removeClass("hidden");
                        if (isFinite(labValues.rangeInfo.LowOfToxic)) {
                            $("#lblToxL").text(labValues.rangeInfo.LowOfToxic);
                            $("#barToxL").click(function(){
                                let value = $("#lblToxL").text();
                                $("#labNumericValueOperator").val("LE");
                                $("#labNumericValue").val(value);
                            });
                            $("#barToxLMain").removeClass("hidden");
                        }
                        else {
                            $("#lblToxL").text("");
                        }
                        if (isFinite(labValues.rangeInfo.LowOfLow) && (labValues.rangeInfo.LowOfLowRepeat === false)) {
                            $("#lblLofL").text(labValues.rangeInfo.LowOfLow);
                            $("#barLofL").click(function(event){
                                let value = $("#lblLofL").text();
                                $("#labNumericValueOperator").val("LE");
                                $("#labNumericValue").val(value);
                            });
                            $("#barLofLMain").removeClass("hidden");
                        }
                        else {
                            $("#lblLofL").text("");
                        }
                        if (isFinite(labValues.rangeInfo.HighOfLow) && (labValues.rangeInfo.HighOfLowRepeat === false)) {
                            $("#lblHofL").text(labValues.rangeInfo.HighOfLow);
                            $("#barHofL").click(function(event){
                                let value = $("#lblHofL").text();
                                $("#labNumericValueOperator").val("LE");
                                $("#labNumericValue").val(value);
                            });
                            $("#barHofLMain").removeClass("hidden");
                        }
                        else {
                            $("#lblHofL").text("");
                        }
                        if (isFinite(labValues.rangeInfo.LowOfHigh) && (labValues.rangeInfo.LowOfHighRepeat === false)) {
                            $("#lblLofH").text(labValues.rangeInfo.LowOfHigh);
                            $("#barLofH").click(function(event){
                                let value = $("#lblLofH").text();
                                $("#labNumericValueOperator").val("GE");
                                $("#labNumericValue").val(value);
                            });
                            $("#barLofHMain").removeClass("hidden");
                        }
                        else {
                            $("#lblLofH").text("");
                        }
                        if (isFinite(labValues.rangeInfo.HighOfHigh) && (labValues.rangeInfo.HighOfHighRepeat === false)) {
                            $("#lblHofH").text(labValues.rangeInfo.HighOfHigh);
                            $("#barHofH").click(function(event){
                                let value = $("#lblHofH").text();
                                $("#labNumericValueOperator").val("GE");
                                $("#labNumericValue").val(value);
                            });
                            $("#barHofHMain").removeClass("hidden");
                        }
                        else {
                            $("#lblHofH").text("");
                        }
                        if (isFinite(labValues.rangeInfo.HighOfToxic)) {
                            $("#lblToxH").text(labValues.rangeInfo.HighOfToxic);
                            $("#barToxH").click(function(event){
                                let value = $("#lblToxH").text();
                                $("#labNumericValueOperator").val("GE");
                                $("#labNumericValue").val(value);
                            });
                            $("#barToxHMain").removeClass("hidden");
                        }
                        else {
                            $("#lblToxH").text("");
                        }
                    }
                    else {
                        $("#labBarMain").hide();
                    }
                }
                catch(e) {
                    let errString = "Description: " + e.description;
                    alert(errString);
                }
            }
        }
        i2b2.CRC.ctrlr.labValues.loadData(sdxConcept, labValuesCallback);
    });
}
// ================================================================================================== //


// ================================================================================================== //
// This is done once the entire cell has been loaded
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
i2b2.events.afterCellInit.add(
    function (cell) {
        if (cell.cellCode == 'CRC') {
// ================================================================================================== //
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');

            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.QT",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    cell.view.QT.lm_view = container;

                    // add the cellWhite flare
                    cell.view.QT.containerRoot = $('<div class="CRC_QT_view"></div>').appendTo(cell.view.QT.lm_view._contentElement);
                    $('<div class="CRC_QT_runbar"><div class="name"><label>Name:</label><input class="name"></div><div class="button"><button type="button" class="btn btn-primary btn-sm">Run Query</button></div></div>').appendTo(cell.view.QT.containerRoot);
                    cell.view.QT.containerDiv = $('<div class="CRC_QT_query"></div>').appendTo(cell.view.QT.containerRoot);


                    // TODO: add rest of initialization code here
                    container.on('open', () => {
                        $(".CRC_QT_runbar .button button", cell.view.QT.containerRoot).on("click", (evt)=> {
                            evt.target.blur();
                            i2b2.CRC.view.QT.showRun();
                        });
                    });

                    i2b2.CRC.view.QT.render();


                }).bind(this)
            );

// !!! Do this properly via the "cell_config_data.json" file
//            // Attach the stylesheets
//            $('<link type="text/css" rel="stylesheet" href="js-i2b2/cells/CRC/assets/QueryGroups.css">').appendTo($("head")[0]);


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


            cell.model.resultTypes = {
                "PATIENTSET": "Patient set",
                "PATIENT_ENCOUNTER_SET":"Encounter set",
                "PATIENT_COUNT_XML": "Number of patients",
                "PATIENT_GENDER_COUNT_XML": "Gender patient breakdown",
                "PATIENT_VITALSTATUS_COUNT_XML": "Vital Status patient breakdown",
                "PATIENT_RACE_COUNT_XML": "Race patient breakdown",
                "PATIENT_AGE_COUNT_XML": "Age patient breakdown",
                "PATIENTSET": "Timeline",
                "PATIENT_LOS_XML": "Length of stay breakdown",
                "PATIENT_TOP50MEDS_XML": "Top 50 medications breakdown",
                "PATIENT_TOP50DIAG_XML": "Top 50 diangosis breakdown",
                "PATIENT_INOUT_XML": "Inpatient and outpatient breakdown",
            };
            cell.model.selectedResultTypes = [
                "PATIENT_COUNT_XML",
                "PATIENT_GENDER_COUNT_XML",
                "PATIENT_VITALSTATUS_COUNT_XML",
                "PATIENT_RACE_COUNT_XML",
                "PATIENT_AGE_COUNT_XML"
            ];

            cell.model.query = {
                name: 'default query name',
                groups: []
            };

        }
    }
);




//================================================================================================== //
i2b2.events.initView.subscribe((function(eventTypeName, newMode) {
    debugger;
    console.error("not implemented");
}),'',i2b2.CRC.view.QT);

// ================================================================================================== //
i2b2.events.changedViewMode.subscribe((function(eventTypeName, newMode) {
    debugger;
    console.error("not implemented");
}),'', i2b2.CRC.view.QT);

// ================================================================================================== //
i2b2.events.changedZoomWindows.subscribe((function(eventTypeName, zoomMsg) {
    debugger;
    console.error("not implemented");
}),'',i2b2.CRC.view.QT);


console.timeEnd('execute time');
console.groupEnd();
