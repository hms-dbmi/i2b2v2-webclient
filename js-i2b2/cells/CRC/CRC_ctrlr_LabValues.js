/**
 * @projectDescription	The main controller for the lab values viewport.
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.labValues
 * @author		Marc-Danie Nazaire
 * ----------------------------------------------------------------------------------------
 */
console.group('Load & Execute component file: CRC > ctrlr > LabValues');
console.time('execute time');


i2b2.CRC.ctrlr.labValues = {
    extractedModel: {
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
    },
// ================================================================================================== //
    loadData: function(sdxConcept, callBack) {
        let labResponseCallback = function(response) {
            try {
                new ActiveXObject("MSXML2.DOMDocument.6.0");
                isActiveXSupported = true;
            } catch (e) {
                isActiveXSupported = false;
            }
            let c;
            if (isActiveXSupported) {
                //Internet Explorer
                xmlDocRet = new ActiveXObject("Microsoft.XMLDOM");
                xmlDocRet.async = "false";
                xmlDocRet.loadXML(response.msgResponse);
                xmlDocRet.setProperty("SelectionLanguage", "XPath");
                c = i2b2.h.XPath(xmlDocRet, 'descendant::concept');
            } else {
                c = i2b2.h.XPath(response.refXML, 'descendant::concept');
            }
            if (c.length > 0) {
                sdxConcept.origData.xmlOrig = c[0];
            }

            const valueMetaDataArr = i2b2.h.XPath(sdxConcept.origData.xmlOrig, "metadataxml/ValueMetadata[string-length(Version)>0]");
            if (valueMetaDataArr.length > 0) {
                i2b2.CRC.ctrlr.labValues.extractLabValues(valueMetaDataArr[0]);
            }

            callBack();
        }

        i2b2.ONT.ajax.GetTermInfo("ONT", {concept_key_value:sdxConcept.origData.key,
            ont_max_records: 'max="1"', ont_synonym_records: true, ont_hidden_records: true}, labResponseCallback );
    },

// ================================================================================================== //
    extractLabValues: function(valueMetaDataXml) {
        const flagsToUse = i2b2.h.getXNodeVal(valueMetaDataXml, "Flagstouse");

        this.extractedModel.flagType = false;
        if (flagsToUse) {
            if (flagsToUse === "A") {
                this.extractedModel.flagType = "NA";
                this.extractedModel.flags = [{name: "Normal", value: "@"}, {name: "Abnormal", value: "A"}];
            } else if (flagsToUse === "HL") {
                this.extractedModel.flagType = "HL";
                this.extractedModel.flags = [{name: "Normal", value: "@"}, {name: "High", value: "H'"}, {
                    name: "Low",
                    value: "L"
                }];
            }
        }

        this.extractedModel.enumInfo = [];
        this.extractedModel.valueUnits = [];
        try {
            let dataType = i2b2.h.getXNodeVal(valueMetaDataXml, "DataType");
            switch (dataType) {
                case "PosFloat":
                    this.extractedModel.valueType = "POSFLOAT";
                    this.extractedModel.valueValidate.onlyPos = true;
                    this.extractedModel.valueValidate.onlyInt = false;
                    this.extractedModel.valueValidate.maxString = false;
                    break;
                case "PosInteger":
                    this.extractedModel.valueType = "POSINT";
                    this.extractedModel.valueValidate.onlyPos = true;
                    this.extractedModel.valueValidate.onlyInt = true;
                    this.extractedModel.valueValidate.maxString = false;
                    break;
                case "Float":
                    this.extractedModel.valueType = "FLOAT";
                    this.extractedModel.valueValidate.onlyPos = false;
                    this.extractedModel.valueValidate.onlyInt = false;
                    this.extractedModel.valueValidate.maxString = false;
                    break;
                case "Integer":
                    this.extractedModel.valueType = "INT";
                    this.extractedModel.valueValidate.onlyPos = true;
                    this.extractedModel.valueValidate.onlyInt = true;
                    this.extractedModel.valueValidate.maxString = false;
                    break;
                case "String":
                    this.extractedModel.valueType = "STR";
                    this.extractedModel.valueValidate.onlyPos = false;
                    this.extractedModel.valueValidate.onlyInt = false;

                    // extract max string setting
                    let strMaxStringLength;
                    try {
                        strMaxStringLength = valueMetaDataXml.getElementsByTagName('MaxStringLength')[0].firstChild.nodeValue;
                        strMaxStringLength = parseInt(strMaxStringLength);
                    } catch (e) {
                        strMaxStringLength = -1;
                    }
                    if (strMaxStringLength > 0) {
                        this.extractedModel.valueValidate.maxString = dataType;
                    } else {
                        this.extractedModel.valueValidate.maxString = false;
                    }
                    break;
                case "largestring":
                    this.extractedModel.valueType = "LRGSTR";
                    this.extractedModel.valueValidate.onlyPos = false;
                    this.extractedModel.valueValidate.onlyInt = false;
                    // extract max string setting
                    let lrgMaxStringLength;
                    try {
                        lrgMaxStringLength = valueMetaDataXml.getElementsByTagName('MaxStringLength')[0].firstChild.nodeValue;
                        lrgMaxStringLength = parseInt(dataType);
                    } catch (e) {
                        lrgMaxStringLength = -1;
                    }
                    if (lrgMaxStringLength > 0) {
                        this.extractedModel.valueValidate.maxString = dataType;
                    } else {
                        this.extractedModel.valueValidate.maxString = false;
                    }
                    break;
                case "Enum":
                    this.extractedModel.valueType = "ENUM";
                    this.extractedModel.valueValidate.onlyPos = false;
                    this.extractedModel.valueValidate.onlyInt = false;
                    this.extractedModel.valueValidate.maxString = false;
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
                    this.extractedModel.enumInfo = enumValuesObj;

                    // remove any Enums found in <CommentsDeterminingExclusion> section
                    let commentsDetExclusion = i2b2.h.XPath(valueMetaDataXml,"descendant::CommentsDeterminingExclusion/Com/text()");
                    let exclusionArr = [];
                    for (let i=0; i<commentsDetExclusion.length; i++) {
                        if(exclusionArr.indexOf(commentsDetExclusion[i].nodeValue) === -1)
                        exclusionArr.push(commentsDetExclusion[i].nodeValue);
                    }
                    commentsDetExclusion = exclusionArr;
                    if (commentsDetExclusion.length > 0) {
                        for (let i=0;i<commentsDetExclusion.length; i++){
                            for (let i2=0;i2<this.extractedModel.enumInfo.length; i2++) {
                                if (this.extractedModel.enumInfo[i2].indexOf(commentsDetExclusion[i]) > -1 ) {
                                    this.extractedModel.enumInfo[i2] = null;
                                }
                            }
                            // clean up the array
                            this.extractedModel.enumInfo = this.extractedModel.enumInfo.compact();
                        }
                    }
                    break;
                default:
                    this.extractedModel.valueType = false;

            }
        }
        catch(e) {
            this.extractedModel.valueType = false;
            this.extractedModel.valueValidate.onlyPos = false;
            this.extractedModel.valueValidate.onlyInt = false;
            this.extractedModel.valueValidate.maxString = false;
        }

        // set the title bar (TestName and TestID are assumed to be mandatory)
        if (this.extractedModel.valueType === "LRGSTR") {
            this.extractedModel.name("Search within the " + i2b2.h.getXNodeVal(valueMetaDataXml, 'TestName'));
        }else{
            this.extractedModel.name = "Choose value of "+i2b2.h.getXNodeVal(valueMetaDataXml, 'TestName')+" (Test:"+i2b2.h.getXNodeVal(valueMetaDataXml, 'TestID')+")";
        }

        //lab units
        let tProcessing = {};
        try {
            // save list of all possible units (from)
            let allUnits = i2b2.h.XPath(valueMetaDataXml,"descendant::UnitValues/descendant::text()[parent::NormalUnits or parent::EqualUnits or parent::Units]");
            let allUnitsArr = [];
            for (let i=0; i<allUnits.length; i++) {
                if(allUnitsArr.indexOf(allUnits[i].nodeValue) === -1)
                {
                    allUnitsArr.push(allUnits[i].nodeValue);
                }
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
                if(normalUnitsArr.indexOf(normalUnits[i].nodeValue) === -1)
                {
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

        this.extractedModel.valueUnits = Object.values(tProcessing);


        var nBarLength = 520; // fixed width of bar
        //fd.bHidebar = false;  // set to true if decide bar not worth showing
        var nSituation = 0; // how many values are there?
        this.extractedModel.rangeInfo = {};
        //
        // get preliminary bar length results and set up array
        try {
            this.extractedModel.rangeInfo.LowOfToxic = parseFloat(valueMetaDataXml.getElementsByTagName('LowofToxicValue')[0].firstChild.nodeValue);
            nSituation = nSituation +1;
        } catch(e) {}
        try {
            this.extractedModel.rangeInfo.LowOfLow = parseFloat(valueMetaDataXml.getElementsByTagName('LowofLowValue')[0].firstChild.nodeValue);
            if ((isFinite(this.extractedModel.rangeInfo.LowOfToxic)) && (this.extractedModel.rangeInfo.LowOfToxic === this.extractedModel.rangeInfo.LowOfLow)) {
                this.extractedModel.rangeInfo.LowOfLowRepeat = true;
            }
            else {
                this.extractedModel.rangeInfo.LowOfLowRepeat = false;
                nSituation = nSituation +1;
            }
        } catch(e) {}
        try {
            this.extractedModel.rangeInfo.HighOfLow = parseFloat(valueMetaDataXml.getElementsByTagName('HighofLowValue')[0].firstChild.nodeValue);
            if ((isFinite(this.extractedModel.rangeInfo.LowOfLow)) && (this.extractedModel.rangeInfo.LowOfLow === this.extractedModel.rangeInfo.HighOfLow)) {
                this.extractedModel.rangeInfo.HighOfLowRepeat = true;
            }
            else {
                this.extractedModel.rangeInfo.HighOfLowRepeat = false;
                nSituation = nSituation +1;
            }
        } catch(e) {}
        try {
            this.extractedModel.rangeInfo.HighOfToxic = parseFloat(valueMetaDataXml.getElementsByTagName('HighofToxicValue')[0].firstChild.nodeValue);
            nSituation = nSituation +1;
        } catch(e) {}
        try {
            this.extractedModel.rangeInfo.HighOfHigh = parseFloat(valueMetaDataXml.getElementsByTagName('HighofHighValue')[0].firstChild.nodeValue);
            if ((isFinite(this.extractedModel.rangeInfo.HighOfToxic)) && (this.extractedModel.rangeInfo.HighOfToxic === this.extractedModel.rangeInfo.HighOfHigh)) {
                this.extractedModel.rangeInfo.HighOfHighRepeat = true;
            }
            else {
                this.extractedModel.rangeInfo.HighOfHighRepeat = false;
                nSituation = nSituation +1;
            }
        } catch(e) {}
        try {
            this.extractedModel.rangeInfo.LowOfHigh = parseFloat(valueMetaDataXml.getElementsByTagName('LowofHighValue')[0].firstChild.nodeValue);
            if ((isFinite(this.extractedModel.rangeInfo.HighOfHigh)) && (this.extractedModel.rangeInfo.HighOfHigh === this.extractedModel.rangeInfo.LowOfHigh)) {
                this.extractedModel.rangeInfo.LowOfHighRepeat = true;
            }
            else {
                this.extractedModel.rangeInfo.LowOfHighRepeat = false;
                nSituation = nSituation +1;
            }
        } catch(e) {}
        this.extractedModel.rangeInfo.total = nSituation;
    },
}


console.timeEnd('execute time');
console.groupEnd();