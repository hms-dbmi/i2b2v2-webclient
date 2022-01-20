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
// *********************************************************************************
//	ENCAPSULATE DATA
// *********************************************************************************
/** 
 * Get the sdxInfo data template for all QueryMaster.
 * @memberOf i2b2.sdx.TypeControllers.QM
 * @method
 * @return {Object} Returns a data object containing sdxType, sdxKeyName, sdxControlCell info for QueryMaster-type objects.
 * @author Nick Benik
 * @version 1.0
 * @alias i2b2.sdx.Master.EncapsulateData
 */
i2b2.sdx.TypeControllers.QI.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'QI', sdxKeyName: 'query_instance_id', sdxControlCell:'CRC', sdxDisplayNameKey:'title'};
}

// *********************************************************************************
//	GENERATE HTML (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.QI.RenderHTML= function(sdxData, options, targetDiv) {
    console.warn("[i2b2.sdx.TypeControllers.QI.RenderHTML] is deprecated!");
    // OPTIONS:
    //	title: string
    //	showchildren: true | false
    //	cssClass: string
    //	icon: [data object]
    //		icon: 		(filename of img, appended to i2b2_root+cellDir + '/assets')
    //		iconExp: 	(filename of img, appended to i2b2_root+cellDir + '/assets')
    //	dragdrop: string (function name)
    //	context: string
    //	click: string
    //	dblclick: string

    if (Object.isUndefined(options)) { options = {}; }
    var render = {html: retHtml, htmlID: id};
    var conceptId = sdxData.name;
    var id = "CRC_ID-" + i2b2.GUID();

    // process drag drop controllers
    if (!Object.isUndefined(options.dragdrop)) {
// NOTE TO SELF: should attachment of node dragdrop controller be handled by the SDX system as well? 
// This would ensure removal of the onmouseover call in a cross-browser way
        var sDD = '  onmouseover="' + options.dragdrop + '(\''+ targetDiv.id +'\',\'' + id + '\')" ';
    } else {
        var sDD = '';
    }

    if (Object.isUndefined(options.cssClass)) { options.cssClass = 'sdxDefaultQI';}

    // user can override
    bCanExp = true;
    if (Object.isBoolean(options.showchildren)) {
        bCanExp = options.showchildren;
    }
    render.canExpand = bCanExp;
    render.iconType = "QI";

    if (!Object.isUndefined(options.icon)) { render.icon = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon }
    if (!Object.isUndefined(options.iconExp)) { render.iconExp = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.iconExp }
    // in cases of one set icon, copy valid icon to the missing icon
    if (Object.isUndefined(render.icon) && !Object.isUndefined(render.iconExp)) {	render.icon = sdxData.iconExp; }
    if (!Object.isUndefined(render.icon) && Object.isUndefined(render.iconExp)) {	render.iconExp = sdxData.icon; }

    // handle the event controllers
    var sMainEvents = sDD;
    var sImgEvents = sDD;

    // **** Render the HTML ***
    var retHtml = '<DIV id="' + id + '" ' + sMainEvents + ' style="white-space:nowrap;cursor:pointer;">';
    retHtml += '<DIV ';
    if (Object.isString(options.cssClass)) {
        retHtml += ' class="'+options.cssClass+'" ';
    } else {
        retHtml += ' class= "sdxDefaultQI" ';
    }
    retHtml += sImgEvents;
    retHtml += '>';
    retHtml += '<IMG src="'+render.icon+'"/> ';
    if (!Object.isUndefined(options.title)) {
        retHtml += options.title;
    } else {
        console.warn('[SDX RenderHTML] no title was given in the creation options for an CRC>QI node!');
        retHtml += ' QI '+id;
    }
    retHtml += '</DIV></DIV>';
    render.html = retHtml;
    render.htmlID =  id;
    var retObj = {};
    $.extend(retObj, sdxData);
    retObj.renderData = render;
    return retObj;
}



