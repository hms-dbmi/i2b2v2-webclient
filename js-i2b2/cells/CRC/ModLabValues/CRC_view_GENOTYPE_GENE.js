/**
 * @projectDescription	(GUI-only) Master Controller for CRC Query Tool's Value constraint dialog boxes.
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.GENOTYPE_GENE
 * @author		Nick Benik
 * @version
 * ----------------------------------------------------------------------------------------
 */

i2b2.CRC.view.GENOTYPE_GENE = {
    serviceURL: 'https://i2b2ui-test-i2b2.catalyst.harvard.edu/genomicInfo.php',
    // ================================================================================================== //
    getGeneralDataType: function () {
        return "GENOTYPE_GENE";
    },
    // ================================================================================================== //
    parseMetadataXml: function (valueMetadataXml) {
        let extractedModel = {
            name: "",
            ValueType: "LARGETEXT",
            ValueOperator: "CONTAINS[database]"
        };

        extractedModel.dataType = i2b2.h.getXNodeVal(valueMetadataXml, "DataType");
        extractedModel.name = "Search by Gene";

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

        // get the effect values
        let effectsList = ['FRAMESHIFT', 'MISSENSE', 'NONSENSE', 'START_LOSS', 'STOP_LOSS', "3'UTR", "5'UTR", 'DOWNSTREAM', 'UPSTREAM', 'EXON', 'INTRON', 'IN_FRAME', 'SYNONYMOUS', 'MISSING_CONSEQUENCE'];
        // for (let tmp of $('.effectList > .form-check input')) {
        //     effectsList.push(tmp.value.toUpperCase());
        // }
        ret.effects = [];
        for (let val of value_parts) {
            if (effectsList.includes(val.toUpperCase())) ret.effects.push(val);
        }
        if (ret.effects.length === 0) ret.effects = false;


        // check the selected zygosities
        let zygosityList = ['HETEROZYGOUS', 'HOMOZYGOUS', 'MISSING_ZYGOSITY'];
        // for (let tmp of $('.labZygosity input')) {
        //     zygosityList.push(tmp.value.toUpperCase());
        // }
        ret.zygosity = [];
        for (let val of value_parts) {
            if (zygosityList.includes(val.toUpperCase())) ret.zygosity.push(val);
        }
        if (ret.zygosity.length === 0) ret.zygosity = false;


        // get the gene symbol
        for (let val of value_parts) {
            let tmp = val.toUpperCase();
            if (!effectsList.includes(tmp) && !zygosityList.includes(tmp)) {
                ret.gene = val;
                break;
            }
        }

        return ret;
    },
    // ================================================================================================== //
    reportHtml: function (sdxConcept) {
        let genotype = i2b2.CRC.view.GENOTYPE_GENE.parseValueData(sdxConcept.LabValues.Value);
        sdxConcept.renderData.title = "Gene Symbol " + genotype.gene;
        // Populate it with the option HTML
        let ret = "<div style='color: green'>Zygosity: " + genotype.zygosity.join(" (or) ") + "</div>";
        ret = ret + "<div style='color: green'>Consequences: " + genotype.effects.join(" (or) ") + "</div>";
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

            labValuesModal.load('js-i2b2/cells/CRC/ModLabValues/CRC_view_GENOTYPE_GENE.html', function () {
                let newLabValues = {
                    ValueType: valueMetadata.ValueType,
                    ValueOperator: valueMetadata.ValueOperator,
                    Value: null
                };

                // default settings
                $("#labZygosityHetero, #labZygosityHomo").prop("checked", true);
                $('.labEffectGroup .effectList:first .form-check input').prop("checked", true);
                $('.modal-footer .lab-save').addClass("disabled");
                $("#labHeader").text(valueMetadata.name);

                $("#labValuesModal div").eq(0).modal("show");

                // handle zygosity clicks
                let func_validate_zygosity = function() {
                    let selected = $(".labZygosity.form-check input.form-check-input:checked");
                    if (selected.length > 0) {
                        $(".labZygosity.errorlabel").hide();
                    } else {
                        $(".labZygosity.errorlabel").show();
                    }
                    func_validate_ok_button();
                }
                $(".labZygosity.form-check input.form-check-input").change(func_validate_zygosity);


                // handle gene name input
                let timeout = null;
                $('#geneId.input').on('focus', () => {
                    let gene = $("#geneId");
                    if (gene.data("geneSymbol") === undefined) {
                        // gene has not been selected
                        if (gene.val().length === 0) {
                            $('#geneAutocomplete-list').empty();
                        } else {
                            func_find_gene();
                        }
                    }
                });
                $("#geneId").on('keydown', (e) => {
                    if (e.keyCode === 40) {
                        // key down
                        let found = false;
                        let entries = $('#geneAutocomplete-list div');
                        for (let entry of entries) {
                            if (found) {
                                entry.classList.add('autocomplete-active');
                                return;
                            } else {
                                if (entry.classList.contains('autocomplete-active')) {
                                    entry.classList.remove('autocomplete-active');
                                    found = true;
                                }
                            }
                        }
                        entries[0].classList.add('autocomplete-active');
                    } else if (e.keyCode === 38) {
                        // key up
                        let entries = $('#geneAutocomplete-list div');
                        let previous = entries[entries.length-1];
                        for (let entry of entries) {
                            if (entry.classList.contains('autocomplete-active')) {
                                entry.classList.remove('autocomplete-active');
                                previous.classList.add('autocomplete-active');
                                return;
                            } else {
                                previous = entry;
                            }
                        }
                    } else if (e.keyCode === 13) {
                        // enter key
                        e.preventDefault();
                        let geneId = $('#geneId');
                        let selection = $('#geneAutocomplete-list .autocomplete-active');
                        if (selection.length > 0) {
                            geneId.val(selection[0].innerText);
                            geneId.data("geneSymbol", selection.data("geneSymbol"));
                            geneId.data("geneName", selection.data("geneName"));
                            $('#geneAutocomplete-list').empty();
                            geneId.blur();
                        } else {
                            // see if the textbox value matches a gene symbol
                            let text = $("#geneId").val().trim().toUpperCase();
                            let genes = $('#geneAutocomplete-list div');
                            for (let gene of genes) {
                                let tmp = $(gene);
                                if (tmp.data("geneSymbol") === text) {
                                    geneId.val(tmp[0].innerText);
                                    geneId.data("geneSymbol", tmp.data("geneSymbol"));
                                    geneId.data("geneName", tmp.data("geneName"));
                                    $('#geneAutocomplete-list').empty();
                                    geneId.blur();
                                    return;
                                }
                            }
                        }
                    }
                });
                $("#geneId").on('keyup', (e) => {
                        if (e.key.length === 1 || e.keyCode === 8) {
                            let gene = $("#geneId");
                            gene.removeData("geneSymbol");
                            gene.removeData("geneName");
                            clearTimeout(timeout);
                            if (gene.val().trim().length > 2) timeout = setTimeout(func_find_gene,600);
                        }
                });
                let func_find_gene = function() {
                    let geneId = $('#geneId');
                    geneId.removeData("geneSymbol");
                    geneId.removeData("geneName");
                    $('.modal-footer .lab-save').addClass("disabled");
                    $(".labGeneGroup .search").addClass("searching");
                    $.ajax({
                        url: i2b2.CRC.view.GENOTYPE_GENE.serviceURL,
                        method: 'GET',
                        data: {
                            op: 'gene',
                            term: geneId.val().trim()
                        },
                        success: (result) => {
                            $(".labGeneGroup .search").removeClass("searching");
                            let autocompleteTrgt = $('#geneAutocomplete-list');
                            autocompleteTrgt.empty();
                            let genes = JSON.parse(result);
                            for (let gene of genes) {
                                let entry = $('<div><strong>'+gene.symbol+'</strong> - '+gene.name+'<input type="hidden" value="'+gene.symbol+'"></div>');
                                entry.data("geneSymbol", gene.symbol);
                                entry.data("geneName", gene.name);
                                autocompleteTrgt.append(entry);
                            }
                            $('#geneAutocomplete-list div').on('mousedown', func_click_gene);
                            func_validate_gene();
                        },
                        error: (result) => {
                            $(".labGeneGroup .search").removeClass("searching");
                            console.error('An error occured while looking up the gene');
                            func_validate_gene();
                        }
                    });
                };
                $('.labGeneGroup .input-group-append.search').click(func_find_gene);
                $('.labMain').closest('form').submit(func_find_gene);

                let func_validate_gene = function() {
                    let hasError = false;
                    if ($('#geneId').data("geneSymbol") === undefined) hasError = true;
                    if (hasError) {
                        $(".labGene.errorlabel").text("Enter a valid Gene symbol").show();
                    } else {
                        $(".labGene.errorlabel").hide();
                    }
                    func_validate_ok_button();
                };
                $("#geneId").on('blur', func_validate_gene);

                let func_click_gene = function(e) {
                    let geneId = $('#geneId');
                    let selection = $(e.currentTarget);
                    geneId.val(selection[0].innerText);
                    geneId.data("geneSymbol", selection.data("geneSymbol"));
                    geneId.data("geneName", selection.data("geneName"));
                    $('#geneAutocomplete-list').empty();
                    geneId.blur();

                };

                let func_validate_ok_button = function() {
                    if ($(".labMain .errorlabel:visible").length === 0) {
                        $('.modal-footer .lab-save').removeClass("disabled");
                    } else {
                        $('.modal-footer .lab-save').addClass("disabled");
                    }
                }


                // handle effect group heading clicks
                $(".effectList .labEffect.grouplabel input.form-check-input").change(function() {
                    $('input', $(this).closest(".effectList")).prop("checked", this.checked);
                    func_validate_effect();
                });
                // validation for effects
                let func_validate_effect = function () {
                    let selected = $(".effectList > .form-check input.form-check-input:checked");
                    if (selected.length === 0) {
                        $(".labEffect.errorlabel").show();
                    } else {
                        $(".labEffect.errorlabel").hide();
                    }
                    // uncheck the effect group headers if we do not have all subitems selected
                    let groups = $(".effectList");
                    for (let trgt of groups) {
                        let selected = $("> .form-check input:checked", trgt).length;
                        let total = $("> .form-check input", trgt).length;
                        if (selected === total) {
                            $(".labEffect input", trgt).prop("checked", true);
                        } else {
                            $(".labEffect input", trgt).prop("checked", false);
                        }
                    }
                    func_validate_ok_button();
                };
                $(".effectList .form-check input.form-check-input").change(func_validate_effect);


                // Save button handler
                $("body #labValuesModal button.lab-save").click(function () {
                    // check for bad inputs
                    if ($(".labMain .errorlabel:visible").length !== 0) return;

                    // build the value constraints
                    let geneValue = $("#geneId").data('geneSymbol');

                    let zygosityValue = [];
                    for (let check of $(".labZygosityGroup input:checked")) {
                        zygosityValue.push(check.value);
                    }
                    if (zygosityValue.length > 1) {
                        zygosityValue = "(" + zygosityValue.join(" OR ") + ")";
                    } else {
                        zygosityValue = zygosityValue[0];
                    }

                    let effectValue = [];
                    for (let check of $('.effectList > .form-check input:checked')) {
                        effectValue.push(check.value);
                    }
                    if (effectValue.length > 1) {
                        effectValue = "(" + effectValue.join(" OR ") + ")";
                    } else {
                        effectValue = effectValue[0];
                    }

                    // save the values
                    sdxConcept.LabValues = newLabValues;
                    sdxConcept.LabValues.Value = geneValue + " AND " + effectValue + " AND " + zygosityValue;

                    // update the display title
                    sdxConcept.renderData.title = "Gene " + geneValue + " {" + zygosityValue + " and " + effectValue +"}";
                    queryPanelController.redrawConcept(sdxConcept, groupIdx, eventIdx);

                    // close the modal
                    $("#labValuesModal div").eq(0).modal("hide");

                });

                // === load the previously saved values into the model screen ===
                if (sdxConcept.LabValues && sdxConcept.LabValues.ValueType) {
                    newLabValues.ValueType = sdxConcept.LabValues.ValueType;
                    newLabValues.Value = sdxConcept.LabValues.Value;
                    newLabValues.ValueOperator = "CONTAINS[database]";

                    let genotype = i2b2.CRC.view.GENOTYPE_GENE.parseValueData(sdxConcept.LabValues.Value);

                    // load the gene
                    if (genotype.gene !== false) {
                        let geneId = $('#geneId');
                        geneId.removeData("geneSymbol");
                        geneId.removeData("geneName");
                        geneId.val(genotype.gene);
                        $.ajax({
                            url: i2b2.CRC.view.GENOTYPE_GENE.serviceURL,
                            method: 'GET',
                            data: {
                                op: 'gene',
                                term: genotype.gene
                            },
                            success: (result) => {
                                let genes = JSON.parse(result);
                                let gene = genes[0]
                                let geneId = $('#geneId');
                                geneId.val(gene.symbol + ' - ' + gene.name);
                                geneId.data("geneSymbol", gene.symbol);
                                geneId.data("geneName", gene.name);
                                func_validate_gene();
                            },
                            error: (result) => {
                                console.error('An error occured while looking up the gene');
                                func_validate_gene();
                            }
                        });
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
                    func_validate_zygosity();

                    // check the selected effects
                    for (let check of $('.effectList > .form-check input')) {
                        if (genotype.effects.includes(check.value)) {
                            $(check).prop("checked", true);
                        } else {
                            $(check).prop("checked", false);
                        }
                    }
                    func_validate_effect();
                }
            });
        }
    },
    // ================================================================================================== //
    updateDisplayValue: function (sdxConcept, valueMetadata) {
        if (sdxConcept.LabValues !== undefined) {
            if (sdxConcept.LabValues.Value.length > 0) {
                let data = i2b2.CRC.view.GENOTYPE_GENE.parseValueData(sdxConcept.LabValues.Value);
                sdxConcept.renderData.title = "Gene " + data.gene + " {(" + data.zygosity.join(" or ") + ") and ("+data.effects.join(" or ")+")}";
            }
        }
    }
};

// ================================================================================================== //
i2b2.CRC.view.GENOTYPE_GENE_SNP = {
    getGeneralDataType: function () {
        return "GENOTYPE_GENE";
    }
};
i2b2.CRC.view.GENOTYPE_GENE_INDEL = {
    getGeneralDataType: function () {
        return "GENOTYPE_GENE";
    }
};
