/**
 * @projectDescription	(GUI-only) Master Controller for CRC Query Tool's Value constraint dialog boxes.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.BASIC
 * @author		Marc-Danie Nazaire
 * @version 	
 * ----------------------------------------------------------------------------------------
 */

i2b2.CRC.view.BASIC = {
	// ================================================================================================== //
	reportHtml: function (sdxConcept) {
		// Populate it with the option HTML
		return "<div style='color: green'>Add custom basic report text for: " + sdxConcept.renderData.title + "</div>";
	},
	// ================================================================================================== //
	showDialog: function (sdxConcept, valueMetadataXml, queryPanelController, isModifier, groupIdx, eventIdx) {
		if (valueMetadataXml) {
			let extractedLabValues = i2b2.CRC.ctrlr.labValues.parseLabValues(valueMetadataXml);

			if (extractedLabValues !== undefined) {

				let labValuesModal = $("#labValuesModal");

				if (labValuesModal.length === 0) {
					$("body").append("<div id='labValuesModal'/>");
					labValuesModal = $("#labValuesModal");
				}

				labValuesModal.load('js-i2b2/cells/CRC/ModLabValues/CRC_view_BASIC.html', function () {
					let newLabValues = {
						ValueType: null,
						ValueOperator: null,
						Value: null,
						ValueFlag: null,
						ValueLow: null,
						ValueHigh: null,
						ValueUnit: null,
						isEnum: false,
						isString: false
					};

					$("#labValuesModal div").eq(0).modal("show");

					$("#labValuesModal .dropdown-menu li").click(function () {
						$("#labDropDown").text($(this).text());
					});

					/*$("body #labValuesModal button.lab-cancel").click(function () {
						//I2B2UI-639-Edit Lab value icon not displayed if user clicks cancel on initial display of Lab Values modal
						i2b2.CRC.ctrlr.labValues.redrawConcept(sdxConcept, groupIdx, eventIdx);
					});*/

					// Save button handler
					$("body #labValuesModal button.lab-save").click(function () {
						// check for bad characters in number inputs
						let isValid = true;

						if (newLabValues.ValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER) {
							const func_validateType = function (value, dataType) {
								const val = String(value).trim();
								let validData = true;
								// make sure it is a number
								if (/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.exec(val) === null) {
									validData = false;
								}
								if (["POSFLOAT", "FLOAT"].includes(dataType)) {
									if (String(parseFloat(val)) !== val) validData = false;
								}
								if (["POSINT", "INT"].includes(dataType)) {
									if (String(parseInt(val)) !== val) validData = false;
								}
								if (["POSINT", "POSFLOAT"].includes(dataType)) {
									if (val < 0) validData = false;
								}
								return validData;
							}

							const dataType = extractedLabValues.dataType;
							if (newLabValues.ValueOperator === "BETWEEN") {
								// multi-value input
								if (!func_validateType(newLabValues.ValueLow, dataType)) {
									$("#labNumericValueRangeLow").addClass("error");
									isValid = false;
								} else {
									$("#labNumericValueRangeLow").removeClass("error");
								}
								if (!func_validateType(newLabValues.ValueHigh, dataType)) {
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

						if (newLabValues.isEnum && newLabValues.Value && newLabValues.Value.length === 0) {
							$("#labEnumValue").addClass("error");
							isValid = false;
						}

						if (!isValid) return;

						$("#labValuesModal div").eq(0).modal("hide");
						switch (newLabValues.ValueType) {
							case i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.FLAG:
								newLabValues.ValueLow = null;
								newLabValues.ValueHigh = null;
								newLabValues.ValueUnit = null;
								newLabValues.Value = null;
								newLabValues.isEnum = false;
								break;
							case null:
								newLabValues = {};
								break;
							default:
								newLabValues.ValueFlag = null;
								break;
						}

						// clear out the range values if we have switch away from using "BETWEEN" filter
						if (newLabValues.ValueOperator !== "BETWEEN") {
							newLabValues.ValueLow = null;
							newLabValues.ValueHigh = null;
						}

						sdxConcept.LabValues = newLabValues;

						i2b2.CRC.ctrlr.labValues.updateDisplayValue(sdxConcept, extractedLabValues, groupIdx, eventIdx);
					});

					// UI event handler
					$("#labAnyValueType").click(function () {
						$(".labValueSection").addClass("hidden");
						$(".labGraphUnitSection").addClass("hidden");
						$("#labEnumValueMain").addClass("hidden");
						$("#labFlag").addClass("hidden");
						newLabValues.ValueType = null;
					});

					// UI event handler
					$("#labFlagType").click(function () {
						$(".labValueSection").addClass("hidden");
						$(".labGraphUnitSection").addClass("hidden");
						$("#labEnumValueMain").addClass("hidden");
						$("#labFlag").removeClass("hidden");
						newLabValues.ValueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.FLAG;
						newLabValues.ValueOperator = 'EQ';
					});

					// UI event handler
					$("#labByValueType").click(function () {
						$("#labFlag").addClass("hidden");
						if (extractedLabValues.dataType === 'ENUM') {
							$("#labEnumValueMain").removeClass("hidden");
						} else if (extractedLabValues.valueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER) {
							$(".labGraphUnitSection").removeClass("hidden");
							$(".labValueSection").removeClass("hidden");
						} else {
							$(".labValueSection").removeClass("hidden");
						}
						newLabValues.ValueType = extractedLabValues.valueType;
					});

					if (sdxConcept.LabValues && sdxConcept.LabValues.ValueType) {
						newLabValues.ValueType = sdxConcept.LabValues.ValueType;
						switch (newLabValues.ValueType) {
							case i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.FLAG:
								$("input[name='labType'][value='BY_FLAG']").trigger("click");
								break;
							case i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER:
							case i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.LARGETEXT:
							case i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT:
							case i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.MODIFIER:
								$("input[name='labType'][value='BY_VALUE']").trigger("click");
								break;
						}
					}

					$("#labHeader").text(extractedLabValues.name);

					// configure the UI display based on type
					if (extractedLabValues.flagType) {
						let labFlagValueSelection = $("#labFlagValue");
						for (let i = 0; i < extractedLabValues.flags.length; i++) {
							let flagOption = $("<option></option>");
							flagOption.text(extractedLabValues.flags[i].name);
							flagOption.val(extractedLabValues.flags[i].value);
							labFlagValueSelection.append(flagOption);
						}
						labFlagValueSelection.change(function () {
							newLabValues.ValueFlag = $(this).val();
						});

						if (sdxConcept.LabValues && sdxConcept.LabValues.ValueFlag) {
							labFlagValueSelection.val(sdxConcept.LabValues.ValueFlag);
							newLabValues.ValueFlag = sdxConcept.LabValues.ValueFlag;
							newLabValues.ValueOperator = sdxConcept.LabValues.ValueOperator;
						}

						labFlagValueSelection.trigger("change");
					} else {
						$("#labFlagTypeMain").hide();
					}

					switch (extractedLabValues.dataType) {
						case "POSFLOAT":
						case "POSINT":
						case "FLOAT":
						case "INT":
							$("#labNumericValueOperatorMain").removeClass("hidden");
							$("#labNumericValueMain").removeClass("hidden");

							// display hints as to the data type expected to be entered
							let valueTypeString = "";
							if (["POSFLOAT", "POSINT"].includes(extractedLabValues.dataType)) valueTypeString += " positive ";
							if (["INT", "POSINT"].includes(extractedLabValues.dataType)) valueTypeString += " integer ";
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

							//Bar segment
							try {
								if (extractedLabValues.rangeInfo.total !== 0) {
									let normalLowRange;
									let normalHighRange;

									$("#barNormMain").removeClass("hidden").click(function () {
										$("#labNumericValueOperator").val("BETWEEN").trigger("change");
										if (normalLowRange !== undefined) {
											$("#labNumericValueRangeLow").val(normalLowRange).trigger("change");
										}
										if (normalHighRange !== undefined) {
											$("#labNumericValueRangeHigh").val(normalHighRange).trigger("change");
										}
									});
									if (isFinite(extractedLabValues.rangeInfo.LowOfToxic)) {
										$("#lblToxL").text(extractedLabValues.rangeInfo.LowOfToxic);
										$("#barToxL").click(function () {
											let value = $("#lblToxL").text();
											$("#labNumericValueOperator").val("LE");
											$("#labNumericValue").val(value);
										});
										$("#barToxLMain").removeClass("hidden");
										normalLowRange = extractedLabValues.rangeInfo.LowOfToxic;
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
										normalLowRange = extractedLabValues.rangeInfo.LowOfLow;

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
										normalLowRange = extractedLabValues.rangeInfo.HighOfLow;
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
										normalHighRange = extractedLabValues.rangeInfo.LowOfHigh;
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
										if (normalHighRange === undefined) {
											normalHighRange = extractedLabValues.rangeInfo.HighOfHigh;
										}

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
										if (normalHighRange === undefined) {
											normalHighRange = extractedLabValues.rangeInfo.HighOfToxic;
										}
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
								newLabValues.ValueOperator = value;
							});

							stringValueSelection.change(function () {
								newLabValues.Value = $(this).val();
							});

							if (sdxConcept.LabValues) {
								if (sdxConcept.LabValues.ValueOperator === "CONTAINS[database]") {
									largeStringValueOperatorSelection.trigger("click");
								}

								if (sdxConcept.LabValues.Value) {
									stringValueSelection.val(sdxConcept.LabValues.Value).trigger("change");
								}
							}

							if (!(sdxConcept.LabValues && sdxConcept.LabValues.Value)) {
								$("input[name='labType'][value='BY_VALUE']").click();
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
								newLabValues.ValueOperator = $(this).val();
							});

							stringSelection.change(function () {
								newLabValues.Value = $(this).val();
							});

							if (sdxConcept.LabValues && sdxConcept.LabValues.ValueOperator) {
								stringValueOperatorSelection.val(sdxConcept.LabValues.ValueOperator);
								if (sdxConcept.LabValues.Value) {
									stringSelection.val(sdxConcept.LabValues.Value).trigger("change");
								}
							} else {
								$("input[name='labType'][value='BY_VALUE']").click();
							}
							stringValueOperatorSelection.trigger("change");
							newLabValues.isString = true;
							break;
						case "ENUM":
							if (Object.keys(extractedLabValues.enumInfo).length > 0) {

								let labEnumValueSelection = $("#labEnumValue");
								let extractedLabValueEntries = Object.entries(extractedLabValues.enumInfo);
								extractedLabValueEntries.forEach(([key, value]) => {
									let enumOption = $("<option></option");
									enumOption.text(value);
									enumOption.val(key);
									labEnumValueSelection.append(enumOption);
								});

								labEnumValueSelection.val(extractedLabValueEntries[0][0]);

								labEnumValueSelection.change(function () {
									newLabValues.Value = $(this).val();
									newLabValues.ValueOperator = "IN";
								});

								//scroll to selected enum value in list
								const ro = new ResizeObserver(() => {
									if (labEnumValueSelection.is(':visible')) {
										let selectedOption = labEnumValueSelection.find(":selected");
										if (selectedOption.offset() !== undefined) {
											let optionTop = selectedOption.offset().top;
											let selectTop = labEnumValueSelection.offset().top;
											labEnumValueSelection.scrollTop(labEnumValueSelection.scrollTop() + (optionTop - selectTop));
										}
									}
								});
								ro.observe(labEnumValueSelection[0]);

								if (sdxConcept.LabValues && sdxConcept.LabValues.Value) {
									labEnumValueSelection.val(sdxConcept.LabValues.Value);
								} else {
									$("input[name='labType'][value='BY_VALUE']").click();
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
				});
			}
		}
	},
	displayValue: function (sdxConcept, valueMetadataXml) {

	}
};