// *********************************************************************************
//	GENERATE RENDER DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.QI.RenderData = function(sdxData, options) {
    // function returns following data that is used for rendering (at a minimum)
    // === title
    // === iconImg (url)
    // === cssClassMain
    // === cssClassMinor
    // === moreDescriptMain
    // === moreDescriptMinor
    // === tvNodeState
    if (i2b2.h.isUndefined(options)) { options = {}; }
    // default QM icons
    if (!$.isPlainObject(options.icon)) {
        if (typeof options.icon == 'string') {
            var t = options.icon;
        } else {
            var t = 'sdx_CRC_QI.gif';
        }
        options.icon = {
            root: t,
            rootExp: t,
            branch: t,
            branchExp: t,
            leaf: t
        };
    }

    var nodeInfo = {
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

    if (!i2b2.h.isUndefined(options.cssClass)) nodeInfo.cssClassMain = options.cssClass;
    if (!i2b2.h.isUndefined(options.title)) {
        nodeInfo.title = options.title;
    } else  {
        nodeInfo.title = sdxData.sdxInfo.sdxDisplayName;
    }

    var bCanExp = false;
    if (options.showchildren === true) bCanExp = true;
    if (!bCanExp) {
        // cannot expand node
        nodeInfo.tvNodeState.loaded = true;
        nodeInfo.tvNodeState.expanded = true;
    }

    var icon = 'branch';
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
    if (!i2b2.h.isUndefined(options.icon[icon])) {
        nodeInfo.iconImg = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon[icon];
    }
    if (!i2b2.h.isUndefined(options.icon[icon+'Exp'])) {
        nodeInfo.iconImgExp = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon[icon+'Exp'];
    }
    // in cases of one set icon, copy valid icon to the missing icon
    if (i2b2.h.isUndefined(nodeInfo.iconImg) && !i2b2.h.isUndefined(nodeInfo.iconImgExp)) {	nodeInfo.iconImg = nodeInfo.iconImgExp; }
    if (!i2b2.h.isUndefined(nodeInfo.iconImg) && i2b2.h.isUndefined(nodeInfo.iconImgExp)) {	nodeInfo.iconImgExp = nodeInfo.iconImg; }

    // provide tooltip information if given
    if (typeof options.tooltip == 'string') nodeInfo.moreDescriptMinor = options.tooltip;

    return nodeInfo;
};


/** 
 * Get the child records for the given QueryInstance.
 * @param {Object} sdxParentNode	The parent node we want to find the children of.
 * @param {ScopedCallback} onCompleteCallback A scoped-callback function to be executed using the results array.
 * @return {Boolean} Returns true to the calling function.
 * @return {Array} Returns an array of QueryInstance data represented as SDX Objects (without render data) to the callback function passed.
 * @memberOf i2b2.sdx.TypeControllers.QI
 * @method
 * @author Nick Benik
 * @version 1.0
 * @alias i2b2.sdx.Master.getChildRecords
 */
