/**
 * @projectDescription	The main controller for the lab values viewport.
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.labValues
 * @author		Marc-Danie Nazaire
 * ----------------------------------------------------------------------------------------
 */
// ================================================================================================== //


i2b2.CRC.ctrlr.labValues = {
// ================================================================================================== //
    loadData: function(sdxConcept, callBack) {
        let labResponseCallback = function(response) {
            let isActiveXSupported = true;
            try {
                new ActiveXObject("MSXML2.DOMDocument.6.0");
            } catch (e) {
                isActiveXSupported = false;
            }
            let c;
            if (isActiveXSupported) {
                //Internet Explorer
                let xmlDocRet = new ActiveXObject("Microsoft.XMLDOM");
                xmlDocRet.async = "false";
                xmlDocRet.loadXML(response.msgResponse);
                xmlDocRet.setProperty("SelectionLanguage", "XPath");
                c = i2b2.h.XPath(xmlDocRet, 'descendant::concept');
            } else {
                c = i2b2.h.XPath(response.refXML, 'descendant::concept');
            }
            if (c.length > 0) sdxConcept.origData.xmlOrig = c[0].outerHTML;

            const valueMetaDataArr = i2b2.h.XPath(sdxConcept.origData.xmlOrig, "metadataxml/ValueMetadata[string-length(Version)>0]");
            if (valueMetaDataArr.length > 0) {
                sdxConcept.isLab = true;
                callBack(valueMetaDataArr[0]);
            }
        };

        i2b2.ONT.ajax.GetTermInfo("ONT", {concept_key_value:sdxConcept.origData.key,
            ont_max_records: 'max="1"', ont_synonym_records: true, ont_hidden_records: true}, labResponseCallback );
    },
// ================================================================================================== //
    parseLabValues: function(valueMetaDataXml) {
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
                    extractedModel.valueType = this.ValueTypes.GENERAL_VALUE.NUMBER;
                    extractedModel.valueValidate.onlyPos = true;
                    extractedModel.valueValidate.onlyInt = false;
                    extractedModel.valueValidate.maxString = false;
                    break;
                case "PosInteger":
                    extractedModel.dataType = "POSINT";
                    extractedModel.valueType = this.ValueTypes.GENERAL_VALUE.NUMBER;
                    extractedModel.valueValidate.onlyPos = true;
                    extractedModel.valueValidate.onlyInt = true;
                    extractedModel.valueValidate.maxString = false;
                    break;
                case "Float":
                    extractedModel.dataType = "FLOAT";
                    extractedModel.valueType = this.ValueTypes.GENERAL_VALUE.NUMBER;
                    extractedModel.valueValidate.onlyPos = false;
                    extractedModel.valueValidate.onlyInt = false;
                    extractedModel.valueValidate.maxString = false;
                    break;
                case "Integer":
                    extractedModel.dataType = "INT";
                    extractedModel.valueType = this.ValueTypes.GENERAL_VALUE.NUMBER;
                    extractedModel.valueValidate.onlyPos = true;
                    extractedModel.valueValidate.onlyInt = true;
                    extractedModel.valueValidate.maxString = false;
                    break;
                case "String":
                    extractedModel.dataType = "STR";
                    extractedModel.valueType = this.ValueTypes.GENERAL_VALUE.TEXT;
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
                    extractedModel.valueType = this.ValueTypes.GENERAL_VALUE.LARGETEXT;
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
                    extractedModel.valueType = this.ValueTypes.GENERAL_VALUE.TEXT;
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
};

// ==================================================================================================
i2b2.CRC.ctrlr.labValues.extractDataType = function(sdxConcept, valueMetadataXml){

    let valueType = "NODATATYPE";
    let dataType = i2b2.h.getXNodeVal(valueMetadataXml, 'DataType');
    if(dataType) valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.getValueType(dataType);

    let GeneralValueType = valueType;
    if (GeneralValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER || GeneralValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT
        || GeneralValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.LARGETEXT) {
        GeneralValueType = "BASIC";
    }

    return GeneralValueType;
};

// ==================================================================================================
i2b2.CRC.ctrlr.labValues.updateDisplayValue = function(sdxConcept, extractedLabValues, groupIdx, eventIdx){
    // update the concept title if this is a modifier
    let modifierInfoText = "";
    if (sdxConcept.LabValues !== undefined) {
        if (sdxConcept.LabValues.ValueLow && sdxConcept.LabValues?.ValueHigh) {
            modifierInfoText = sdxConcept.LabValues.ValueLow + " - " + sdxConcept.LabValues.ValueHigh;
        } else if (sdxConcept.LabValues.ValueFlag) {
            modifierInfoText = "= " + sdxConcept.LabValues.ValueFlag;
            let name = extractedLabValues.flags.filter(x => x.value === sdxConcept.LabValues.ValueFlag).map(x => x.name);
            if (name.length > 0) modifierInfoText += " (" + name[0] + ")";
        } else if (sdxConcept.LabValues.isEnum) {
            let mappedEnumValues = sdxConcept.LabValues.Value.map(x => '"' + extractedLabValues.enumInfo[x] + '"');
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

    if (eventIdx !== undefined && groupIdx !== undefined) {
        let eventData = i2b2.CRC.model.query.groups[groupIdx].events[eventIdx];
        const targetTermList = $(".event[data-eventidx=" + eventIdx + "] .TermList", $(".CRC_QT_query .QueryGroup")[groupIdx]);
        i2b2.CRC.view.QT.renderTermList(eventData, targetTermList);
    }
};
// ================================================================================================== //

i2b2.CRC.ctrlr.labValues.redrawConcept = function(sdx, groupIdx, eventIdx) {
    if (eventIdx !== undefined && groupIdx !== undefined) {
        let eventData = i2b2.CRC.model.query.groups[groupIdx].events[eventIdx];
        const targetTermList = $(".event[data-eventidx=" + eventIdx + "] .TermList", $(".CRC_QT_query .QueryGroup")[groupIdx]);
        i2b2.CRC.view.QT.renderTermList(eventData, targetTermList);
        i2b2.CRC.view.QueryMgr.clearStatus();
    }
};

// ==================================================================================================
i2b2.CRC.ctrlr.labValues.ValueTypes = {};
// ==================================================================================================
i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE = {
        TEXT: "TEXT",
        LARGETEXT: "LARGETEXT",
        NUMBER: "NUMBER",
        FLAG: "FLAG",
        GENOTYPE: "GENOTYPE",
        MODIFIER: "MODIFIER"
};
// ==================================================================================================
/* Start Configuration. Note: be careful to keep trailing commas after each parameter */
i2b2.CRC.ctrlr.labValues.ValueTypes.type = {
    "PosFloat" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER,
    "PosInteger" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER,
    "Float" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER,
    "Integer" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER,
    "String" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT,
    "largestring" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.LARGETEXT,
    "GENOTYPE_GENE" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.GENOTYPE,
    "GENOTYPE_GENE_INDEL" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.GENOTYPE,
    "GENOTYPE_GENE_SNP" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.GENOTYPE,
    "GENOTYPE_RSID" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.GENOTYPE,
    "GENOTYPE_RSID_INDEL" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.GENOTYPE,
    "GENOTYPE_RSID_SNP" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.GENOTYPE,
    "Enum" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT,
    "DEFAULT" : i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER,
};
// ==================================================================================================
i2b2.CRC.ctrlr.labValues.ValueTypes.getValueType = function(dataType)
{
    let valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.type[dataType];
    if(!i2b2.CRC.ctrlr.labValues.ValueTypes.type.hasOwnProperty(dataType)) {
        valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.type["DEFAULT"];
    }

    return valueType;
};
// ==================================================================================================
i2b2.CRC.ctrlr.labValues.ExpandedFlags = {};
i2b2.CRC.ctrlr.labValues.ExpandedFlags.type = {
    /*  A,H,L are included below to show how to set up the expanded lab flags with the default flag values.
        Note however that it is not possible to use these and the two-character flags at the same time, because indexOf will return false positives, e.g. H and CH */
    //abnormal_default: {name:'Abnormal' , value:'A'},
    //high_default: {name:'High' , value:'H'},
    //low_default: {name:'Low' , value:'L'}, */
    abnormal: {name:'Abnormal' , value:'[A]'},
    high: {name:'High' , value:'[H]'},
    low: {name:'Low' , value:'[L]'},
    crithigh: {name:'Critical High' , value:'[CH]'},
    critlow: {name:'Critical Low' , value:'[CL]'}
};

i2b2.CRC.ctrlr.labValues.ExpandedFlags.process = function(flagstouse) {
    let flagList = {};
    flagList.flagType = '[N]';
    flagList.flags = [{name:'Normal', value:'@'}];

    // incompatible with IE11 - for (const[flag, flagInfo] of Object.entries(i2b2.LabExpandedFlags.type)) {
    Object.entries(i2b2.CRC.ctrlr.labValues.ExpandedFlags.type).forEach(function(x) { flag=x[0]; flagInfo=x[1];
        if(flagstouse.indexOf(flagInfo.value) >=0 ) {
            flagList.flagType += flagInfo.value;
            flagList.flags.push(flagInfo);
        }
    });
    /* If we only have the normal flag, we don't need a flag list */
    if(flagList.flags.length === 1) {
        flagList.flagType = false;
        delete flagList.flags;
    }

    return flagList;
}
