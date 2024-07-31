/**
 * @projectDescription	(GUI-only) Master Controller for CRC Query Tool's Value constraint dialog boxes.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.GENOTYPE_RSID
 * @author		Nick Benik
 * @version
 * ----------------------------------------------------------------------------------------
 */

i2b2.CRC.view.GENOTYPE_RSID = {
    extractRsIdInfo: function(rsId, json) {
        let data = JSON.parse(json);
        if (rsId !== data.refsnp_id) return false;
        // extract the allele data
        let extracted_alleles = {};
        let placements = data?.primary_snapshot_data?.placements_with_allele;
        if (placements === undefined) return false;
        for (let entry of placements) {
            // we are only interested in alleles associated at the chromosome level
            if (entry.seq_id.startsWith("NC_")) {
                for (let allele of entry.alleles) {
                    let tmp_allele_info = allele.allele.spdi;
                    if (extracted_alleles[tmp_allele_info.deleted_sequence] === undefined) extracted_alleles[tmp_allele_info.deleted_sequence] = {};
                    if (extracted_alleles[tmp_allele_info.deleted_sequence][tmp_allele_info.inserted_sequence] === undefined) {
                        extracted_alleles[tmp_allele_info.deleted_sequence][tmp_allele_info.inserted_sequence] = 1
                    } else {
                        extracted_alleles[tmp_allele_info.deleted_sequence][tmp_allele_info.inserted_sequence]++;
                    }
                }
            }
        }
        // now we have an array of registered alleles from SNPdb!
        let allele_return_list = {};
        for (let del in extracted_alleles) {
            for (let ins in extracted_alleles[del]) {
                let val = del + "_to_" + ins;
                let key = del + (del === ins ? "=" : ">") + ins;
                allele_return_list[key] = val;
            }
        }
        return allele_return_list;
    },
    // ================================================================================================== //
    getGeneralDataType: function () {
        return "GENOTYPE_RSID";
    },
    // ================================================================================================== //
    parseMetadataXml: function (valueMetadataXml) {
        let extractedModel = {
            name: "",
            ValueType: "LARGETEXT",
            ValueOperator: "CONTAINS[database]"
        };

        extractedModel.dataType = i2b2.h.getXNodeVal(valueMetadataXml, "DataType");
        extractedModel.name = "Search by dbSNP rs Identifier";

        return extractedModel;
    },
    // ================================================================================================== //
    parseValueData: function(value) {
        let ret = {};
        let value_parts = value;
        value_parts = value_parts.replaceAll(' AND ', ' ');
        value_parts = value_parts.replaceAll(' OR ', ' ');
        value_parts = value_parts.replaceAll('(', '').replaceAll(')', '');
        value_parts = value_parts.split(' ');

        // temporarly save the selected alleles
        ret.alleles = [];
        for (let val of value_parts) {
            if (val.toUpperCase().includes("_TO_")) {
                ret.alleles.push(val);
            }
        }
        if (ret.alleles.length === 0) ret.alleles = false;

        // load the SNP
        let rs = false;
        for (let val of value_parts) {
            if (val.toUpperCase().startsWith("RS")) {
                rs = val.substring(2).trim();
                break;
            }
        }
        if (rs !== false) {
            ret.rs = rs;
        } else {
            ret.rs = false;
        }

        // check the selected zygosities
        ret.zygosity = [];
        for (let val of value_parts) {
            let temp = val.toUpperCase();
            if (!temp.startsWith("RS") && !temp.includes("_TO_")) {
                ret.zygosity.push(val);
            }
        }
        if (ret.zygosity.length === 0) ret.zygosity = falses;
        return ret;
    },
    // ================================================================================================== //
    reportHtml: function (sdxConcept) {
        let genotype = i2b2.CRC.view.GENOTYPE_RSID.parseValueData(sdxConcept.LabValues.Value);
        sdxConcept.renderData.title = "dbSNP Identifier rs" + genotype.rs;
        // Populate it with the option HTML
        let ret = "<div style='color: green'>Zygosity: " + genotype.zygosity.join(" (or) ") + "</div>";
        ret = ret + "<div style='color: green'>Alleles: " + genotype.alleles.join(" (or) ") + "</div>";
        return ret;
    },
    // ================================================================================================== //
    showDialog: function (sdxConcept, valueMetadata, queryPanelController, groupIdx, eventIdx) {

        if (valueMetadata !== undefined) {

            let labValuesModal = $("#labValuesModal");

            if (labValuesModal.length === 0) {
                $("body").append("<div id='labValuesModal'/>");
                labValuesModal = $("#labValuesModal");
            }

            labValuesModal.load('js-i2b2/cells/CRC/ModLabValues/CRC_view_GENOTYPE_RSID.html', function () {
                let newLabValues = {
                    ValueType: valueMetadata.ValueType,
                    ValueOperator: valueMetadata.ValueOperator,
                    Value: null
                };

                // default
                $("#labZygosityHetero, #labZygosityHomo").prop("checked", true);
                $('.modal-footer .lab-save').addClass("disabled");

                $("#labValuesModal div").eq(0).modal("show");
                $("#labHeader").text(valueMetadata.name);

                $(".labZygosity.form-check input.form-check-input").change(function () {
                    let selected = $(".labZygosity.form-check input.form-check-input:checked");
                    if (selected.length > 0) {
                        $(".labZygosity.errorlabel").hide();
                    } else {
                        $(".labZygosity.errorlabel").show();
                    }
                    func_validate_ok_button();
                });

                let func_validate_ok_button = function() {
                    if ($(".labMain .errorlabel:visible").length === 0) {
                        $('.modal-footer .lab-save').removeClass("disabled");
                    } else {
                        $('.modal-footer .lab-save').addClass("disabled");
                    }
                }


                // validation for alleles
                let func_validate_alleles = function () {
                    let selected = $(".labAllele.form-check input.form-check-input:checked");
                    $('.modal-footer .lab-save').removeClass("disabled");
                    if (selected.length > 0) {
                        $(".labAllele.errorlabel").hide();
                        if (selected.length > 1) {
                            for (let opt of selected) {
                                let nucliotides = opt.id.substr(9).split("_");
                                if (nucliotides[0] === nucliotides[1]) {
                                    $(".labAllele.errorlabel").text("You cannot combine variant allele(s) along with the non-mutant allele").show();
                                    break;
                                }
                            }
                        }
                    } else {
                        $(".labAllele.errorlabel").text("At least one allele option must be selected").show();
                    }
                    func_validate_ok_button();
                };
                $(".labAllele.form-check input.form-check-input").change(func_validate_alleles);


                let func_find_rsid = function() {
                    if (!func_validate_rs(true)) return;
                    let rsId = $("#rsId").val();
                    if (rsId == $("#rsId").data('rsid')) return;

                    $('.modal-footer .lab-save').addClass("disabled");
                    $("#rsId").data('rsid', rsId);
                    $(".labRsGroup .search").addClass("searching");
                    let func_CB = function(data) {
                        $(".labRsGroup .search").removeClass("searching");
                        $(".alleleList").empty();
                        let alleles = i2b2.CRC.view.GENOTYPE_RSID.extractRsIdInfo(rsId, data.msgResponse);
                        if (alleles === false) {
                            $(".labRs.errorlabel").text("The \"rs\" identifier does not exist or is invalid").show();
                        } else {
                            // populate the alleles selection box
                            for (let key in alleles) {
                                let value = alleles[key];
                                let tmp = key.replace("=","_").replace(">","_");
                                let id = "labAllele" + tmp;
                                tmp = tmp.split("_");
                                let label = "";
                                if (tmp[0] === tmp[1]) {
                                    label = tmp[0] + " = " + tmp[1] + " (no mutation)";
                                } else {
                                    label = tmp[0] + "<i class=\"bi bi-chevron-right\"></i>" + tmp[1] + " &nbsp;(reference to variant)";
                                }
                                let html = `<div class="form-check labAllele">
                                    <input class="form-check-input" id="${id}" value="${value}" type="checkbox" />
                                    <label class="custom-control-label" for="${id}">${label}</label>
                                </div>`;
                                $(".alleleList").append($(html));
                            }
                            // check the alleles if we are reloading previous selection
                            if (newLabValues.temp_alleles) {
                                for (let check of $(".alleleList input")) {
                                    if (newLabValues.temp_alleles.includes(check.value)) $(check).prop("checked", true);
                                }
                                delete newLabValues.temp_alleles;
                            }
                            // reattach the validation handlers for alleles
                            $(".labAllele.form-check input.form-check-input").change(func_validate_alleles);
                        }
                        func_validate_alleles();
                        func_validate_ok_button();
                    };
                    i2b2.CRC.ajax._doSendMsg("proxySNPdbEntry","test",{rsid:rsId},func_CB,{});
                };
                $('.labRsGroup .input-group-append.search').click(func_find_rsid);
                $('.labMain').closest('form').submit(func_find_rsid);

                let func_validate_rs = function(no_search) {
                    let hasError = false;
                    let rsInput = $("#rsId")[0];
                    rsInput.value = rsInput.value.trim();
                    if (rsInput.value.length == 0) hasError = true;

                    let rsInt = parseInt(rsInput.value);
                    if (isNaN(rsInt)) hasError = true;
                    if (String(rsInt) !== rsInput.value) hasError = true;
                    if (hasError) {
                        $(".labRs.errorlabel").text("Enter a valid \"rs\" identifier").show();
                        func_validate_ok_button();
                        return false;
                    } else {
                        $(".labRs.errorlabel").hide();
                        // now run a search if the past value is different than the current value
                        let old_rsid = $("#rsId").data('rsid');
                        if (rsInt !== old_rsid) {
                            if (no_search !== true) func_find_rsid();
                        }
                        func_validate_ok_button();
                        return true;
                    }
                };
                $("#rsId").on('blur', func_validate_rs);


                // Save button handler
                $("body #labValuesModal button.lab-save").click(function () {
                    // check for bad inputs
                    if ($(".labMain .errorlabel:visible").length !== 0) return;

                    // build the value constraint
                    let rsValue = "rs" + $("#rsId").data('rsid');

                    let alleleValue = [];
                    for (let check of $(".alleleList .form-check input:checked")) {
                        alleleValue.push(check.value);
                    }
                    if (alleleValue.length > 1) {
                        alleleValue = "(" + alleleValue.join(" OR ") + ")";
                    } else {
                        alleleValue = alleleValue[0];
                    }

                    let zygosityValue = [];
                    for (let check of $(".labZygosityGroup input:checked")) {
                        zygosityValue.push(check.value);
                    }
                    if (zygosityValue.length > 1) {
                        zygosityValue = "(" + zygosityValue.join(" OR ") + ")";
                    } else {
                        zygosityValue = zygosityValue[0];
                    }

                    // save the values
                    sdxConcept.LabValues = newLabValues;
                    sdxConcept.LabValues.Value = rsValue + " AND " + alleleValue + " AND " + zygosityValue;

                    // update the display title
                    sdxConcept.renderData.title = "dbSNP Identifier " + rsValue + " {" + alleleValue + " and " + zygosityValue +"}";
                    queryPanelController.redrawConcept(sdxConcept, groupIdx, eventIdx);

                    // close the modal
                    $("#labValuesModal div").eq(0).modal("hide");

                });

                // === load the previously saved values into the model screen ===
                if (sdxConcept.LabValues && sdxConcept.LabValues.ValueType) {
                    newLabValues.ValueType = sdxConcept.LabValues.ValueType;
                    newLabValues.Value = sdxConcept.LabValues.Value;
                    newLabValues.ValueOperator = "CONTAINS[database]";

                    let genotype = i2b2.CRC.view.GENOTYPE_RSID.parseValueData(sdxConcept.LabValues.Value);

                    // temporarly save the selected alleles
                    if (genotype.alleles.length > 0) newLabValues.temp_alleles = genotype.alleles;

                    // load the SNP
                    if (genotype.rs !== false) {
                        $("#rsId").val(genotype.rs);
                        func_validate_rs();
                    } else {
                        $("#labZygosityHetero, #labZygosityHomo").prop("checked", true);
                    }

                    // check the selected zygosities
                    for (let check of $(".labZygosity.form-check input.form-check-input")) {
                        if (genotype.zygosity.includes(check.value)) {
                            $(check).prop("checked", true);
                        } else {
                            $(check).prop("checked", false);
                        }
                    }
                }
            });
        }
    },
    // ================================================================================================== //
    updateDisplayValue: function (sdxConcept, valueMetadata) {
        if (sdxConcept.LabValues !== undefined) {
            if (sdxConcept.LabValues.Value.length > 0) {
                let data = i2b2.CRC.view.GENOTYPE_RSID.parseValueData(sdxConcept.LabValues.Value);
                sdxConcept.renderData.title = "dbSNP Identifier rs" + data.rs + " {(" + data.zygosity.join(" or ") + ") and ("+data.alleles.join(" or ")+")}";
            }
        }
    }
};