i2b2.sdx.TypeControllers.QI.getChildRecords = function(sdxParentNode, onCompleteCallback, options) {
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = sdxParentNode;
    scopedCallback.callback = function(results) {
        var cl_node = sdxParentNode;
        var cl_onCompleteCB = onCompleteCallback;
        // THIS function is used to process the AJAX results of the getChild call
        //		results data object contains the following attributes:
        //			refXML: xmlDomObject <--- for data processing
        //			msgRequest: xml (string)
        //			msgResponse: xml (string)
        //			error: boolean
        //			errorStatus: string [only with error=true]
        //			errorMsg: string [only with error=true]

        var retMsg = {
            error: results.error,
            msgRequest: results.msgRequest,
            msgResponse: results.msgResponse,
            msgUrl: results.msgUrl,
            results: null
        };
        var retChildren = [];

        var keyValue = this.sdxInfo.sdxKeyValue.toString();
        var parent_QM = this.origData.query_master_id.toString();

        // extract records from XML msg
        var ps = results.refXML.getElementsByTagName('query_result_instance');
        for (var i1 = 0; i1 < ps.length; i1++) {
            var o = new Object;
            o.xmlOrig = ps[i1];
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
            if (i2b2.h.getXNodeVal(ps[i1], 'query_result_type/name') == "PATIENT_COUNT_XML") { //nw096
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

            if (i2b2.h.XPath(ps[i1], 'query_status_type/name/text()')[0].nodeValue != "COMPLETED") {
                o.title += " - " + i2b2.h.XPath(ps[i1], 'query_status_type/name/text()')[0].nodeValue;
            }

            o.result_type = i2b2.h.XPath(ps[i1], 'query_result_type/name/text()')[0].nodeValue;
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
                    var sdxDataNode = i2b2.sdx.Master.EncapsulateData('ENS', o);
                    break;
                case "PATIENTSET":
                    o.PRS_id = i2b2.h.getXNodeVal(ps[i1], 'result_instance_id');
                    o.titleCRC = o.title;
                    o.title = sdxParentNode.origData.QM_title + ' [PATIENTSET_' + o.PRS_id + ']';
                    o.result_instance_id = o.PRS_id;
                    var sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRS', o);
                    break;
                default:

                    o.PRC_id = i2b2.h.getXNodeVal(ps[i1], 'result_instance_id');
                    o.titleCRC = o.title;
                    //o.title = pn.parent.sdxInfo.sdxDisplayName + ' [PATIENT_COUNT_XML_'+o.PRC_id+']';
                    //o.title = 'PATIENT_COUNT_XML_'+o.PRC_id;
                    o.result_instance_id = o.PRC_id;
                    var sdxDataNode = i2b2.sdx.Master.EncapsulateData('PRC', o);
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
    }
    i2b2.CRC.ajax.getQueryResultInstanceList_fromQueryInstanceId("CRC:SDX:QueryInstance", {qi_key_value: sdxParentNode.sdxInfo.sdxKeyValue}, scopedCallback);
}



i2b2.sdx.TypeControllers.QI.LoadChildrenFromTreeview = function(node, onCompleteCallback) {
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = node.data.i2b2_SDX;
    scopedCallback.callback = function(retCellPack) {
        var cl_node = node;
        var cl_onCompleteCB = onCompleteCallback;

        var results = retCellPack.results;
        for(var i1=0; i1<1*results.length; i1++) {
            var o = results[i1];


            // add visual element
            switch (o.sdxInfo.sdxType) {
                case "PRS":	// patient record set
                    // add visual element
                     if (i2b2.PM.model.userRoles.indexOf("DATA_LDS") == -1) {
                        var renderOptions = {
                            dragdrop: "i2b2.sdx.TypeControllers.PRS.AttachDrag2Data",
                            icon: "sdx_CRC_PRS.jpg",
                            title: o.origData.titleCRC,
                            showchildren: false
                        };
                    } else {
                        var renderOptions = {
                            dragdrop: "i2b2.sdx.TypeControllers.PRS.AttachDrag2Data",
                            icon: "sdx_CRC_PRS.jpg",
                            title: o.origData.titleCRC,
                            showchildren: true
                        };
                    }
                    break;
                case "ENS":	// encounter record set
                    // add visual element
                     if (i2b2.PM.model.userRoles.indexOf("DATA_LDS") == -1) {
                        var renderOptions = {
                            dragdrop: "i2b2.sdx.TypeControllers.ENS.AttachDrag2Data",
                            icon: "sdx_CRC_PRS.jpg",
                            title: o.origData.titleCRC,
                            showchildren: false
                        };
                    } else {
                        var renderOptions = {
                            dragdrop: "i2b2.sdx.TypeControllers.ENS.AttachDrag2Data",
                            icon: "sdx_CRC_PRS.jpg",
                            title: o.origData.titleCRC,
                            showchildren: true
                        };
                        }
                    break;
                case "PRC":	// patient record count
                    var renderOptions = {
                        dragdrop: "i2b2.sdx.TypeControllers.PRC.AttachDrag2Data",
                        icon: "sdx_CRC_PRC.jpg",
                        title: o.origData.titleCRC,
                        showchildren: false
                    };
                    break;
            }

            var sdxRenderData = i2b2.sdx.Master.RenderHTML(cl_node.tree.id, o, renderOptions);
            i2b2.sdx.Master.AppendTreeNode(cl_node.tree, cl_node, sdxRenderData);
        }
        // handle the callback
        if (getObjectClass(cl_onCompleteCB)=='i2b2_scopedCallback') {
            cl_onCompleteCB.callback.call(cl_onCompleteCB.scope, retCellPack);
        } else {
            cl_onCompleteCB(retCellPack);
        }
    }
    var sdxParentNode = node.data.i2b2_SDX;
    var options = i2b2.CRC.params;
    i2b2.sdx.Master.getChildRecords(sdxParentNode, scopedCallback, options);
}



// *********************************************************************************
//	ATTACH DRAG TO DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.QI.AttachDrag2Data = function(divParentID, divDataID){
    if (Object.isUndefined($(divDataID))) {	return false; }

    // get the i2b2 data from the yuiTree node
    var tvTree = YAHOO.widget.TreeView.getTree(divParentID);
    var tvNode = tvTree.getNodeByProperty('nodeid', divDataID);
    if (!Object.isUndefined(tvNode.DDProxy)) { return true; }

    // attach DD
    var t = new i2b2.sdx.TypeControllers.QI.DragDrop(divDataID);
    t.yuiTree = tvTree;
    t.yuiTreeNode = tvNode;
    tvNode.DDProxy = t;

    // clear the mouseover attachment function
    var tdn = $(divDataID);
    if (!Object.isUndefined(tdn.onmouseover)) {
        try {
            delete tdn.onmouseover;
        } catch(e) {
            tdn.onmouseover;
        }
    }
    if (!Object.isUndefined(tdn.attributes)) {
        for (var i=0;i<tdn.attributes.length; i++) {
            if (tdn.attributes[i].name=="onmouseover") {
                try {
                    delete tdn.onmouseover;
                } catch(e) {
                    tdn.onmouseover;
                }
            }
        }
    }
}




// *********************************************************************************
//	DRAG DROP PROXY CONTROLLER
// *********************************************************************************
/* TODO: Reimplement drag and drop
*/


// *********************************************************************************
//	<BLANK> DROP HANDLER 
//	!!!! DO NOT EDIT - ATTACH YOUR OWN CUSTOM ROUTINE USING
//	!!!! THE i2b2.sdx.Master.setHandlerCustom FUNCTION
// *********************************************************************************
i2b2.sdx.TypeControllers.QI.DropHandler = function(sdxData) {
    alert('[QueryInstance DROPPED] You need to create your own custom drop event handler.');
}
// ==========================================================================
i2b2.sdx.TypeControllers.QI.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};

// *********************************************************************************
//	DEPRECATED FUNCTIONS
// *********************************************************************************
i2b2.sdx.TypeControllers.QI.AppendTreeNode = function() { console.error("[i2b2.sdx.TypeControllers.QI.AppendTreeNode] is deprecated!"); }
i2b2.sdx.TypeControllers.QI.SaveToDataModel = function() { console.error("[i2b2.sdx.TypeControllers.QI.SaveToDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.QI.LoadFromDataModel = function() { console.error("[i2b2.sdx.TypeControllers.QI.LoadFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.QI.ClearAllFromDataModel= function() { console.error("[i2b2.sdx.TypeControllers.QI.ClearAllFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.QI.onHoverOver = function() { console.error("[i2b2.sdx.TypeControllers.QI.onHoverOver] is deprecated!"); }
i2b2.sdx.TypeControllers.QI.onHoverOut = function() { console.error("[i2b2.sdx.TypeControllers.QI.onHoverOut] is deprecated!"); }

console.timeEnd('execute time');
console.groupEnd();
