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
	showDialog: function (sdxConcept, valueMetadata, queryPanelController, isModifier, groupIdx, eventIdx) {
		if (valueMetadata) {
			let extractedLabValues = valueMetadata;

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

						i2b2.CRC.view.BASIC.updateDisplayValue(sdxConcept, extractedLabValues, groupIdx, eventIdx);
						queryPanelController.redrawConcept(sdxConcept, groupIdx, eventIdx);
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
	// ================================================================================================== //
	parseMetadataXml: function(valueMetaDataXml) {
		let extractedModel = {
			name: "",
			flagType: "NA",
			flags: [{name: "Abnormal", value: "A"}, {name: "Normal", value: "@"}],
			valueValidate: {
				onlyPos: true,
				onlyInt: true,
				maxString: 0
			},
			valueType: "PosFloat",
			valueUnitsCurrent: 0,
			valueUnits: {},
			rangeInfo: {},
			enumInfo: {}
		};

		const flagsToUse = i2b2.h.getXNodeVal(valueMetaDataXml, "Flagstouse");

		extractedModel.flagType = false;
		if (flagsToUse) {
			if(!i2b2.UI.cfg.useExpandedLabFlags) {
				if (flagsToUse === "A") {
					extractedModel.flagType = "NA";
					extractedModel.flags = [{name: "Normal", value: "@"}, {name: "Abnormal", value: "A"}];
				} else if (flagsToUse === "HL") {
					extractedModel.flagType = "HL";
					extractedModel.flags = [{name: "Normal", value: "@"}, {name: "High", value: "H"}, {
						name: "Low",
						value: "L"
					}];
				}
			}else{
				let t_flags = i2b2.CRC.ctrlr.labValues.ExpandedFlags.process(flagsToUse);
				extractedModel.flagType = t_flags.flagType;
				extractedModel.flags = t_flags.flags;
			}
		}

		extractedModel.enumInfo = [];
		extractedModel.valueUnits = [];
		try {
			let dataType = i2b2.h.getXNodeVal(valueMetaDataXml, "DataType");
			switch (dataType) {
				case "PosFloat":
					extractedModel.dataType = "POSFLOAT";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER;
					extractedModel.valueValidate.onlyPos = true;
					extractedModel.valueValidate.onlyInt = false;
					extractedModel.valueValidate.maxString = false;
					break;
				case "PosInteger":
					extractedModel.dataType = "POSINT";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER;
					extractedModel.valueValidate.onlyPos = true;
					extractedModel.valueValidate.onlyInt = true;
					extractedModel.valueValidate.maxString = false;
					break;
				case "Float":
					extractedModel.dataType = "FLOAT";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER;
					extractedModel.valueValidate.onlyPos = false;
					extractedModel.valueValidate.onlyInt = false;
					extractedModel.valueValidate.maxString = false;
					break;
				case "Integer":
					extractedModel.dataType = "INT";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER;
					extractedModel.valueValidate.onlyPos = true;
					extractedModel.valueValidate.onlyInt = true;
					extractedModel.valueValidate.maxString = false;
					break;
				case "String":
					extractedModel.dataType = "STR";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT;
					extractedModel.valueValidate.onlyPos = false;
					extractedModel.valueValidate.onlyInt = false;

					// extract max string setting
					let strMaxStringLength;
					try {
						strMaxStringLength = valueMetaDataXml.getElementsByTagName('MaxStringLength')[0].firstChild.nodeValue;
						strMaxStringLength = parseInt(strMaxStringLength);
					} catch (e) {
						strMaxStringLength = -1;
					}
					if (strMaxStringLength > 0) {
						extractedModel.valueValidate.maxString = dataType;
					} else {
						extractedModel.valueValidate.maxString = false;
					}
					break;
				case "largestring":
					extractedModel.dataType = "LRGSTR";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.LARGETEXT;
					extractedModel.valueValidate.onlyPos = false;
					extractedModel.valueValidate.onlyInt = false;
					// extract max string setting
					let lrgMaxStringLength;
					try {
						lrgMaxStringLength = valueMetaDataXml.getElementsByTagName('MaxStringLength')[0].firstChild.nodeValue;
						lrgMaxStringLength = parseInt(dataType);
					} catch (e) {
						lrgMaxStringLength = -1;
					}
					if (lrgMaxStringLength > 0) {
						extractedModel.valueValidate.maxString = dataType;
					} else {
						extractedModel.valueValidate.maxString = false;
					}
					break;
				case "Enum":
					extractedModel.dataType = "ENUM";
					extractedModel.valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT;
					extractedModel.valueValidate.onlyPos = false;
					extractedModel.valueValidate.onlyInt = false;
					extractedModel.valueValidate.maxString = false;
					// extract the enum data
					let enumValuesXml = i2b2.h.XPath(valueMetaDataXml,"descendant::EnumValues/Val");

					let enumValuesObj = {};//new Array();
					for (let i=0; i<enumValuesXml.length; i++) {
						let name;
						if (enumValuesXml[i].attributes[0].nodeValue !== "" ) {
							name = enumValuesXml[i].attributes[0].nodeValue;
						} else {
							name = enumValuesXml[i].childNodes[0].nodeValue;
						}
						enumValuesObj[(enumValuesXml[i].childNodes[0].nodeValue)] = name;
					}
					extractedModel.enumInfo = enumValuesObj;

					// remove any Enums found in <CommentsDeterminingExclusion> section
					let commentsDetExclusion = i2b2.h.XPath(valueMetaDataXml,"descendant::CommentsDeterminingExclusion/Com/text()");
					let exclusionArr = [];
					for (let i=0; i<commentsDetExclusion.length; i++) {
						if(exclusionArr.indexOf(commentsDetExclusion[i].nodeValue) === -1) exclusionArr.push(commentsDetExclusion[i].nodeValue);
					}
					commentsDetExclusion = exclusionArr;
					if (commentsDetExclusion.length > 0) {
						for (let i=0;i<commentsDetExclusion.length; i++){
							for (let i2=0;i2<extractedModel.enumInfo.length; i2++) {
								if (extractedModel.enumInfo[i2].indexOf(commentsDetExclusion[i]) > -1 ) {
									extractedModel.enumInfo[i2] = null;
								}
							}
							// clean up the array
							extractedModel.enumInfo = extractedModel.enumInfo.compact();
						}
					}
					break;
				default:
					extractedModel.dataType = false;
			}
		}
		catch(e) {
			extractedModel.dataType = false;
			extractedModel.valueValidate.onlyPos = false;
			extractedModel.valueValidate.onlyInt = false;
			extractedModel.valueValidate.maxString = false;
		}

		// set the title bar (TestName and TestID are assumed to be mandatory)
		if (extractedModel.valueType === "LRGSTR") {
			extractedModel.name = "Search within the " + i2b2.h.getXNodeVal(valueMetaDataXml, 'TestName');
		} else {
			extractedModel.name = "Choose value of "+i2b2.h.getXNodeVal(valueMetaDataXml, 'TestName')+" (Test:"+i2b2.h.getXNodeVal(valueMetaDataXml, 'TestID')+")";
		}

		//lab units
		let tProcessing = {};
		try {
			// save list of all possible units (from)
			let allUnits = i2b2.h.XPath(valueMetaDataXml,"descendant::UnitValues/descendant::text()[parent::NormalUnits or parent::EqualUnits or parent::Units]");
			let allUnitsArr = [];
			for (let i=0; i<allUnits.length; i++) {
				if(allUnitsArr.indexOf(allUnits[i].nodeValue) === -1) allUnitsArr.push(allUnits[i].nodeValue);
			}
			allUnits = allUnitsArr;
			for (let i=0;i<allUnits.length;i++) {
				let d = {name: allUnits[i]};
				// does unit require conversion?
				try {
					d.multFactor = i2b2.h.XPath(valueMetaDataXml,"descendant::UnitValues/descendant::ConvertingUnits[Units/text()='"+t[i]+"']/MultiplyingFactor/text()")[0].nodeValue;
				} catch(e) {
					d.multFactor = 1;
				}
				tProcessing[allUnits[i]]=  d;
			}
			// get our master unit (the first NormalUnits encountered that is not disabled)
			let normalUnits = i2b2.h.XPath(valueMetaDataXml,"descendant::UnitValues/descendant::NormalUnits/text()");
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

		//valueUnits: {name: "ng/l", multFactor: 1, masterUnit: true}
		extractedModel.valueUnits = tProcessing;


		var nBarLength = 520; // fixed width of bar
		//fd.bHidebar = false;  // set to true if decide bar not worth showing
		var nSituation = 0; // how many values are there?
		extractedModel.rangeInfo = {};
		//
		// get preliminary bar length results and set up array
		try {
			extractedModel.rangeInfo.LowOfToxic = parseFloat(valueMetaDataXml.getElementsByTagName('LowofToxicValue')[0].firstChild.nodeValue);
			nSituation = nSituation +1;
		} catch(e) {}
		try {
			extractedModel.rangeInfo.LowOfLow = parseFloat(valueMetaDataXml.getElementsByTagName('LowofLowValue')[0].firstChild.nodeValue);
			if ((isFinite(extractedModel.rangeInfo.LowOfToxic)) && (extractedModel.rangeInfo.LowOfToxic === extractedModel.rangeInfo.LowOfLow)) {
				extractedModel.rangeInfo.LowOfLowRepeat = true;
			} else {
				extractedModel.rangeInfo.LowOfLowRepeat = false;
				nSituation = nSituation +1;
			}
		} catch(e) {}
		try {
			extractedModel.rangeInfo.HighOfLow = parseFloat(valueMetaDataXml.getElementsByTagName('HighofLowValue')[0].firstChild.nodeValue);
			if ((isFinite(extractedModel.rangeInfo.LowOfLow)) && (extractedModel.rangeInfo.LowOfLow === extractedModel.rangeInfo.HighOfLow)) {
				extractedModel.rangeInfo.HighOfLowRepeat = true;
			} else {
				extractedModel.rangeInfo.HighOfLowRepeat = false;
				nSituation = nSituation +1;
			}
		} catch(e) {}
		try {
			extractedModel.rangeInfo.HighOfToxic = parseFloat(valueMetaDataXml.getElementsByTagName('HighofToxicValue')[0].firstChild.nodeValue);
			nSituation = nSituation +1;
		} catch(e) {}
		try {
			extractedModel.rangeInfo.HighOfHigh = parseFloat(valueMetaDataXml.getElementsByTagName('HighofHighValue')[0].firstChild.nodeValue);
			if ((isFinite(extractedModel.rangeInfo.HighOfToxic)) && (extractedModel.rangeInfo.HighOfToxic === extractedModel.rangeInfo.HighOfHigh)) {
				extractedModel.rangeInfo.HighOfHighRepeat = true;
			} else {
				extractedModel.rangeInfo.HighOfHighRepeat = false;
				nSituation = nSituation +1;
			}
		} catch(e) {}
		try {
			extractedModel.rangeInfo.LowOfHigh = parseFloat(valueMetaDataXml.getElementsByTagName('LowofHighValue')[0].firstChild.nodeValue);
			if ((isFinite(extractedModel.rangeInfo.HighOfHigh)) && (extractedModel.rangeInfo.HighOfHigh === extractedModel.rangeInfo.LowOfHigh)) {
				extractedModel.rangeInfo.LowOfHighRepeat = true;
			} else {
				extractedModel.rangeInfo.LowOfHighRepeat = false;
				nSituation = nSituation +1;
			}
		} catch(e) {}
		extractedModel.rangeInfo.total = nSituation;

		return extractedModel;
	},
	// ==================================================================================================
	updateDisplayValue: function(sdxConcept, valueMetadata){
		// update the concept title if this is a modifier
		let modifierInfoText = "";
		if (sdxConcept.LabValues !== undefined) {
			if (sdxConcept.LabValues.ValueLow && sdxConcept.LabValues?.ValueHigh) {
				modifierInfoText = sdxConcept.LabValues.ValueLow + " - " + sdxConcept.LabValues.ValueHigh;
			} else if (sdxConcept.LabValues.ValueFlag) {
				modifierInfoText = "= " + sdxConcept.LabValues.ValueFlag;
				let name = valueMetadata.flags.filter(x => x.value === sdxConcept.LabValues.ValueFlag).map(x => x.name);
				if (name.length > 0) modifierInfoText += " (" + name[0] + ")";
			} else if (sdxConcept.LabValues.isEnum) {
				let mappedEnumValues = sdxConcept.LabValues.Value.map(x => '"' + valueMetadata.enumInfo[x] + '"');
				modifierInfoText = "= (" + mappedEnumValues.join(", ") + ")";
			} else if (sdxConcept.LabValues.ValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER) {
				let numericOperatorMapping = {
					"LT": "<",
					"LE": "<=",
					"EQ": "=",
					"GT": ">",
					"GE": ">="
				}
				modifierInfoText = numericOperatorMapping[sdxConcept.LabValues.ValueOperator] + " " + sdxConcept.LabValues.Value;
			} else if (sdxConcept.LabValues.ValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT) {
				let textOperatorMapping = {
					"LIKE[exact]": "exact",
					"LIKE[begin]": "starts with",
					"LIKE[end]": "ends with",
					"LIKE[contains]": "contains",
				}
				modifierInfoText = textOperatorMapping[sdxConcept.LabValues.ValueOperator] + " ";
				modifierInfoText += '"' + sdxConcept.LabValues.Value + '"';
			} else if (sdxConcept.LabValues.ValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.LARGETEXT) {
				modifierInfoText = "contains " + '"' + sdxConcept.LabValues.Value + '"';
			}

			if (sdxConcept.LabValues.ValueUnit) {
				modifierInfoText += " " + sdxConcept.LabValues.ValueUnit;
			}
		}
		if (modifierInfoText.length > 0) {
			modifierInfoText = " " + modifierInfoText;
		}

		if (sdxConcept.origData.isModifier) {
			// modifier
			sdxConcept.renderData.title = sdxConcept.origData.conceptModified.renderData.title
				+ " {" + sdxConcept.origData.name + modifierInfoText + "}";
		} else {
			// lab value
			sdxConcept.renderData.title = sdxConcept.origData.name + modifierInfoText;
		}
	}
};