// ================================================================================================== //
i2b2.CRC.view.GENOTYPE_RSID_SNP = {
    getGeneralDataType: function () {
        return "GENOTYPE_RSID";
    }
};
i2b2.CRC.view.GENOTYPE_RSID_INDEL = {
    getGeneralDataType: function () {
        return "GENOTYPE_RSID";
    }
};

// inject a new "hidden" message type to allow getting rsid data from SNPdb
let rsidProxyMsg = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r'+
    '<ns6:request xmlns:ns6="http://www.i2b2.org/xsd/hive/msg/1.1/">\r'+
    '	<message_header>\n'+
    '		<proxy><redirect_url>https://api.ncbi.nlm.nih.gov/variation/v0/refsnp/{{{rsid}}}</redirect_url></proxy>'+
    '		<sending_application>\n'+
    '			<application_name>i2b2_QueryTool</application_name>\n'+
    '			<application_version>' + i2b2.ClientVersion + '</application_version>\n'+
    '		</sending_application>\n'+
    '		<security>\n'+
    '			<domain></domain><username></username><password></password>\n'+
    '		</security>\n'+
    '		<message_control_id>\n'+
    '			<message_num>{{{header_msg_id}}}</message_num>\n'+
    '			<instance_num>0</instance_num>\n'+
    '		</message_control_id>\n'+
    '		<project_id></project_id>\n'+
    '	</message_header>\n'+
    '	<request_header>\n'+
    '		<result_waittime_ms>{{{result_wait_time}}}000</result_waittime_ms>\n'+
    '	</request_header>\n'+
    '	<message_body></message_body>\n'+
    '</ns6:request>';
setTimeout(()=>{
    i2b2.CRC.ajax._commData["proxySNPdbEntry"] = {
        msg: rsidProxyMsg,
        dont_escape_params: ['proxy_info','sec_pass_node'],
        url: "https://api.ncbi.nlm.nih.gov/variation/v0/refsnp/"
    };
}, 1000);
