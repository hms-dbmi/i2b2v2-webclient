/**
 * @projectDescription	(GUI-only) Master Controller for CRC Query Tool's Value constraint dialog boxes.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.BASIC
 * @author		Marc-Danie Nazaire
 * @version 	
 * ----------------------------------------------------------------------------------------
 */

i2b2.CRC.view.NUMBER_EXAMPLE = {
	// ================================================================================================== //
	parseMetadataXml: function (valueMetadataXml) {
		let extractedModel = {
			name: "",
			valueType: "NUMBER_EXAMPLE",
			valueUnitsCurrent: 0,
			valueUnits: {},
			rangeInfo: {},
		};

		extractedModel.valueUnits = [];
		try {
			let dataType = i2b2.h.getXNodeVal(valueMetadataXml, "DataType");
			switch (dataType) {
				case "NUMBER_EXAMPLE":
					extractedModel.dataType = "NUMBER_EXAMPLE";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER;
					break;
				case "NUMBER_EXAMPLE_SUBTYPE":
					extractedModel.dataType = "NUMBER_EXAMPLE_SUBTYPE";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER;
					break;
				default:
					extractedModel.dataType = false;
			}
		}
		catch(e) {
			extractedModel.dataType = false;
		}

		extractedModel.name = "Select value of "+i2b2.h.getXNodeVal(valueMetadataXml, 'TestName')+" (Test: "+i2b2.h.getXNodeVal(valueMetadataXml, 'TestID')+")";

		//lab units
		let tProcessing = {};
		try {
			// save list of all possible units (from)
			let allUnits = i2b2.h.XPath(valueMetadataXml,"descendant::UnitValues/descendant::text()[parent::NormalUnits or parent::EqualUnits or parent::Units]");
			let allUnitsArr = [];
			for (let i=0; i<allUnits.length; i++) {
				if(allUnitsArr.indexOf(allUnits[i].nodeValue) === -1) allUnitsArr.push(allUnits[i].nodeValue);
			}
			allUnits = allUnitsArr;
			for (let i=0;i<allUnits.length;i++) {
				let d = {name: allUnits[i]};
				// does unit require conversion?
				try {
					d.multFactor = i2b2.h.XPath(valueMetadataXml,"descendant::UnitValues/descendant::ConvertingUnits[Units/text()='"+t[i]+"']/MultiplyingFactor/text()")[0].nodeValue;
				} catch(e) {
					d.multFactor = 1;
				}
				tProcessing[allUnits[i]]=  d;
			}
			// get our master unit (the first NormalUnits encountered that is not disabled)
			let normalUnits = i2b2.h.XPath(valueMetadataXml,"descendant::UnitValues/descendant::NormalUnits/text()");
			let normalUnitsArr = [];
			for (let i=0; i<normalUnits.length; i++) {
				if(normalUnitsArr.indexOf(normalUnits[i].nodeValue) === -1) {
					normalUnitsArr.push(normalUnits[i].nodeValue);
				}
			}
			normalUnits = normalUnitsArr;
			let masterUnit = false;
			for (let i=0;i<normalUnits.length;i++) {
				let d = tProcessing[normalUnits[i]];
				if (!d.excluded && d.multFactor === 1) {
					masterUnit = normalUnits[i];
					d.masterUnit = true;
					tProcessing[normalUnits[i]] = d;
					break;
				}
			}
			if (!masterUnit) {
				masterUnit = normalUnits[0];
				if (masterUnit) {
					let d = tProcessing[masterUnit];
					d.masterUnit = true;
					d.masterUnitViolation = true;
					tProcessing[masterUnit] =  d;
				}
			}
		} catch(e) {
			console.error("Problem was encountered when processing given Units", e);
		}

		extractedModel.valueUnits = tProcessing;

		return extractedModel;
	},
	// ================================================================================================== //
	reportHtml: function (sdxConcept) {
		// Populate it with the option HTML
		return "<div style='color: green'>Add custom basic report text for NUMBER EXAMPLE: " + sdxConcept.renderData.title + "</div>";
	},
	// ================================================================================================== //
	showDialog: function (sdxConcept, valueMetadata, queryPanelController, groupIdx, eventIdx) {

		if (valueMetadata !== undefined) {

			let labValuesModal = $("#labValuesModal");

			if (labValuesModal.length === 0) {
				$("body").append("<div id='labValuesModal'/>");
				labValuesModal = $("#labValuesModal");
			}

			labValuesModal.load('js-i2b2/cells/CRC/ModLabValues/CRC_view_NUMBER_EXAMPLE.html', function () {
				let newLabValues = {
					ValueType: null,
					ValueOperator: null,
					Value: null,
					ValueFlag: null,
					ValueLow: null,
					ValueHigh: null,
					ValueUnit: null,
				};

				// populate an empty LabValue entry to the callback function on cancel/close of modal
				$(labValuesModal).off("hidden.bs.modal"); // prevent multiple bindings
				$(labValuesModal).on("hidden.bs.modal", function () {
					if (pluginCallBack) {
						if (sdxConcept.LabValues === undefined) {
							pluginCallBack({...sdxConcept, "LabValues": {}});
						} else {
							pluginCallBack(sdxConcept);
						}
					}
				});

				$("#labValuesModal div").eq(0).modal("show");

				$("#labHeader").text(valueMetadata.name);
				$("#labHelpText").text("Searches by Lab values can be constrained by the values.");

				$("#labValuesModal .dropdown-menu li").click(function () {
					$("#labDropDown").text($(this).text());
				});

				// Save button handler
				$("body #labValuesModal button.lab-save").click(function () {
					// check for bad characters in number inputs
					let isValid = true;

					if (newLabValues.ValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER) {
						const func_validateType = function (value) {
							const val = String(value).trim();
							let validData = true;
							// make sure it is a number
							if (/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.exec(val) === null) {
								validData = false;
							}

							//input must be a positive integer
							if (String(parseInt(val)) !== val) validData = false;
							if (val < 0) validData = false;

							return validData;
						}

						const dataType = valueMetadata.dataType;
						if (newLabValues.ValueOperator === "BETWEEN") {
							// multi-value input
							if (!func_validateType(newLabValues.ValueLow)) {
								$("#labNumericValueRangeLow").addClass("error");
								isValid = false;
							} else {
								$("#labNumericValueRangeLow").removeClass("error");
							}
							if (!func_validateType(newLabValues.ValueHigh)) {
								$("#labNumericValueRangeHigh").addClass("error");
								isValid = false;
							} else {
								$("#labNumericValueRangeHigh").removeClass("error");
							}

						} else {
							// single value input
							if (!func_validateType(newLabValues.Value, dataType)) {
								$("#labNumericValue").addClass("error");
								isValid = false;
							} else {
								$("#labNumericValue").removeClass("error");
							}
						}
					}

					if (!isValid) return;

					$("#labValuesModal div").eq(0).modal("hide");

					if(newLabValues.ValueType == null) {
						newLabValues = {};
					}

					// clear out the range values if we have switch away from using "BETWEEN" filter
					if (newLabValues.ValueOperator !== "BETWEEN") {
						newLabValues.ValueLow = null;
						newLabValues.ValueHigh = null;
					}

					sdxConcept.LabValues = newLabValues;

					//Update the renderData object and redraw the concept in the query panel UI
					i2b2.CRC.view.NUMBER_EXAMPLE.updateDisplayValue(sdxConcept, valueMetadata, groupIdx, eventIdx);
					queryPanelController.redrawConcept(sdxConcept, groupIdx, eventIdx);
				});

				// UI event handler
				$("#labAnyValueType").click(function () {
					$(".labValueSection").addClass("hidden");
					$(".labGraphUnitSection").addClass("hidden");
					newLabValues.ValueType = null;
				});

				// UI event handler
				$("#labByValueType").click(function () {
				 	if (valueMetadata.valueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER) {
						$(".labGraphUnitSection").removeClass("hidden");
						$(".labValueSection").removeClass("hidden");
					} else {
						$(".labValueSection").removeClass("hidden");
					}
					newLabValues.ValueType = valueMetadata.valueType;
				});

				if (sdxConcept.LabValues && sdxConcept.LabValues.ValueType) {
					newLabValues.ValueType = sdxConcept.LabValues.ValueType;
					switch (newLabValues.ValueType) {
						case i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER:
							$("input[name='labType'][value='BY_VALUE']").trigger("click");
							break;
					}
				}

				switch (valueMetadata.dataType) {
					case "NUMBER_EXAMPLE_SUBTYPE":
					case "NUMBER_EXAMPLE":
						$("#labNumericValueOperatorMain").removeClass("hidden");
						$("#labNumericValueMain").removeClass("hidden");

						// display hints as to the data type expected to be entered
						let valueTypeString = "";
						valueTypeString += " positive integer";
						$("label span.dateTypeDesc").text(valueTypeString);

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

							newLabValues.ValueOperator = value;
						});
						let numericValueSelection = $("#labNumericValue");
						numericValueSelection.change(function () {
							newLabValues.Value = $(this).val();
						});

						let numericValueRangeLowSelection = $("#labNumericValueRangeLow");
						numericValueRangeLowSelection.change(function () {
							newLabValues.ValueLow = $(this).val();
						});

						let numericValueRangeHighSelection = $("#labNumericValueRangeHigh");
						numericValueRangeHighSelection.change(function () {
							newLabValues.ValueHigh = $(this).val();
						});

						if (sdxConcept.LabValues && sdxConcept.LabValues.ValueOperator) {
							numericValueOperatorSelection.val(sdxConcept.LabValues.ValueOperator).trigger("change");
							newLabValues.ValueOperator = sdxConcept.LabValues.ValueOperator;

							if (sdxConcept.LabValues.ValueOperator === "BETWEEN") {
								newLabValues.ValueLow = sdxConcept.LabValues.ValueLow;
								newLabValues.ValueHigh = sdxConcept.LabValues.ValueHigh;
								numericValueRangeLowSelection.val(sdxConcept.LabValues.ValueLow);
								numericValueRangeHighSelection.val(sdxConcept.LabValues.ValueHigh);
							} else {
								numericValueSelection.val(sdxConcept.LabValues.Value);
								newLabValues.Value = sdxConcept.LabValues.Value;
							}
						} else {
							$("input[name='labType'][value='BY_VALUE']").click();
						}

						numericValueOperatorSelection.trigger("change");


						if (valueMetadata.valueUnits.length !== 0) {
							let labUnits = $("#labUnits");

							let labUnitKeys = Object.keys(valueMetadata.valueUnits);
							for (let i = 0; i < labUnitKeys.length; i++) {
								let unitOption = $("<option></option>");
								unitOption.val(valueMetadata.valueUnits[labUnitKeys[i]].name);
								if (valueMetadata.valueUnits[labUnitKeys[i]].masterUnit) {
									labUnits.val(valueMetadata.valueUnits[labUnitKeys[i]].name);
									$("#labUnitsLabel").text(valueMetadata.valueUnits[labUnitKeys[i]].name);
								}
								unitOption.text(valueMetadata.valueUnits[labUnitKeys[i]].name);
								labUnits.append(unitOption);
							}

							labUnits.change(function () {
								// message if selected Unit is excluded from use
								let value = $(this).val();
								$("#labUnitsLabel").text(valueMetadata.valueUnits[value].name);
								if (valueMetadata.valueUnits[value].excluded) {
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

								newLabValues.ValueUnit = value;
							});
							if (sdxConcept.LabValues && sdxConcept.LabValues.ValueUnit) {
								labUnits.val(sdxConcept.LabValues.ValueUnit);
								labUnits.trigger("change");
								newLabValues.ValueUnit = sdxConcept.LabValues.ValueUnit;
							} else {
								labUnits.trigger("change");
							}
						}
						break;
					default:
						$("#labByValueTypeMain").hide();
						break
				}
			});
		}
	},
	// ================================================================================================== //
	updateDisplayValue: function (sdxConcept, valueMetadata) {
		let conceptDisplayText = "";
		if (sdxConcept.LabValues !== undefined) {
			if (sdxConcept.LabValues.ValueLow && sdxConcept.LabValues?.ValueHigh) {
				conceptDisplayText = sdxConcept.LabValues.ValueLow + " - " + sdxConcept.LabValues.ValueHigh;
			} else if (sdxConcept.LabValues.ValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER) {
				let numericOperatorMapping = {
					"LT": "<",
					"LE": "<=",
					"EQ": "=",
					"GT": ">",
					"GE": ">="
				}
				conceptDisplayText = numericOperatorMapping[sdxConcept.LabValues.ValueOperator] + " " + sdxConcept.LabValues.Value;
			}

			if (sdxConcept.LabValues.ValueUnit) {
				conceptDisplayText += " " + sdxConcept.LabValues.ValueUnit;
			}
		}
		if (conceptDisplayText.length > 0) {
			conceptDisplayText = " " + conceptDisplayText;
		}

		if (sdxConcept.origData.isModifier) {
			// modifier
			sdxConcept.renderData.title = sdxConcept.origData.conceptModified.renderData.title
				+ " {" + sdxConcept.origData.name + conceptDisplayText + "}";
		} else {
			// lab value
			sdxConcept.renderData.title = sdxConcept.origData.name + conceptDisplayText;
		}
	}
};
// ================================================================================================== //
i2b2.CRC.view.NUMBER_EXAMPLE_SUBTYPE = {
	getGeneralDataType: function () {
		return "NUMBER_EXAMPLE";
	}
};

