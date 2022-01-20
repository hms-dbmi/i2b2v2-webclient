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

console.group('Load & Execute component file: WORK > SDX > Workplace Object');
console.time('execute time');

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
}

// *********************************************************************************
//	GENERATE RENDER DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.RenderData = function(sdxData, options) {
    // this function extracts the datatype from the SDX's original XML object and relies upon it's
    // original SDX type controller to retreve the render data
    var sdxCode = false;
    var sdxPackage = {};
    var subclassData = {};
    var newOptions = options;

    if (newOptions.title === undefined) newOptions.title = "";
    if (newOptions.showchildren === undefined) newOptions.showchildren = false;

    // TODO: Move this info processing out into the cells themselves (Encapsulate/Decapsulate duality functions)
    switch (sdxData.origData.encapType) {
        case "PREV_QUERY":
            // this is a QueryMaster object
            sdxCode = "QM";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::query_master_id/..")[0];
            // extract and create an SDX object for this node
            var o = {};
            o.xmlOrig = x;
            o.query_master_id = i2b2.h.getXNodeVal(x, "query_master_id");
            o.id = o.query_master_id;
            o.name = i2b2.h.getXNodeVal(x, "name");
            o.group = i2b2.h.getXNodeVal(x, "group_id");
            o.userid = i2b2.h.getXNodeVal(x, "user_id");
            o.created = null;
            newOptions.showchildren = false;
            if(o.name.indexOf("(t)") == 0) { // BUG FIX - WEBCLIENT-125
                newOptions.cssClass = "sdxStyleCRC-QMT";
                newOptions.icon = "sdx_CRC_QMT.gif";
            }
            if (newOptions.title == "") newOptions.title = o.name;
            break;
        case "PATIENT_COLL":
            // this is a PatientRecordSet object
            sdxCode = "PRS";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "PATIENTSET";
            o.size = i2b2.h.getXNodeVal(x, "set_size");
            o.result_instance_id = i2b2.h.getXNodeVal(x, "result_instance_id");
            o.PRS_id = o.result_instance_id;
            o.QI_id = i2b2.h.getXNodeVal(x, "query_instance_id");
            o.QM_id = o.QI_id; // TODO: This needs to be properly resolved
            o.start_date = i2b2.h.getXNodeVal(x, "start_date");
            o.end_date = i2b2.h.getXNodeVal(x, "end_date");
            o.description = i2b2.h.getXNodeVal(x, "description");
            o.title = sdxData.sdxInfo.sdxDisplayName
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-PRS";
            newOptions.icon = "sdx_CRC_PRS.jpg";
            newOptions.title = o.title;
            break;
        case "ENCOUNTER_COLL":
            // this is a EncounterRecordSet object
            sdxCode = "ENS";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            var o = {};
            o.xmlOrig = x;
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
            newOptions.icon = "sdx_CRC_PRS.jpg";
            newOptions.title = o.title;
            break;
        case "PATIENT":
            // this is an PatientRecord object
            sdxCode = "PR";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::patient/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "PATIENTSET";
            o.patient_id = i2b2.h.XPath(x, "descendant::patient/patient_id/text()")[0].nodeValue;
            o.PRS_id = i2b2.h.XPath(x, "@patient_set_id")[0].nodeValue;
            o.PRS_name = i2b2.h.XPath(x, "@patient_set_name")[0].nodeValue;
            o.title = sdxData.origData.name;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-PR";
            newOptions.icon = "sdx_CRC_PR.jpg";
            newOptions.title = o.title;
            break;
        case "CONCEPT":
            sdxCode = "CONCPT";
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant-or-self::concept")[0];
            var o = {};
            o.xmlOrig = x;
            o.key = i2b2.h.getXNodeVal(x, "key");
            o.level = i2b2.h.getXNodeVal(x, "level");
            o.name = i2b2.h.getXNodeVal(x, "name");
            o.column_name = i2b2.h.getXNodeVal(x, "columnname");
            o.dim_code = i2b2.h.getXNodeVal(x, "dimcode");
            o.operator = i2b2.h.getXNodeVal(x, "operator");
            o.table_name = i2b2.h.getXNodeVal(x, "tablename");
            o.tooltip = i2b2.h.getXNodeVal(x, "tooltip");
            o.hasChildren = i2b2.h.getXNodeVal(x, "visualattributes");
            newOptions.showchildren = false;
            newOptions.title = o.name;

/*
            o.cssClass = "sdxStyleONT-CONCPT";
            var bCanExp = false;
            if (o.hasChildren.substring(1,0) === "C"){
                // render as category
                icon = 'root';
                sDD = '';
                sIG = ' isGroup="Y"';
                bCanExp = true;
                o.cssClass += " CONCPT-root";
            } else if (o.hasChildren.substring(1,0) === "F")  {
                // render as possibly having children
                icon = 'branch';
                bCanExp = true;
                o.cssClass += " CONCPT-branch";
            } else if (o.hasChildren.substring(1,0) === "O")  {
                // render as possibly having children
                icon = 'root';
                bCanExp = true;
                o.cssClass += " CONCPT-root";
            } else if (o.hasChildren.substring(1,0) === "D") {
                // render as possibly having children
                icon = 'branch';
                bCanExp = true;
                o.cssClass += " CONCPT-branch";
            } else {
                // render as not having children
                var icon = 'leaf';
                bCanExp = false;
                o.cssClass += " CONCPT-leaf";
            }
*/
            break;
        case "PATIENT_COUNT_XML":
            // Patient Record Count
            sdxCode = "PRC";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_instance_id = i2b2.h.getXNodeVal(x, "result_instance_id");
            o.PRC_id = o.result_instance_id;
            o.QI_id = i2b2.h.getXNodeVal(x, "query_instance_id");
            o.QM_id = "";
            o.start_date = i2b2.h.getXNodeVal(x, "start_date");
            o.end_date = i2b2.h.getXNodeVal(x, "end_date");
            o.result_type = "PATIENT_COUNT_XML";
            o.size = i2b2.h.getXNodeVal(x, "set_size");
            if (o.size > 10) {
                o.title = "Patient Count - "+o.size+" patients";
            } else {
                if (i2b2.h.isSHRINE()) {
                    o.title = "Patient Count - 10 patients or less";
                } else {
                    o.title = "Patient Count - "+o.size+" patients";
                }
            }
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-PRC";
            newOptions.icon = "sdx_CRC_PRC.jpg";
            newOptions.title = o.title;
            break;
        case "GROUP_TEMPLATE":
            // Query Group Definition (Query Panel)
            sdxCode = "QGDEF";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::panel_number/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "GROUP_TEMPLATE";
            o.QGDEF_name = i2b2.h.XPath(x, "@name")[0].nodeValue;
            o.key = false;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-QGDEF";
            newOptions.icon = "sdx_CRC_QGDEF.jpg"
            break;
        case "QUERY_DEFINITION":
            sdxCode = "QDEF";
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::query_name/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "QUERY_DEFINITION";
            o.QDEF_name = i2b2.h.XPath(x,"//descendant::query_name/text()")[0].nodeValue;
            o.key = false;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleCRC-QDEF";
            newOptions.icon = "sdx_CRC_QDEF.jpg";
            break;
        default:
            var t = "No SDX Object exists to represent data-type "+sdxData.origData.encapType;
            console.warn(t);
            // encapsulate as a Generic XML object
            sdxCode = "XML";
            var o = {};
            var t = i2b2.h.XPath(sdxData.origData.xmlOrig, "descendant::work_xml")[0].childNodes;
            for (i=0; i<t.length; i++) {
                if (t[i].nodeType==1) {
                    o.xmlOrig = t[i];
                    break;
                }
            }
            o.result_type = "UNKNOWN";
            o.name = sdxData.origData.name; // inherit name from Workplace Node
            o.key = false;
            newOptions.showchildren = false;
            newOptions.cssClass = "sdxStyleWORK-XML";
            newOptions.icon = "sdx_WORK_XML.gif";
            break;
    }


