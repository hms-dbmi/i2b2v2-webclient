/**
 * @projectDescription	The SDX controller library for the Workplace Object datatype.
 * @namespace	i2b2
 * @inherits 		i2b2
 * @author		Nick Benik
 * @version 		1.0
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 7-31-08: initial launch [Nick Benik] 
 * updated 1-12-09: added QDEF, QGDEF and default XML object handling for SDX subsystem
 */

// ********************************* Patient Record Set Stuff *********************************
i2b2.sdx.TypeControllers.WRK = {};
i2b2.sdx.TypeControllers.WRK.model = {};
// ********************************* Patient Record Set Stuff *********************************

// *********************************************************************************
//	ENCAPSULATE DATA
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'WRK', sdxKeyName: 'index', sdxControlCell:'WORK', sdxDisplayNameKey: 'name'};
};

// *********************************************************************************
//	GENERATE RENDER DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.RenderData = function(sdxData, options) {
    // this function extracts the datatype from the SDX's original XML object and relies upon it's
    // original SDX type controller to retreve the render data
    let sdxCode = false;
    let subclassData = {};
    let sdxDataNode;
    let newOptions = options;

    if (newOptions.title === undefined) newOptions.title = "";
    if (newOptions.showchildren === undefined) newOptions.showchildren = false;

    // TODO: Move this info processing out into the cells themselves (Encapsulate/Decapsulate duality functions)
    let o = {};
    let x;
    switch (sdxData.origData.encapType) {
        case "PREV_QUERY":
            // this is a QueryMaster object
            sdxCode = "QM";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::query_master_id/..")[0];
            // extract and create an SDX object for this node
            o.xmlOrig = x.outerHTML;
            o.query_master_id = i2b2.h.getXNodeVal(x, "query_master_id");
            o.id = o.query_master_id;
            o.name = i2b2.h.getXNodeVal(x, "name");
            o.group = i2b2.h.getXNodeVal(x, "group_id");
            o.userid = i2b2.h.getXNodeVal(x, "user_id");
            o.created = null;
            newOptions.showchildren = false;
            if(o.name.indexOf("(t)") === 0) { // BUG FIX - WEBCLIENT-125
                newOptions.cssClass = "sdxStyleCRC-QMT";
                newOptions.icon = "sdx_CRC_QM.svg";
            }
            if (newOptions.title === "") newOptions.title = o.name;
            break;
        case "PATIENT_COLL":
            // this is a PatientRecordSet object
            sdxCode = "PRS";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            o.xmlOrig = x.outerHTML;
            o.result_type = "PATIENTSET";
            o.size = i2b2.h.getXNodeVal(x, "set_size");
            o.result_instance_id = i2b2.h.getXNodeVal(x, "result_instance_id");
            o.PRS_id = o.result_instance_id;
            o.QI_id = i2b2.h.getXNodeVal(x, "query_instance_id");
            o.QM_id = o.QI_id; // TODO: This needs to be properly resolved
            o.start_date = i2b2.h.getXNodeVal(x, "start_date");
            o.end_date = i2b2.h.getXNodeVal(x, "end_date");
            o.description = i2b2.h.getXNodeVal(x, "description");
            o.title = sdxData.sdxInfo.sdxDisplayName;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-PRS";
            newOptions.icon = "sdx_CRC_PRS.svg";
            newOptions.title = o.title;
            break;
        case "ENCOUNTER_COLL":
            // this is a EncounterRecordSet object
            sdxCode = "ENS";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            o.xmlOrig = x.outerHTML;
            o.result_type = "ENCOUNTERSET";
            o.size = i2b2.h.getXNodeVal(x, "set_size");
            o.result_instance_id = i2b2.h.getXNodeVal(x, "result_instance_id");
            o.PRS_id = o.result_instance_id;
            o.QI_id = i2b2.h.getXNodeVal(x, "query_instance_id");
            o.QM_id = o.QI_id; // TODO: This needs to be properly resolved
            o.description = i2b2.h.getXNodeVal(x, "description");
            o.start_date = i2b2.h.getXNodeVal(x, "start_date");
            o.end_date = i2b2.h.getXNodeVal(x, "end_date");
            o.title = sdxData.sdxInfo.sdxDisplayName
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-PRS";
            newOptions.icon = "sdx_CRC_PRS.svg";
            newOptions.title = o.title;
            break;
        case "PATIENT":
            // this is an PatientRecord object
            sdxCode = "PR";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::patient/..")[0];
            o.xmlOrig = x.outerHTML;
            o.result_type = "PATIENTSET";
            o.patient_id = i2b2.h.XPath(x, "descendant::patient/patient_id/text()")[0].nodeValue;
            o.PRS_id = i2b2.h.XPath(x, "@patient_set_id")[0].nodeValue;
            o.PRS_name = i2b2.h.XPath(x, "@patient_set_name")[0].nodeValue;
            o.title = sdxData.origData.name;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-PR";
            newOptions.icon = "sdx_CRC_PR.svg";
            newOptions.title = o.title;
            break;
        case "CONCEPT":
            sdxCode = "CONCPT";
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant-or-self::concept")[0];
            o.xmlOrig = x.outerHTML;
            o.key = i2b2.h.getXNodeVal(x, "key");
            o.level = i2b2.h.getXNodeVal(x, "level");
            o.name = i2b2.h.getXNodeVal(x, "name");
            o.column_name = i2b2.h.getXNodeVal(x, "columnname");
            o.dim_code = i2b2.h.getXNodeVal(x, "dimcode");
            o.operator = i2b2.h.getXNodeVal(x, "operator");
            o.basecode= i2b2.h.getXNodeVal(x, "basecode");
            o.table_name = i2b2.h.getXNodeVal(x, "tablename");
            o.tooltip = i2b2.h.getXNodeVal(x, "tooltip");
            o.hasChildren = i2b2.h.getXNodeVal(x, "visualattributes");
            newOptions.showchildren = false;
            if (newOptions.title === "") newOptions.title = o.name;
            delete newOptions.icon; // ONT object can pick correct icon
            break;
        case "PATIENT_COUNT_XML":
            // Patient Record Count
            sdxCode = "PRC";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            o.xmlOrig = x.outerHTML;
            o.result_instance_id = i2b2.h.getXNodeVal(x, "result_instance_id");
            o.PRC_id = o.result_instance_id;
            o.QI_id = i2b2.h.getXNodeVal(x, "query_instance_id");
            o.QM_id = "";
            o.start_date = i2b2.h.getXNodeVal(x, "start_date");
            o.end_date = i2b2.h.getXNodeVal(x, "end_date");
            o.result_type = "PATIENT_COUNT_XML";
            o.size = i2b2.h.getXNodeVal(x, "set_size");
            /* Do not change title for now - revisit later
            if (o.size > 10) {
                o.title = "Patient Count - "+o.size+" patients";
            } else {
                if (i2b2.h.isSHRINE()) {
                    o.title = "Patient Count - 10 patients or less";
                } else {
                    o.title = "Patient Count - "+o.size+" patients";
                }
            }
               newOptions.title = o.title;
            */
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-PRC";
            newOptions.icon = "sdx_CRC_PRC.svg";
            break;
        case "GROUP_TEMPLATE":
            // Query Group Definition (Query Panel)
            sdxCode = "QGDEF";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::panel_number/..")[0];
            o.xmlOrig = x.outerHTML;
            o.result_type = "GROUP_TEMPLATE";
            o.QGDEF_name = i2b2.h.XPath(x, "@name")[0].nodeValue;
            o.key = false;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-QGDEF";
            newOptions.icon = "sdx_CRC_QGDEF.png";
            break;
        case "QUERY_DEFINITION":
            sdxCode = "QDEF";
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::query_name/..")[0];
            o.xmlOrig = x.outerHTML;
            o.result_type = "QUERY_DEFINITION";
            o.QDEF_name = i2b2.h.XPath(x,"//descendant::query_name/text()")[0].nodeValue;
            o.key = false;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-QDEF";
            newOptions.icon = "sdx_CRC_QDEF.png";
            break;
        case "FOLDER":
            sdxCode = "WRK"
            newOptions.showchildren = true;
            newOptions.cssClass = "sdxStyleWORK-WRK";
            newOptions.icon = "sdx_WORK_folder.svg";
            o.xmlOrig = sdxData.origData.xmlOrig;
            o.result_type = "FOLDER";
            o.index = sdxData.origData.key;
            o.name = sdxData.origData.name;
            o.visual = sdxData.origData.visual;
            o.isRoot = sdxData.origData.isRoot;
            break;
        default:
            console.warn("No SDX Object exists to represent data-type "+sdxData.origData.encapType);
            // encapsulate as a Generic XML object
            sdxCode = "XML";
            if(i2b2.h.XPath(sdxData.origData.xmlOrig, "descendant::work_xml").length > 0) {
                let t = i2b2.h.XPath(sdxData.origData.xmlOrig, "descendant::work_xml")[0].childNodes;
                for (i = 0; i < t.length; i++) {
                    if (t[i].nodeType === 1) {
                        o.xmlOrig = t[i].outerHTML;
                        break;
                    }
                }
                o.result_type = "UNKNOWN";
                o.name = sdxData.origData.name; // inherit name from Workplace Node
                o.key = false;
                newOptions.showchildren = false;
                newOptions.cssClass = "sdxStyleWORK-XML";
                newOptions.icon = "sdx_WORK_XML.svg";
            }
            break;
    }

    if (sdxCode) {
        //TODO: Is this if condition needed?
        if (sdxDataNode = i2b2.sdx.Master.EncapsulateData(sdxCode, o)) {
            if (sdxCode !== "WRK") {
                sdxData.sdxUnderlyingPackage = sdxDataNode;
                subclassData = i2b2.sdx.Master.RenderData(sdxDataNode, newOptions);
            } else {
                Object.assign(subclassData, newOptions);
            }
        }
    }
    return subclassData;
};



// *********************************************************************************
//	GENERATE HTML (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.RenderHTML= function(sdxData, options, targetDiv) {
    console.warn("[i2b2.sdx.TypeControllers.WRK.RenderHTML] is deprecated!");
};


// *********************************************************************************
//	<BLANK> DROP HANDLER 
//	!!!! DO NOT EDIT - ATTACH YOUR OWN CUSTOM ROUTINE USING
//	!!!! THE i2b2.sdx.Master.setHandlerCustom FUNCTION
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.DropHandler = function(sdxData) {
    alert('[Workplace Object DROPPED] You need to create your own custom drop event handler.');
};


// ==========================================================================
i2b2.sdx.TypeControllers.WRK.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.parent;
    if (i2b2Data.renderData !== undefined) delete i2b2Data.renderData.idDOM;
    if (i2b2Data.sdxUnderlyingPackage !== undefined) {
        delete i2b2Data.sdxUnderlyingPackage.origData.xmlOrig;
        delete i2b2Data.sdxUnderlyingPackage.origData.parent;
    }
    return i2b2Data;
};