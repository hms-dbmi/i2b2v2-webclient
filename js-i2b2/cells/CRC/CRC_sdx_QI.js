/**
 * @projectDescription	The SDX controller library for the QueryInstance data-type.
 * @namespace	i2b2.sdx.TypeControllers.QI
 * @inherits 	i2b2.sdx.TypeControllers
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: CRC > SDX > QueryInstance');
console.time('execute time');


i2b2.sdx.TypeControllers.QI = {};
i2b2.sdx.TypeControllers.QI.model = {};


// ==========================================================================
/** 
 * Get the sdxInfo data template for all QueryMaster.
 * @memberOf i2b2.sdx.TypeControllers.QM
 * @method
 * @return {Object} Returns a data object containing sdxType, sdxKeyName, sdxControlCell info for QueryMaster-type objects.
 * @alias i2b2.sdx.Master.EncapsulateData
 **/
i2b2.sdx.TypeControllers.QI.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'QI', sdxKeyName: 'query_instance_id', sdxControlCell:'CRC', sdxDisplayNameKey:'title'};
};


// ==========================================================================
i2b2.sdx.TypeControllers.QI.RenderData = function(sdxData, options) {
    // function returns following data that is used for rendering (at a minimum)
    // === title
    // === iconImg (url)
    // === cssClassMain
    // === cssClassMinor
    // === moreDescriptMain
    // === moreDescriptMinor
    // === tvNodeState
    if (options === undefined) { options = {}; }
    // default QI icons
    if (!$.isPlainObject(options.icon)) {
        let t = 'sdx_CRC_QI.gif';
        if (typeof options.icon === 'string') t = options.icon;
        options.icon = {
            root: t,
            rootExp: t,
            branch: t,
            branchExp: t,
            leaf: t
        };
    }

    let nodeInfo = {
        title: undefined,
        iconImg: undefined,
        iconImgExp: undefined,
        cssClassMain: "sdxStyleCRC-QI",
        cssClassMinor: undefined,
        moreDescriptMain: undefined,
        moreDescriptMinor: undefined,
        annotation: undefined,
        tvNodeState: {}
    };

    if (options.cssClass !== undefined) nodeInfo.cssClassMain = options.cssClass;
    if (options.title !== undefined) {
        nodeInfo.title = options.title;
    } else  {
        nodeInfo.title = sdxData.sdxInfo.sdxDisplayName;
    }

    if (options.showchildren === false) {
        // cannot expand node
        nodeInfo.tvNodeState.loaded = true;
        nodeInfo.tvNodeState.expanded = true;
    }

    let icon = 'branch';
    switch(icon) {
        case "root":
            nodeInfo.cssClassMinor = "tvRoot";
            break;
        case "branch":
            nodeInfo.cssClassMinor = "tvBranch";
            break;
        case "leaf":
            nodeInfo.cssClassMinor = "tvLeaf";
            nodeInfo.tvNodeState.loaded = true;
            nodeInfo.tvNodeState.expanded = true;
            break;
    }
    if (options.icon[icon] !== undefined) {
        nodeInfo.iconImg = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon[icon];
    }
    if (options.icon[icon+'Exp'] !== undefined) {
        nodeInfo.iconImgExp = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon[icon+'Exp'];
    }
    // in cases of one set icon, copy valid icon to the missing icon
    if ((nodeInfo.iconImg === undefined) && (nodeInfo.iconImgExp !== undefined)) {	nodeInfo.iconImg = nodeInfo.iconImgExp; }
    if ((nodeInfo.iconImg !== undefined) && (nodeInfo.iconImgExp === undefined)) {	nodeInfo.iconImgExp = nodeInfo.iconImg; }

    // provide tooltip information if given
    if (typeof options.tooltip === 'string') nodeInfo.moreDescriptMinor = options.tooltip;

    return nodeInfo;
};


// ==========================================================================
/**
 * Get the child records for the given QueryInstance.
 * @param {Object} sdxParentNode	The parent node we want to find the children of.
 * @param {ScopedCallback} onCompleteCallback A scoped-callback function to be executed using the results array.
 * @return {Boolean} Returns true to the calling function.
 * @return {Array} Returns an array of QueryInstance data represented as SDX Objects (without render data) to the callback function passed.
 * @memberOf i2b2.sdx.TypeControllers.QI
 * @method
 * @alias i2b2.sdx.Master.getChildRecords
 **/