//    newOptions.title = sdxData.origData.name;  // should this be the case or should this default to o.name???
    var sdxDataNode = false;
    var subclassData = false;
    if (sdxCode) {
        if (sdxDataNode = i2b2.sdx.Master.EncapsulateData(sdxCode, o)) {
            sdxDataNode.origData.name = options.title;
            sdxDataNode.sdxInfo.sdxDisplayName = options.title;
            sdxData.sdxUnderlyingPackage = sdxDataNode;
            subclassData = i2b2.sdx.Master.RenderData(sdxDataNode, newOptions);
        }
    }
    return subclassData;
};



// *********************************************************************************
//	GENERATE HTML (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.RenderHTML= function(sdxData, options, targetDiv) {
    console.warn("[i2b2.sdx.TypeControllers.WRK.RenderHTML] is deprecated!");
    // this function extracts the datatype from the SDX's original XML object and relies upon it's
    // original SDX type controller to render the HTML

    var sdxCode = false;
    var sdxPackage = {};
    var subclassHTML = "";
    var newOptions = options;
    newOptions.title = "";
    newOptions.showchildren = false;
    newOptions.click = "";
    newOptions.dblclick = "";
    switch (sdxData.origData.encapType) {
        case "PREV_QUERY":  // #### this is a QueryMaster object ####
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sdxCode = "QM";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::query_master_id/..")[0];
            // extract and create an SDX object for this node
            var o = {};
            o.xmlOrig = x;
            o.query_master_id = i2b2.h.getXNodeVal(x, "query_master_id");
            o.id = o.query_master_id;
            o.name = i2b2.h.getXNodeVal(x, "name");
            o.group = i2b2.h.getXNodeVal(x, "group_id");
            o.userid = i2b2.h.getXNodeVal(x, "user_id");
            o.created = null;
            if(o.name.indexOf("(t)") == 0) // BUG FIX - WEBCLIENT-125
                newOptions.icon = "sdx_CRC_QMT.gif";
            else
                newOptions.icon = "sdx_CRC_QM_workplace.jpg";
            newOptions.showchildren = false;
            newOptions.title = o.name;
            break;
        case "PATIENT_COLL":    //  #### this is a PatientRecordSet object ####
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sdxCode = "PRS";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "PATIENTSET";
            o.size = i2b2.h.getXNodeVal(x, "set_size");
            o.result_instance_id = i2b2.h.getXNodeVal(x, "result_instance_id");
            o.PRS_id = o.result_instance_id;
            o.QI_id = i2b2.h.getXNodeVal(x, "query_instance_id");
            o.QM_id = o.QI_id; // TODO: This needs to be properly resolved
            o.start_date = i2b2.h.getXNodeVal(x, "start_date");
            o.end_date = i2b2.h.getXNodeVal(x, "end_date");
            o.description = i2b2.h.getXNodeVal(x, "description");
            o.title = sdxData.sdxInfo.sdxDisplayName
            newOptions.icon = "sdx_CRC_PRS.jpg";
            newOptions.showchildren = false;
            newOptions.title = o.title;
            break;
        case "ENCOUNTER_COLL": // #### this is a EncounterRecordSet object ####
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sdxCode = "ENS";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            var o = {};
            o.xmlOrig = x;
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
            newOptions.icon = "sdx_CRC_PRS.jpg";
            newOptions.showchildren = false;
            newOptions.title = o.title;
            break;
        case "PATIENT": // #### this is an PatientRecord object ####
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sdxCode = "PR";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::patient/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "PATIENTSET";
            o.patient_id = i2b2.h.XPath(x, "descendant::patient/patient_id/text()")[0].nodeValue;
            o.PRS_id = i2b2.h.XPath(x, "@patient_set_id")[0].nodeValue;
            o.PRS_name = i2b2.h.XPath(x, "@patient_set_name")[0].nodeValue;
            o.title = sdxData.origData.name;
            newOptions.icon = "sdx_CRC_PR.jpg";
            newOptions.showchildren = false;
            newOptions.title = o.title;
            break;
        case "CONCEPT":
            sdxCode = "CONCPT";
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant-or-self::concept")[0];
            var o = {};
            o.xmlOrig = x;
            o.key = i2b2.h.getXNodeVal(x, "key");
            o.level = i2b2.h.getXNodeVal(x, "level");
            o.name = i2b2.h.getXNodeVal(x, "name");
            o.column_name = i2b2.h.getXNodeVal(x, "columnname");
            o.dim_code = i2b2.h.getXNodeVal(x, "dimcode");
            o.operator = i2b2.h.getXNodeVal(x, "operator");
            o.table_name = i2b2.h.getXNodeVal(x, "tablename");
            o.tooltip = i2b2.h.getXNodeVal(x, "tooltip");
            o.hasChildren = i2b2.h.getXNodeVal(x, "visualattributes");


            var bCanExp = false;
            if (o.hasChildren.substring(1,0) === "C"){
                // render as category
                icon = 'root';
                sDD = '';
                sIG = ' isGroup="Y"';
                bCanExp = true;
            } else if (o.hasChildren.substring(1,0) === "F")  {
                // render as possibly having children
                icon = 'branch';
                bCanExp = true;
                //var sCanExpand = ' canExpand="Y"';
            } else if (o.hasChildren.substring(1,0) === "O")  {
                // render as possibly having children
                icon = 'root';
                bCanExp = true;
                //var sCanExpand = ' canExpand="Y"';
            } else if (o.hasChildren.substring(1,0) === "D") {
                // render as possibly having children
                icon = 'branch';
                bCanExp = true;
                //var sCanExpand = ' canExpand="Y"';

            } else {
                // render as not having children
                var icon = 'leaf';
                bCanExp = false;
            }

            newOptions.icon = {
                root: "sdx_ONT_CONCPT_"+icon+".gif",
                branch: "sdx_ONT_CONCPT_"+icon+".gif",
                leaf: "sdx_ONT_CONCPT_"+icon+".gif"
            };
            newOptions.showchildren = false;
            newOptions.title = o.name;
            break;
        case "PATIENT_COUNT_XML":   // #### Patient Record Count ####
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sdxCode = "PRC";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges that perform no resolving
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::result_instance_id/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_instance_id = i2b2.h.getXNodeVal(x, "result_instance_id");
            o.PRC_id = o.result_instance_id;
            o.QI_id = i2b2.h.getXNodeVal(x, "query_instance_id");
            o.QM_id = "";
            o.start_date = i2b2.h.getXNodeVal(x, "start_date");
            o.end_date = i2b2.h.getXNodeVal(x, "end_date");
            o.result_type = "PATIENT_COUNT_XML";
            o.size = i2b2.h.getXNodeVal(x, "set_size");
            if (o.size > 10) {
                o.title = "Patient Count - "+o.size+" patients";
            } else {
                if (i2b2.h.isSHRINE()) {
                    o.title = "Patient Count - 10 patients or less";
                } else {
                    o.title = "Patient Count - "+o.size+" patients";
                }
            }
            newOptions.showchildren = false;
            newOptions.icon = "sdx_CRC_PRC.jpg"
            newOptions.title = o.title;
            break;
        case "GROUP_TEMPLATE":  // #### Query Group Definition (Query Panel) ####
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sdxCode = "QGDEF";
            // XPath query exploits faults in XML message namespace declarations to avoid creation of namespace resolver kluges
            var x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::panel_number/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "GROUP_TEMPLATE";
            o.QGDEF_name = i2b2.h.XPath(x, "@name")[0].nodeValue;
            o.key = false;
            newOptions.showchildren = false;
            newOptions.icon = "sdx_CRC_QGDEF.jpg"
            break;
        case "QUERY_DEFINITION":
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            sdxCode = "QDEF";
            x = i2b2.h.XPath(sdxData.origData.xmlOrig, "work_xml/descendant::query_name/..")[0];
            var o = {};
            o.xmlOrig = x;
            o.result_type = "QUERY_DEFINITION";
            o.QDEF_name = i2b2.h.XPath(x,"//descendant::query_name/text()")[0].nodeValue;
            o.key = false;
            newOptions.showchildren = false;
            newOptions.icon = "sdx_CRC_QDEF.jpg";
            break;
        default:
            // TODO: THIS NEEDS REFACTORING TO USE THE DEFAULT RENDER FOR THAT TYPE THEN MODIFY THE RETURNED VALUES!!!!
            // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            var t = "No SDX Object exists to represent data-type "+sdxData.origData.encapType;
            console.warn(t);
            // encapsulate as a Generic XML object
            sdxCode = "XML";
            var o = {};
            var t = i2b2.h.XPath(sdxData.origData.xmlOrig, "descendant::work_xml")[0].childNodes;
            for (i=0; i<t.length; i++) {
                if (t[i].nodeType==1) {
                    o.xmlOrig = t[i];
                    break;
                }
            }
            o.result_type = "UNKNOWN";
            o.name = sdxData.origData.name; // inherit name from Workplace Node
            o.key = false;
            newOptions.showchildren = false;
            newOptions.icon = "sdx_WORK_XML.gif";
            break;
    }


    newOptions.title = sdxData.origData.name;
    if (sdxCode) {
        var sdxDataNode = i2b2.sdx.Master.EncapsulateData(sdxCode, o);
        sdxDataNode.origData.name = options.title;
        sdxDataNode.sdxInfo.sdxDisplayName = options.title;
        sdxData.sdxUnderlyingPackage = sdxDataNode;
        subclassHTML = i2b2.sdx.Master.RenderHTML(targetDiv, sdxDataNode, newOptions);
    }
    return subclassHTML;
}

