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
    }
};

// ==================================================================================================
i2b2.CRC.ctrlr.labValues.extractDataType = function(sdxConcept, valueMetadataXml){

    let valueType = "NODATATYPE";
    let dataType = i2b2.h.getXNodeVal(valueMetadataXml, 'DataType');
    let GeneralValueType = valueType;
    if(i2b2.CRC.view[dataType] && typeof i2b2.CRC.view[dataType].getGeneralDataType === "function"){
        GeneralValueType = i2b2.CRC.view[dataType].getGeneralDataType();
    }
    else {
        if (dataType) GeneralValueType = i2b2.CRC.ctrlr.labValues.ValueTypes.getValueType(dataType);

        if (GeneralValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.NUMBER || GeneralValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.TEXT
            || GeneralValueType === i2b2.CRC.ctrlr.labValues.ValueTypes.GENERAL_VALUE.LARGETEXT) {
            GeneralValueType = "BASIC";
        }
    }
    return GeneralValueType;
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
};
// ==================================================================================================
i2b2.CRC.ctrlr.labValues.ValueTypes.getValueType = function(dataType)
{
    let valueType = i2b2.CRC.ctrlr.labValues.ValueTypes.type[dataType];
    if(!i2b2.CRC.ctrlr.labValues.ValueTypes.type.hasOwnProperty(dataType)) {
        valueType = dataType;
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
