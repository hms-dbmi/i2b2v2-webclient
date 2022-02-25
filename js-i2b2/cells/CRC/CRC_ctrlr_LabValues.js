/**
 * @projectDescription	The main controller for the history viewport. (CRC's "previous queries" functionality)
 * @inherits 	i2b2.CRC.ctrlr
 * @namespace	i2b2.CRC.ctrlr.history
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > ctrlr > LabValues');
console.time('execute time');


i2b2.CRC.ctrlr.labValues = {
    clickedID: false,
    extractedModel: {
        name: "RND-TEST",
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
            console.log("DEBUG: valueMetaData: ", valueMetaDataArr);
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

        // work with the data type
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
                    var t1 = i2b2.h.XPath(refXML,"descendant::EnumValues/Val");

                    var t2 = [];
                    for (let i=0; i<t1.length; i++) {
                        let name;
                        if (t1[i].attributes[0].nodeValue !== "" ) {
                            name = t1[i].attributes[0].nodeValue;
                        } else {
                            name = t1[i].childNodes[0].nodeValue;
                        }
                        t2[(t1[i].childNodes[0].nodeValue)] = name;
                    }
                    this.extractedModel.enumInfo = t2;

                    // remove any Enums found in <CommentsDeterminingExclusion> section
                    let t = i2b2.h.XPath(refXML,"descendant::CommentsDeterminingExclusion/Com/text()");
                    let exclusionArr = [];
                    for (var i=0; i<t.length; i++) {
                        exclusionArr.push(t[i].nodeValue);
                    }
                    t = exclusionArr.uniq();
                    if (t.length > 0) {
                        for (let i=0;i<t.length; i++){
                            for (var i2=0;i2<this.extractedModel.enumInfo.length; i2++) {
                                if (this.extractedModel.enumInfo[i2].indexOf(t[i]) > -1 ) {
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
    },
}


console.timeEnd('execute time');
console.groupEnd();