// *********************************************************************************
//	DRAG DROP PROXY CONTROLLER
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.DragDrop = function(id, config) {
    if (id) {
        this.init(id, 'WRK',{isTarget:true});
        this.initFrame();
    }
    var s = this.getDragEl().style;
    s.borderColor = "transparent";
    s.opacity = 0.75;
    s.filter = "alpha(opacity=75)";
    s.whiteSpace = "nowrap";
    s.overflow = "hidden";
    s.textOverflow = "ellipsis";
};
/* TODO: Reimplement drag and drop */


// *********************************************************************************
//	<BLANK> DROP HANDLER 
//	!!!! DO NOT EDIT - ATTACH YOUR OWN CUSTOM ROUTINE USING
//	!!!! THE i2b2.sdx.Master.setHandlerCustom FUNCTION
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.DropHandler = function(sdxData) {
    alert('[Workplace Object DROPPED] You need to create your own custom drop event handler.');
}
// ==========================================================================
i2b2.sdx.TypeControllers.WRK.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    if (i2b2Data.sdxUnderlyingPackage !== undefined) {
        delete i2b2Data.sdxUnderlyingPackage.origData.xmlOrig;
        delete i2b2Data.sdxUnderlyingPackage.origData.parent;
    }
    return i2b2Data;
};

// *********************************************************************************
//	DEPRECATED FUNCTIONS
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.AppendTreeNode = function() { console.error("[i2b2.sdx.TypeControllers.WRK.AppendTreeNode] is deprecated!"); }
i2b2.sdx.TypeControllers.WRK.SaveToDataModel = function() { console.error("[i2b2.sdx.TypeControllers.WRK.SaveToDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.WRK.LoadFromDataModel = function() { console.error("[i2b2.sdx.TypeControllers.WRK.LoadFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.WRK.ClearAllFromDataModel= function() { console.error("[i2b2.sdx.TypeControllers.WRK.ClearAllFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.WRK.onHoverOver = function() { console.error("[i2b2.sdx.TypeControllers.WRK.onHoverOver] is deprecated!"); }
i2b2.sdx.TypeControllers.WRK.onHoverOut = function() { console.error("[i2b2.sdx.TypeControllers.WRK.onHoverOut] is deprecated!"); }
i2b2.sdx.TypeControllers.WRK.AttachDrag2Data = function() { console.error("[i2b2.sdx.TypeControllers.WRK.AttachDrag2Data] is deprecated!"); }

console.timeEnd('execute time');
console.groupEnd();