i2b2.sdx.TypeControllers.QI.getChildRecords = function(sdxParentNode, onCompleteCallback, options) {
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = sdxParentNode;
    scopedCallback.callback = function(results) {
        let cl_node = sdxParentNode;
        let cl_onCompleteCB = onCompleteCallback;
        // THIS function is used to process the AJAX results of the getChild call
        //		results data object contains the following attributes:
        //			refXML: xmlDomObject <--- for data processing
        //			msgRequest: xml (string)
        //			msgResponse: xml (string)
        //			error: boolean
        //			errorStatus: string [only with error=true]
        //			errorMsg: string [only with error=true]

        let retMsg = {
            error: results.error,
            msgRequest: results.msgRequest,
            msgResponse: results.msgResponse,
            msgUrl: results.msgUrl,
            results: null
        };
        let retChildren = [];

        let keyValue = this.sdxInfo.sdxKeyValue.toString();
        let parent_QM = this.origData.query_master_id.toString();

        // extract records from XML msg
        let ps = results.refXML.getElementsByTagName('query_result_instance');
        for (let i1 = 0; i1 < ps.length; i1++) {
            let o = {};
            o.xmlOrig = ps[i1].outerHTML;
            o.QI_id = keyValue;
            o.QM_id = parent_QM;
            o.size = i2b2.h.getXNodeVal(ps[i1], 'set_size');
            o.start_date = i2b2.h.getXNodeVal(ps[i1], 'start_date');
            o.end_date = i2b2.h.getXNodeVal(ps[i1], 'end_date');
            try {
                //o.title = i2b2.h.getXNodeVal(ps[i1],'description'); //[0].nodeValue;
                o.title = i2b2.h.getXNodeVal(ps[i1], 'query_result_instance/description');
            } catch (e) {
                o.title = i2b2.h.getXNodeVal(ps[i1], 'name');
            }
            if (i2b2.h.getXNodeVal(ps[i1], 'query_result_type/name') === "PATIENT_COUNT_XML") { //nw096
                if (i2b2.PM.model.isObfuscated) {
                    if (parseInt(i2b2.h.getXNodeVal(ps[i1], 'query_result_instance/set_size')) < 4) {
                        o.title += " is <span style='background: #C9F3C9;font-weight:bold;padding: 2px;color: #0C5D0C;'>&lt;" + i2b2.UI.cfg.obfuscatedDisplayNumber.toString() + "</span>";
                    } else {
                        o.title += " is <span style='background: #C9F3C9;font-weight:bold;padding: 2px;color: #0C5D0C;'>" + i2b2.h.getXNodeVal(ps[i1], 'query_result_instance/set_size') + "&plusmn;" + i2b2.UI.cfg.obfuscatedDisplayNumber.toString() + "</span>";
                    }
                } else {
                    o.title += " is <span style='background: #C9F3C9;font-weight:bold;padding: 2px;color: #0C5D0C;'>" + i2b2.h.getXNodeVal(ps[i1], 'query_result_instance/set_size') + "</span>";
                }
            }

            if (i2b2.h.XPath(ps[i1], 'query_status_type/name/text()')[0].nodeValue !== "COMPLETED") {
                o.title += " - " + i2b2.h.XPath(ps[i1], 'query_status_type/name/text()')[0].nodeValue;
            }

            o.result_type = i2b2.h.XPath(ps[i1], 'query_result_type/name/text()')[0].nodeValue;
            let sdxDataNode;
            switch (o.result_type) {
                case "PATIENT_ENCOUNTER_SET":
                    o.PRS_id = i2b2.h.getXNodeVal(ps[i1], 'result_instance_id');
                    // use given title if it exist otherwise generate a title
                    /*
                     try {
                     var t = i2b2.h.XPath(temp,'self::description')[0].firstChild.nodeValue;
                     } catch(e) { var t = null; }
                     if (!t) { t="Encounter Set"; }
                     // create the title using shrine setting
                     if (o.size >= 10) {
                     if (i2b2.PM.model.userRoles.length == 1 && i2b2.PM.model.userRoles[0] == "DATA_OBFSC") {
                     o.title = t+" - "+o.size+"&plusmn;3 encounters";
                     } else {
                     o.title = t+" - "+o.size+" encounters";
                     }
                     } else {
                     if (i2b2.PM.model.userRoles.length == 1 && i2b2.PM.model.userRoles[0] == "DATA_OBFSC") {
                     o.title = t+" - 10 encounters or less";
                     } else {
                     o.title = t+" - "+o.size+" encounters";
                     }
                     } */
                    o.titleCRC = o.title;
                    o.title = sdxParentNode.origData.QM_title + ' [PATIENT_ENCOUNTER_SET_' + o.PRS_id + ']';
                    o.result_instance_id = o.PRS_id;
                    sdxDataNode = i2b2.sdx.Master.EncapsulateData('ENS', o);
                    break;
                case "PATIENTSET":
                    o.PRS_id = i2b2.h.getXNodeVal(ps[i1], 'result_instance_id');
                    o.titleCRC = o.title;
                    o.title = sdxParentNode.origData.QM_title + ' [PATIENTSET_' + o.PRS_id + ']';
                    o.result_instance_id = o.PRS_id;
                    sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRS', o);
                    break;
                default:

                    o.PRC_id = i2b2.h.getXNodeVal(ps[i1], 'result_instance_id');
                    o.titleCRC = o.title;
                    //o.title = pn.parent.sdxInfo.sdxDisplayName + ' [PATIENT_COUNT_XML_'+o.PRC_id+']';
                    //o.title = 'PATIENT_COUNT_XML_'+o.PRC_id;
                    o.result_instance_id = o.PRC_id;
                    sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRC', o);
                    break;
            }

            // append the data node to our returned results
            retChildren.push(sdxDataNode);
        }

        retMsg.results = retChildren;

        if (cl_onCompleteCB instanceof i2b2_scopedCallback) {
            cl_onCompleteCB.callback.call(cl_onCompleteCB.scope, retMsg);
        } else {
            cl_onCompleteCB(retMsg);
        }
    };
    i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("CRC:SDX:QueryInstance", {qi_key_value: sdxParentNode.sdxInfo.sdxKeyValue}, scopedCallback);
};


// ==========================================================================
i2b2.sdx.TypeControllers.QI.DropHandler = function(sdxData) {
    alert('[QueryInstance DROPPED] You need to create your own custom drop event handler.');
};


// ==========================================================================
i2b2.sdx.TypeControllers.QI.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.parent;
    if (i2b2Data.renderData !== undefined) delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};


// ==========================================================================
console.timeEnd('execute time');
console.groupEnd();
