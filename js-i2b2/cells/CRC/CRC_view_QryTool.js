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
i2b2.CRC.view.QT.render = function() {
    // render HTML based on "i2b2.CRC.model.query" data

    $(i2b2.CRC.view.QT.containerDiv).html("");

    // first render the main query groups
    for (let qgnum = 0; qgnum < i2b2.CRC.model.query.groups.length; qgnum++) {
        let qgData = i2b2.CRC.model.query.groups[qgnum];
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
        $(i2b2.CRC.view.QT.template.qgcl(qgData.events[0])).appendTo(temp);
        // clear the first "or" in the term list
        $('.termOr:first', temp).text("");

        // populate the event2 concept list
        if (qgData.events.length > 1) {
            let temp = $('.Event2Container .TermList', newQG[0]);
            $(i2b2.CRC.view.QT.template.qgcl(qgData.events[1])).appendTo(temp);
            // clear the first "or" in the term list
            $('.termOr:first', temp).text("");
        }

        // TODO: Populate dates -> StartDate & DateRange1Start (synced existance)
        // TODO: Populate dates -> EndDate & DateRange1End (synced existance)
        // TODO: Populate dates -> DateRange2Start
        // TODO: Populate dates -> DateRange2End

        // TODO: Populate Instances number

        // attach the data picker functionality
        $('.DateStart', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateEnd', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange1Start', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange1End', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange2Start', newQG).datepicker({uiLibrary: 'bootstrap4'});
        $('.DateRange2End', newQG).datepicker({uiLibrary: 'bootstrap4'});
    }


    // attach the event listeners
    // -----------------------------------------
    // Top bar events (with / without / when)
    $('.QueryGroup .topbar .with', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // change the CSS styling
        let qgRoot = $(event.target).closest(".QueryGroup");
        qgRoot.removeClass(['without','when']);
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
        qgRoot.removeClass(['with','when']);
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
        qgRoot.removeClass(['without','with']);
        qgRoot.addClass("when");
        // modify the model
        let qgIndex = qgRoot.data("queryGroup");
        i2b2.CRC.model.query.groups[qgIndex].display = "when";
        i2b2.CRC.model.query.groups[qgIndex].with = false;
        i2b2.CRC.model.query.groups[qgIndex].without = false;
        i2b2.CRC.model.query.groups[qgIndex].when = true;
    });
    $('.QueryGroup .topbar .qgclose i', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        let qgRoot = $(event.target).closest(".QueryGroup");
        // modify the model
        let qgIndex = qgRoot.data("queryGroup");
        alert("Close query group #" + qgIndex);
    });



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
        let body = $('.DateOccursBody', $(event.target).closest(".Event1Container"));
        let icon = $(".DateOccursLbl i", event.target);
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
    $('.QueryGroup .DateRange1Lbl', i2b2.CRC.view.QT.containerDiv).on('click', (event) => {
        // parse (and if needed correct) the number value for days/months/years
        let body = $('.DateRange1Body', $(event.target).closest(".Event1Container"));
        let icon = $(".DateRange1Lbl i", event.target);
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
        let body = $('.DateRange2Body', $(event.target).closest(".Event2Container"));
        let icon = $(".DateRange2Lbl i", event.target);
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



    // append the final query group drop target / run button
    let newQG = $(i2b2.CRC.view.QT.template.qgrun({})).appendTo(i2b2.CRC.view.QT.containerDiv);


};









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
                    cell.view.QT.containerDiv = $('<div class="CRC_QT_view"></div>').appendTo(cell.view.QT.lm_view._contentElement);

                    // TODO: add rest of initialization code here
                    container.on('open', (a) => {
                        console.dir(this);
                        console.dir(a);
                    });

                    i2b2.CRC.view.QT.render();


                }).bind(this)
            );

            // Attach the stylesheets
            $('<link type="text/css" rel="stylesheet" href="js-i2b2/cells/CRC/assets/template_qg.css">').appendTo($("head")[0]);


            // load the templates (TODO: Refactor this to loop using a varname/filename list)
            cell.view.QT.template = {};
            // ... for query groups
            $.ajax("js-i2b2/cells/CRC/assets/template_qg.html", {
                success: (template) => {
                    cell.view.QT.template.qg = Handlebars.compile(template);
                },
                error: (error) => { console.error("Could not retreve template: template_qg.html"); }
            });
            // ... for query group concepts list
            $.ajax("js-i2b2/cells/CRC/assets/template_qgcl.html", {
                success: (template) => {
                    cell.view.QT.template.qgcl = Handlebars.compile(template);
                },
                error: (error) => { console.error("Could not retreve template: template_qgcl.html"); }
            });
            // ... for the final query group drop target / run button
            $.ajax("js-i2b2/cells/CRC/assets/template_qg_run.html", {
                success: (template) => {
                    cell.view.QT.template.qgrun = Handlebars.compile(template);
                },
                error: (error) => { console.error("Could not retreve template: template_qgrun.html"); }
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



            // THIS IS TEMP CODE FOR SETTING UP A QUERY FOR RENDERING
            cell.model.query = {
                groups: [
                    {
                        display: "with",
                        with: true,
                        without: false,
                        when: {},
                        events: [
                            {
                                dateRange: {
                                    start: "01/01/2020",
                                    end: "12/31/2020"
                                },
                                instances: 10,
                                concepts: [
                                    {
                                        "sdxInfo": {
                                            "sdxType": "CONCPT",
                                            "sdxKeyName": "key",
                                            "sdxControlCell": "ONT",
                                            "sdxKeyValue": "\\\\i2b2_DEMO\\i2b2\\Demographics\\Gender\\Female\\",
                                            "sdxDisplayName": "Female"
                                        },
                                        "origData": {
                                            "isModifier": false,
                                            "name": "Female",
                                            "hasChildren": "LA",
                                            "level": "3",
                                            "key": "\\\\i2b2_DEMO\\i2b2\\Demographics\\Gender\\Female\\",
                                            "tooltip": "Demographic \\ Gender \\ Female",
                                            "icd9": "",
                                            "table_name": "concept_dimension",
                                            "column_name": "concept_path",
                                            "operator": "LIKE",
                                            "total_num": "51",
                                            "synonym_cd": "N",
                                            "dim_code": "\\i2b2\\Demographics\\Gender\\Female\\",
                                            "basecode": "DEM|SEX:f"
                                        },
                                        "renderData": {
                                            "title": "Female",
                                            "iconImg": "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif",
                                            "iconImgExp": "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif",
                                            "cssClassMain": "sdxStyleONT-CONCPT",
                                            "cssClassMinor": "tvLeaf",
                                            "moreDescriptMain": "",
                                            "moreDescriptMinor": "Demographic \\ Gender \\ Female",
                                            "tvNodeState": {
                                                "loaded": true,
                                                "expanded": true,
                                                "checked": false,
                                                "disabled": false,
                                                "selected": false,
                                                "requested": false
                                            }
                                        }
                                    },
                                    {
                                        "sdxInfo": {
                                            "sdxType": "CONCPT",
                                            "sdxKeyName": "key",
                                            "sdxControlCell": "ONT",
                                            "sdxKeyValue": "\\\\i2b2_DEMO\\i2b2\\Demographics\\Gender\\Male\\",
                                            "sdxDisplayName": "Male"
                                        },
                                        "origData": {
                                            "isModifier": false,
                                            "name": "Male",
                                            "hasChildren": "LA",
                                            "level": "3",
                                            "key": "\\\\i2b2_DEMO\\2b2\\Demographics\\Gender\\Male\\",
                                            "tooltip": "Demographic \\ Gender \\ Male",
                                            "icd9": "",
                                            "table_name": "concept_dimension",
                                            "column_name": "concept_path",
                                            "operator": "LIKE",
                                            "total_num": "82",
                                            "synonym_cd": "N",
                                            "dim_code": "\\i2b2\\Demographics\\Gender\\Male\\",
                                            "basecode": "DEM|SEX:m"
                                        },
                                        "renderData": {
                                            "title": "Male",
                                            "iconImg": "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif",
                                            "iconImgExp": "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_leaf.gif",
                                            "cssClassMain": "sdxStyleONT-CONCPT",
                                            "cssClassMinor": "tvLeaf",
                                            "moreDescriptMain": "",
                                            "moreDescriptMinor": "Demographic \\ Gender \\ Male",
                                            "tvNodeState": {
                                                "loaded": true,
                                                "expanded": true,
                                                "checked": false,
                                                "disabled": false,
                                                "selected": false,
                                                "requested": false
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        display: "without",
                        with: false,
                        without: true,
                        when: {},
                        events: [
                            {
                                instances: 1,
                                concepts: [
                                    {
                                        "sdxInfo": {
                                            "sdxType": "CONCPT",
                                            "sdxKeyName": "key",
                                            "sdxControlCell": "ONT",
                                            "sdxKeyValue": "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\",
                                            "sdxDisplayName": "Asthma"
                                        },
                                        "origData": {
                                            "isModifier": false,
                                            "name": "Asthma",
                                            "hasChildren": "FA",
                                            "level": "4",
                                            "key": "\\\\i2b2_DIAG\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\",
                                            "tooltip": "Diagnoses \\ Respiratory system \\ Chronic obstructive diseases \\ Asthma",
                                            "icd9": "",
                                            "table_name": "concept_dimension",
                                            "column_name": "concept_path",
                                            "operator": "LIKE",
                                            "total_num": "133",
                                            "synonym_cd": "N",
                                            "dim_code": "\\i2b2\\Diagnoses\\Respiratory system (460-519)\\Chronic obstructive diseases (490-496)\\(493) Asthma\\",
                                            "basecode": "ICD9:493"
                                        },
                                        "renderData": {
                                            "title": "Asthma",
                                            "iconImg": "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch.gif",
                                            "iconImgExp": "js-i2b2/cells/ONT/assets/sdx_ONT_CONCPT_branch-exp.gif",
                                            "cssClassMain": "sdxStyleONT-CONCPT",
                                            "cssClassMinor": "tvBranch",
                                            "moreDescriptMain": "",
                                            "moreDescriptMinor": "Diagnoses \\ Respiratory system \\ Chronic obstructive diseases \\ Asthma",
                                            "tvNodeState": {
                                                "loaded": true,
                                                "checked": false,
                                                "disabled": false,
                                                "expanded": true,
                                                "selected": false,
                                                "requested": false
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        display: "when",
                        with: false,
                        without: false,
                        when: {
                            occurs: "atleast",
                            occursNum: "10",
                            occursUnit: "day",
                            firstany: "any"
                        },
                        events: [
                            {
                                concepts: [

                                ]
                            },
                            {
                                concepts: [

                                ]
                            }
                        ]
                    }
                ]
            };
        }
    }
);

/*
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

		var retMsg = {
			error: results.error,
			msgRequest: results.msgRequest,
			msgResponse: results.msgResponse,
			msgUrl: results.msgUrl,
			results: null
		};
		var retChildren = [];

		// extract records from XML msg
		var newHTML = "";
		var ps = results.refXML.getElementsByTagName('query_result_type');
		for(var i1=0; i1<ps.length; i1++) {
			var o = new Object;
			o.result_type_id = i2b2.h.getXNodeVal(ps[i1],'result_type_id');
			o.name = i2b2.h.getXNodeVal(ps[i1],'name');

			var checked = "";
			switch(o.name) {
				case "PATIENT_COUNT_XML":
				//	o.name = "PRS";
					checked = "checked=\"checked\"";
					break;
				//case "PATIENT_ENCOUNTER_SET":
				//	o.name = "ENS";
				//	checked = "checked=\"checked\"";
				//	break;
				//case "PATIENT_COUNT_XML":
				//	o.name = "PRC";
				//	checked = "checked=\"checked\"";
				//	break;
			}

			o.display_type = i2b2.h.getXNodeVal(ps[i1],'display_type');
			o.visual_attribute_type = i2b2.h.getXNodeVal(ps[i1],'visual_attribute_type');
			o.description = i2b2.h.getXNodeVal(ps[i1],'description');
			// need to process param columns
			//o. = i2b2.h.getXNodeVal(ps[i1],'');
			//this.model.events.push(o);
			if (o.visual_attribute_type == "LA") {
				newHTML += 	"			<div id=\"crcDlgResultOutput" + o.name + "\"><input type=\"checkbox\" class=\"chkQueryType\" name=\"queryType\" value=\"" + o.name + "\" " + checked + "/> " + o.description + "</div>";
			}
		}

		$('dialogQryRunResultType').innerHTML = newHTML;
	}

		i2b2.CRC.ajax.getQRY_getResultType("CRC:SDX:PatientRecordSet", null, scopedCallback);





			// register the query panels as valid DragDrop targets for Ontology Concepts (CONCPT) and query master (QM) objects
			var op_trgt = {dropTarget:true};
			i2b2.sdx.Master.AttachType('QPD1', 'CONCPT', op_trgt);
			i2b2.sdx.Master.AttachType('QPD2', 'CONCPT', op_trgt);
			i2b2.sdx.Master.AttachType('QPD3', 'CONCPT', op_trgt);
			i2b2.sdx.Master.AttachType('QPD1', 'ENS', op_trgt);
			i2b2.sdx.Master.AttachType('QPD2', 'ENS', op_trgt);
			i2b2.sdx.Master.AttachType('QPD3', 'ENS', op_trgt);
			i2b2.sdx.Master.AttachType('QPD1', 'PRS', op_trgt);
			i2b2.sdx.Master.AttachType('QPD2', 'PRS', op_trgt);
			i2b2.sdx.Master.AttachType('QPD3', 'PRS', op_trgt);
			i2b2.sdx.Master.AttachType('QPD1', 'QM', op_trgt);
			i2b2.sdx.Master.AttachType('QPD2', 'QM', op_trgt);
			i2b2.sdx.Master.AttachType('QPD3', 'QM', op_trgt);
			i2b2.sdx.Master.AttachType('queryName', 'QM', op_trgt);

			//======================= <Define Hover Handlers> =======================
			var funcHovOverQM = function(e, id, ddProxy) {
				var el = $(id);
				 // apply DragDrop targeting CCS
				var targets = YAHOO.util.DDM.getRelated(ddProxy, true);
				for (var i=0; i<targets.length; i++) {
					Element.addClassName(targets[i]._domRef,"ddQMTarget");
				}
			}
			var funcHovOutQM = function(e, id, ddProxy) {
				var el = $(id);
				 // apply DragDrop targeting CCS
				var targets = YAHOO.util.DDM.getRelated(ddProxy, true);
				for (var i=0; i<targets.length; i++) {
					Element.removeClassName(targets[i]._domRef,"ddQMTarget");
				}
			}
			var funcHovOverCONCPT = function(e, id, ddProxy) {
				var el = $(id);
				if (Object.isUndefined(el.linkbackPanelController)) { return false;}
				var panelController = el.linkbackPanelController;
				// see if the panel controller is enabled
				if (panelController.isActive == 'Y') {
					Element.addClassName(panelController.refDispContents,'ddCONCPTTarget');
				}
			}
			var funcHovOutCONCPT = function(e, id, ddProxy) {
				var el = $(id);
				if (Object.isUndefined(el.linkbackPanelController)) { return false;}
				var panelController = el.linkbackPanelController;
				// see if the panel controller is enabled
				if (panelController.isActive == 'Y') {
					Element.removeClassName(panelController.refDispContents,'ddCONCPTTarget');
				}
			}
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'QM', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'QM', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'QM', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('queryName', 'QM', 'onHoverOut', funcHovOutQM);
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'QM', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'QM', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'QM', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('queryName', 'QM', 'onHoverOver', funcHovOverQM);
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'CONCPT', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'CONCPT', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'CONCPT', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'CONCPT', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'CONCPT', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'CONCPT', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'ENS', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'ENS', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'ENS', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'ENS', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'ENS', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'ENS', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'PRS', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'PRS', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'PRS', 'onHoverOut', funcHovOutCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'PRS', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'PRS', 'onHoverOver', funcHovOverCONCPT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'PRS', 'onHoverOver', funcHovOverCONCPT);
			//======================= <Define Drop Handlers> =======================

			//======================= <Define Drop Handlers> =======================
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'CONCPT', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[0];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'CONCPT', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[1];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'CONCPT', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[2];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));

			i2b2.sdx.Master.setHandlerCustom('QPD1', 'ENS', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[0];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'ENS', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[1];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'ENS', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[2];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));

			i2b2.sdx.Master.setHandlerCustom('QPD1', 'PRS', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[0];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'PRS', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[1];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'PRS', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[2];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));

			i2b2.sdx.Master.setHandlerCustom('QPD1', 'QM', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[0];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'QM', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[1];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}));
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'QM', 'DropHandler', (function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				var t = i2b2.CRC.ctrlr.QT.panelControllers[2];
				if (t.isActive=="Y") { t.doDrop(sdxData); }
			}))


			var funcATN = function(yuiTree, yuiParentNode, sdxDataPack, callbackLoader) {
				var myobj = { html: sdxDataPack.renderData.html, nodeid: sdxDataPack.renderData.htmlID}
				// if the treenode we are appending to is the root node then do not show the [+] infront
				if (yuiTree.getRoot() == yuiParentNode) {
					var tmpNode = new YAHOO.widget.HTMLNode(myobj, yuiParentNode, false, false);
				} else {
					var tmpNode = new YAHOO.widget.HTMLNode(myobj, yuiParentNode, false, true);
				}
				if (sdxDataPack.renderData.iconType != 'CONCPT_item' && !Object.isUndefined(callbackLoader)) {
					// add the callback to load child nodes
					sdxDataPack.sdxInfo.sdxLoadChildren = callbackLoader;
				}
				tmpNode.data.i2b2_SDX= sdxDataPack;
				tmpNode.toggle = function() {
					if (!this.tree.locked && ( this.hasChildren(true) ) ) {
							var data = this.data.i2b2_SDX.renderData;
							var img = this.getContentEl();
							img = Element.select(img,'img')[0];
							if (this.expanded) {
								img.src = data.icon;
								this.collapse();
							} else {
								img.src = data.iconExp;
								this.expand();
							}
						}
				};
				if (sdxDataPack.renderData.iconType == 'CONCPT_leaf' || !sdxDataPack.renderData.canExpand) { tmpNode.dynamicLoadComplete = true; }
			}
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'CONCPT', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'CONCPT', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'CONCPT', 'AppendTreeNode', funcATN);

			i2b2.sdx.Master.setHandlerCustom('QPD1', 'ENS', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'ENS', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'ENS', 'AppendTreeNode', funcATN);

			i2b2.sdx.Master.setHandlerCustom('QPD1', 'PRS', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'PRS', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'PRS', 'AppendTreeNode', funcATN);

			var funcQMDH = function(sdxData) {
				sdxData = sdxData[0];	// only interested in first record
				// pass the QM ID to be loaded
				var qm_id = sdxData.sdxInfo.sdxKeyValue;
				i2b2.CRC.ctrlr.QT.doQueryLoad(qm_id)
			};
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'QM', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'QM', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'QM', 'AppendTreeNode', funcATN);
			i2b2.sdx.Master.setHandlerCustom('queryName', 'QM', 'DropHandler', funcQMDH);
			//======================= </Define Drop Handlers> =======================


			// ========= Override default LoadChildrenFromTreeview handler (we need this so that we can properly capture the XML request/response messages) =========
			var funcLCFT = function(node, onCompleteCallback) {
				var scopedCallback = new i2b2_scopedCallback();
				scopedCallback.scope = node.data.i2b2_SDX;
				scopedCallback.callback = function(results) {
					var cl_node = node;
					var cl_onCompleteCB = onCompleteCallback;
					var cl_options = options;
					// THIS function is used to process the AJAX results of the getChild call
					//		results data object contains the following attributes:
					//			refXML: xmlDomObject <--- for data processing
					//			msgRequest: xml (string)
					//			msgResponse: xml (string)
					//			error: boolean
					//			errorStatus: string [only with error=true]
					//			errorMsg: string [only with error=true]

					// clear the drop-lock so the node can be requeried if anything bad happens below
					node.data.i2b2_dropLock = false;


					// handle any errors
					if (results.error) {
						// process the specific error
						var errorCode = results.refXML.getElementsByTagName('status')[0].firstChild.nodeValue;
						if (errorCode == "MAX_EXCEEDED") {
							var eaction = confirm("The number of children in this node exceeds the maximum number you specified in options.\n Displaying all children may take a long time to do.");
						}
						else {
							alert("The following error has occurred:\n" + errorCode);
						}
						// re-fire the call with no max limit if the user requested so
						if (eaction) {
							var mod_options = Object.clone(cl_options);
							delete mod_options.ont_max_records;
							i2b2.ONT.ajax.GetChildConcepts("CRC:QueryTool", mod_options, scopedCallback);
							return true;
						}
						// ROLLBACK the tree changes
						cl_onCompleteCB();
						// reset dynamic load state for the node (total hack of YUI Treeview)
						node.collapse();
						node.dynamicLoadComplete = false;
						node.expanded = false;
						node.childrenRendered = false;
						node._dynLoad = true;
						// uber-elite code (fix the style settings)
						var tc = node.getToggleEl().className;
						tc = tc.substring(0, tc.length - 1) + 'p';
						node.getToggleEl().className = tc;
						// fix the icon image
						var img = node.getContentEl();
						img = Element.select(img, 'img')[0];
						img.src = node.data.i2b2_SDX.sdxInfo.icon;
						return false;
					}

					var c = results.refXML.getElementsByTagName('concept');
					for(var i=0; i<1*c.length; i++) {
						var o = new Object;
						o.xmlOrig = c[i];
						o.name = i2b2.h.getXNodeVal(c[i],'name');
						o.hasChildren = i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,2);
						o.level = i2b2.h.getXNodeVal(c[i],'level');
						o.key = i2b2.h.getXNodeVal(c[i],'key');
						o.tooltip = i2b2.h.getXNodeVal(c[i],'tooltip');
						o.icd9 = '';
						o.table_name = i2b2.h.getXNodeVal(c[i],'tablename');
						o.column_name = i2b2.h.getXNodeVal(c[i],'columnname');
						o.operator = i2b2.h.getXNodeVal(c[i],'operator');
						o.dim_code = i2b2.h.getXNodeVal(c[i],'dimcode');
						// append the data node
						var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',o);
						var renderOptions = {
							title: o.name,
							dblclick: "i2b2.ONT.view.nav.ToggleNode(this,'"+cl_node.tree.id+"')",
							icon: {
								root: "sdx_ONT_CONCPT_root.gif",
								rootExp: "sdx_ONT_CONCPT_root-exp.gif",
								branch: "sdx_ONT_CONCPT_branch.gif",
								branchExp: "sdx_ONT_CONCPT_branch-exp.gif",
								leaf: "sdx_ONT_CONCPT_leaf.gif"
							}
						};
						var sdxRenderData = i2b2.sdx.Master.RenderHTML(cl_node.tree.id, sdxDataNode, renderOptions);
						i2b2.sdx.Master.AppendTreeNode(cl_node.tree, cl_node, sdxRenderData);
					}
					// handle the YUI treeview
					cl_onCompleteCB();
				}

				// fix double loading error via node level dropping-lock
				if (node.data.i2b2_dropLock) { return true; }
				node.data.i2b2_dropLock = true;

				var options = {};
				options.ont_max_records = "max='" +i2b2.CRC.cfg.params.maxChildren + "'";
				options.result_wait_time= i2b2.CRC.cfg.params.queryTimeout;
				options.ont_synonym_records = i2b2.ONT.cfg.params.synonyms;
				options.ont_hidden_records = i2b2.ONT.cfg.params.hiddens;
				// parent key
				options.concept_key_value = node.data.i2b2_SDX.sdxInfo.sdxKeyValue;
				options.version = i2b2.ClientVersion;
				i2b2.ONT.ajax.GetChildConcepts("CRC:QueryTool", options, scopedCallback);
			}
			i2b2.sdx.Master.setHandlerCustom('QPD1', 'CONCPT', 'LoadChildrenFromTreeview', funcLCFT);
			i2b2.sdx.Master.setHandlerCustom('QPD2', 'CONCPT', 'LoadChildrenFromTreeview', funcLCFT);
			i2b2.sdx.Master.setHandlerCustom('QPD3', 'CONCPT', 'LoadChildrenFromTreeview', funcLCFT);
			// ========= END Override default LoadChildrenFromTreeview handler (we need this so that we can properly capture the XML request/response messages)  END =========



			//======================= <Initialization> =======================
			// Connect the panel controllers to the DOM nodes in the document
			var t = i2b2.CRC.ctrlr.QT;

			queryTimingButton =  new YAHOO.widget.Button("queryTiming",
					{ lazyLoad: "false", type: "menu", menu: "menubutton1select", name:"querytiming" });

		defineTemporalButton = new YAHOO.widget.Button( "defineTemporal",
					{ lazyloadmenu: false, type: "menu", menu: "menubutton2select", name:"definetemporal" });


			var addDefineGroup = new YAHOO.widget.Button("addDefineGroup");
				addDefineGroup.on("click", function (event) {
					i2b2.CRC.view.QT.addNewTemporalGroup();

						});

			var removeDefineGroup = new YAHOO.widget.Button("removeDefineGroup");
				removeDefineGroup.on("click", function (event) {
					i2b2.CRC.view.QT.deleteLastTemporalGroup();

						});


			queryTimingButton.on("mousedown", function (event) {
				//i2b2.CRC.ctrlr.QT.panelControllers[0].doTiming(p_oItem.value);
				if ((i2b2.CRC.ctrlr.QT.hasModifier) && (queryTimingButton.getMenu().getItems().length == 3))  {
					queryTimingButton.getMenu().addItems([
										{ text: "Items Instance will be the same", value: "SAMEINSTANCENUM" }]);
					queryTimingButton.getMenu().render();
				}
			});



			defineTemporalButton.on("selectedMenuItemChange", function (event) {
				//i2b2.CRC.ctrlr.QT.panelControllers[0].doTiming(p_oItem.value);
				var oMenuItem = event.newValue;

				var sText = oMenuItem.value;
							defineTemporalButton.set("label",oMenuItem.cfg.getProperty("text"));

				if (sText != "BUILDER")
				{
					$('crc.temoralBuilder').hide();

					$('crc.innerQueryPanel').show();
					i2b2.CRC.ctrlr.QT.temporalGroup = sText;
					i2b2.CRC.ctrlr.QT._redrawAllPanels();


					if (sText == "0")
					{
						$('QPD1').style.background = '#FFFFFF';
						$('queryPanelTitle1').innerHTML = 'Group 1';
						i2b2.CRC.ctrlr.QT.panelControllers[0].refTiming.set('disabled', false);
					} else {
						$('QPD1').style.background = '#D9ECF0';
						$('queryPanelTitle1').innerHTML = 'Anchoring Observation';
						i2b2.CRC.ctrlr.QT.panelControllers[0].doTiming("SAMEINSTANCENUM");
					    i2b2.CRC.ctrlr.QT.panelControllers[0].refTiming.set('disabled', true);
						i2b2.CRC.ctrlr.QT.panelControllers[0].refTiming.set("label", "Items Instance will be the same");



					}
				} else {
					$('crc.innerQueryPanel').hide();
					$('crc.temoralBuilder').show();
	//				queryTimingButton.set("label", "Temporal Contraint Builder");
				}
				i2b2.CRC.view.QT.ResizeHeight();
						});

			queryTimingButton.on("selectedMenuItemChange", function (event) {
				//i2b2.CRC.ctrlr.QT.panelControllers[0].doTiming(p_oItem.value);
				var oMenuItem = event.newValue;

					if (oMenuItem == 0)
				{
					var sValue = "ANY";
					var sText = "Treat all groups independently";
				} else if (oMenuItem == 1)
				{
					var sValue = "SAME";
					var sText = "Selected groups occur in the same financial encounter";
				} else {
					var sValue = oMenuItem.value;
					var sText = oMenuItem.cfg.getProperty("text");
				}

				if (sValue != "TEMPORAL") {
					var dm = i2b2.CRC.model.queryCurrent;
					for (var k=0; k<dm.panels[i2b2.CRC.ctrlr.QT.temporalGroup].length; k++) {
						dm.panels[i2b2.CRC.ctrlr.QT.temporalGroup][k].timing = sValue;
					}
				}

				//var sText = oMenuItem.cfg.getProperty("text");

				var length = i2b2.CRC.ctrlr.QT.panelControllers.length;

				queryTimingButton.set("label", sText);

				if (sValue != "TEMPORAL") {
					$('QPD1').style.background = '#FFFFFF';
					$('defineTemporalBar').hide();
					$('crc.temoralBuilder').hide();
					$('crc.innerQueryPanel').show();
				}
				if (sValue == "SAMEVISIT") {
					i2b2.CRC.ctrlr.QT.queryTiming = "SAMEVISIT";
					for (var i=0; i<length; i++) {
						//$("queryPanelTimingB" + (i+1) +  "-button").disabled = false;
						//$("queryPanelTimingB" + (i+1) +  "-button").innerHTML = "Occurs in Same Encounter";
						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set('disabled', false);
						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set("label",  "Occurs in Same Encounter");
						if (YAHOO.util.Dom.inDocument(i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().element)) {

							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().clearContent();
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Treat Independently", value: "ANY"}]);
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Occurs in Same Encounter", value: "SAMEVISIT" }]);
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Items Instance will be the same", value: "SAMEINSTANCENUM" }]);
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().render();
						} else {
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.itemData ={ text: "Treat Independently", value: "ANY",
												text: "Occurs in Same Encounter", value: "SAMEVISIT",
											    text: "Items Instance will be the same", value: "SAMEINSTANCENUM"  };
						}
								i2b2.CRC.ctrlr.QT.panelControllers[i].doTiming(sValue);
					}

				} else if (sValue == "ANY") {
					i2b2.CRC.ctrlr.QT.queryTiming = "ANY";

					i2b2.CRC.ctrlr.QT.temporalGroup = 0;
					i2b2.CRC.ctrlr.QT._redrawAllPanels();

					for (var i=0; i<length; i++) {
						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set("label", "Treat Independently");
						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set('disabled', true);
						i2b2.CRC.ctrlr.QT.panelControllers[i].doTiming(sValue);
					}
				} else if (sValue == "ENCOUNTER") {
					i2b2.CRC.ctrlr.QT.queryTiming = "ENCOUNTER";
					for (var i=0; i<length; i++) {
						//$("queryPanelTimingB" + (i+1) +  "-button").disabled = false;
						//$("queryPanelTimingB" + (i+1) +  "-button").innerHTML = "Occurs in Same Encounter";
						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set('disabled', false);
						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set("label",  "Treat Independently");
						if (YAHOO.util.Dom.inDocument(i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().element)) {

							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().clearContent();
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Treat Independently", value: "ANY"}]);
							for (var j=0; j<length; j++) {
								i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Occurs (" + (j+1) + ")", value: "OCCUR"+j }]);
							}
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().render();
						} else {
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.itemData ={ text: "Treat Independently", value: "ANY",
												text: "Occurs", value: "OCCUR0" };
						}
						i2b2.CRC.ctrlr.QT.panelControllers[i].doTiming(sValue);
					}
				} else if  (sValue == "TEMPORAL") {
					i2b2.CRC.ctrlr.QT.queryTiming = "TEMPORAL";
					$('defineTemporalBar').show();
					for (var i=0; i<length; i++) {

						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set('disabled', false);
						//i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set("label", "Items Instance will be the same");

					}
					//$('QPD1').style.background = '#D9ECF0';
					//$('queryPanelTitle1').innerHTML = 'Anchoring Observation';

				} else {
					i2b2.CRC.ctrlr.QT.queryTiming = "SAMEINSTANCENUM";
					for (var i=0; i<length; i++) {

						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set('disabled', false);
						i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.set("label", sText);

						if (YAHOO.util.Dom.inDocument(i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().element)) {

							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().clearContent();
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Treat Independently", value: "ANY"}]);
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Occurs in Same Encounter", value: "SAMEVISIT" }]);
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().addItems([
												{ text: "Items Instance will be the same", value: "SAMEINSTANCENUM" }]);
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.getMenu().render();
						} else {
							i2b2.CRC.ctrlr.QT.panelControllers[i].refTiming.itemData =[{ text: "Treat Independently", value: "ANY"},
												{ text: "Occurs in Same Encounter", value: "SAMEVISIT"} ,
											    { text: "Items Instance will be the same", value: "SAMEINSTANCENUM"  }];
						}


						i2b2.CRC.ctrlr.QT.panelControllers[i].doTiming(sValue);
					}

				}
				i2b2.CRC.view.QT.ResizeHeight();

			});

			//var qryButtonTiming = {};
			for (var i=0; i<3; i++) {

				var onSelectedMenuItemChange = function (event) {
			    	var oMenuItem = event.newValue;

	    			this.set("label", ("<em class=\"yui-button-label\">" +
	        	        oMenuItem.cfg.getProperty("text") + "</em>"));

	 				if (event.newvalue != event.prevValue) {
						var panelNumber = this.toString();
						panelNumber = panelNumber.substring( panelNumber.length-1, panelNumber.length-0);
				 			i2b2.CRC.ctrlr.QT.panelControllers[panelNumber-1].doTiming(oMenuItem.value);
					}
					if (oMenuItem.value.substring(0,5) == "OCCUR") {
						this.setStyle('width', 130);
						$("qryButtonLimitB1").show();
						//$('qryPanelTiming Button').style.width = 120;
					} else {
						this.setStyle('width', 160);
						$("qryButtonLimitB1").hide();
						//$('qryPanelTiming Button').style.width = 160;
						//$(this._button.id).clientWidth = 160;
					}
				};

				//var panelControl = t.panelControllers[i];

				t.panelControllers[i].ctrlIndex = i;
				t.panelControllers[i].refTitle = $("queryPanelTitle"+(i+1));
				t.panelControllers[i].refButtonExclude = $("queryPanelExcludeB"+(i+1));
				t.panelControllers[i].refButtonDates = $("queryPanelDatesB"+(i+1));
				t.panelControllers[i].refButtonOccurs = $("queryPanelOccursB"+(i+1));
				t.panelControllers[i].refButtonOccursNum = $("QP"+(i+1)+"Occurs");
				t.panelControllers[i].refBalloon = $("queryBalloon"+(i+1));
				t.panelControllers[i].refDispContents = $("QPD"+(i+1));


				//t.panelControllers[i].refTiming = $("queryPanelTimingB"+(i+1));
				//t.panelControllers[i].refTiming = $("queryPanelTimingB"+(i+1));
				var qryButtonTiming =  new YAHOO.widget.Button("queryPanelTimingB"+(i+1),
							{ type: "menu", menu: "menubutton1select", name:"querytiming" });
				//qryButtonTiming.set('disabled', true);
				 qryButtonTiming.on("selectedMenuItemChange", onSelectedMenuItemChange);
				 qryButtonTiming.setStyle('width', 160);

				t.panelControllers[i].refTiming = qryButtonTiming;
				t.panelControllers[i].refTiming.set('disabled', true);

				// create a instance of YUI Treeview
				if (!t.panelControllers[i].yuiTree) {
					t.panelControllers[i].yuiTree = new YAHOO.widget.TreeView("QPD"+(i+1));
					t.panelControllers[i].yuiTree.setDynamicLoad(t.panelControllers[i]._loadTreeDataForNode,1);
					// forward reference from DOM Node to tree obj
					$("QPD"+(i+1)).tree = t.panelControllers[i].yuiTree;
					// linkback on the treeview to allow it to find its PanelController
					t.panelControllers[i].refDispContents.linkbackPanelController = t.panelControllers[i];
				}
			}
			// display the panels
			t.doScrollFirst();
			t._redrawPanelCount();
			i2b2.CRC.ctrlr.QT.doShowFrom(0);
			i2b2.CRC.ctrlr.history.Refresh();
			//======================= </Initialization> =======================


			 function qryPanelTimingClick(p_sType, p_aArgs) {

					var oEvent = p_aArgs[0],	//	DOM event

				oMenuItem = p_aArgs[1];	//	MenuItem instance that was the
										//	target of the event

			if (oMenuItem) {
				YAHOO.log("[MenuItem Properties] text: " +
							oMenuItem.cfg.getProperty("text") + ", value: " +
							oMenuItem.value);
			}

			qryButtonTiming.set("label", qryButtonTiming.getMenu().activeItem.srcElement.text );


	//		i2b2.CRC.ctrlr.QT.panelControllers[0].doTiming(p_oItem.value);
	//		var sText = p_oItem.cfg.getProperty("text");
    //		oMenuPanelTiming1.set("label", sText);

		}


			// attach the context controller to all panel controllers objects
			var op = i2b2.CRC.view.QT; // object path
			i2b2.CRC.view.QT.ContextMenu = new YAHOO.widget.ContextMenu(
					"divContextMenu-QT",
					{ lazyload: true,
					trigger: [$('QPD1'), $('QPD2'), $('QPD3')],
					itemdata: [
						{ text: "Delete", 		onclick: { fn: op.ContextMenuRouter, obj: 'delete' } },
						{ text: "Lab Values", 	onclick: { fn: op.ContextMenuRouter, obj: 'labvalues' } }
					] }
			);

			i2b2.CRC.view.QT.ContextMenu.subscribe("triggerContextMenu", i2b2.CRC.view.QT.ContextMenuPreprocess);
			i2b2.CRC.view.QT.ContextMenu.subscribe("beforeShow", i2b2.CRC.view.QT.ContextMenuPreprocess);

			i2b2.CRC.view.QT.splitterDragged();					// initialize query tool's elements
// ================================================================================================== //
		}
	})
 );
*/



//================================================================================================== //
i2b2.events.initView.subscribe((function(eventTypeName, newMode) {
// -------------------------------------------------------
    debugger;
    console.error("not implemented");

	// initialize the dropdown menu for query timing
	var temporalConstraintBar 	= $("temporalConstraintBar");
	var temporalConstraintLabel = $("temporalConstraintLabel");
	var queryTimingButton		= $("queryTiming-button");
	temporalConstraintDiv.style.width 	= Math.max( parseInt(temporalConstraintBar.style.width) - parseInt(temporalConstraintLabel.style.width)-2, 0) + "px";
	queryTimingButton.style.width 		= Math.max( parseInt(temporalConstraintBar.style.width) - parseInt(temporalConstraintLabel.style.width)-6, 0) + "px";

	// -------------------------------------------------------
}),'',i2b2.CRC.view.QT);


// ================================================================================================== //
i2b2.events.changedViewMode.subscribe((function(eventTypeName, newMode) {
// -------------------------------------------------------
	debugger;
	console.error("not implemented");
// -------------------------------------------------------
}),'', i2b2.CRC.view.QT);


// ================================================================================================== //
i2b2.events.changedZoomWindows.subscribe((function(eventTypeName, zoomMsg) {
    debugger;
    console.error("not implemented");
}),'',i2b2.CRC.view.QT);


console.timeEnd('execute time');
console.groupEnd();
