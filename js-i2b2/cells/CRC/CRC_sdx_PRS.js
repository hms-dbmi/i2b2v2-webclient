/**
 * @projectDescription	The SDX controller library for the PatientRecordSet data-type.
 * @namespace	i2b2.sdx.TypeControllers.PRS
 * @inherits 	i2b2.sdx.TypeControllers
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: CRC > SDX > Patient Record Set');
console.time('execute time');


i2b2.sdx.TypeControllers.PRS = {};
i2b2.sdx.TypeControllers.PRS.model = {};
// *********************************************************************************
//	ENCAPSULATE DATA
// *********************************************************************************
i2b2.sdx.TypeControllers.PRS.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'PRS', sdxKeyName: 'result_instance_id', sdxControlCell:'CRC', sdxDisplayNameKey: 'title'};
}

// *********************************************************************************
//	GENERATE RENDER DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.PRS.RenderData = function(sdxData, options) {
    // function returns following data that is used for rendering (at a minimum)
    // === title
    // === iconImg (url)
    // === cssClassMain
    // === cssClassMinor
    // === moreDescriptMain
    // === moreDescriptMinor
    // === tvNodeState
    if (i2b2.h.isUndefined(options)) { options = {}; }
    // default ENS icons
    if (!$.isArray(options.icon)) {
        if (typeof options.icon == 'string') {
            var t = options.icon;
        } else {
            var t = 'sdx_CRC_PRS.jpg';
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
        cssClassMain: "sdxStyleCRC-PRS",
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

// *********************************************************************************
//	GENERATE HTML (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.PRS.RenderHTML= function(sdxData, options, targetDiv) {
    console.warn("[i2b2.sdx.TypeControllers.PRS.RenderHTML] is deprecated!");
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

    if (Object.isUndefined(options.cssClass)) { options.cssClass = 'sdxDefaultPRS';}

    // user can override
    bCanExp = true;
    if (Object.isBoolean(options.showchildren)) {
        bCanExp = options.showchildren;
    }
    render.canExpand = bCanExp;
    render.iconType = "PRS";

    if (!Object.isUndefined(options.icon)) { render.icon = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon }
    if (!Object.isUndefined(options.iconExp)) { render.iconExp = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.iconExp }
    // in cases of one set icon, copy valid icon to the missing icon
    if (Object.isUndefined(render.icon) && !Object.isUndefined(render.iconExp)) {	render.icon = render.iconExp; }
    if (!Object.isUndefined(render.icon) && Object.isUndefined(render.iconExp)) {	render.iconExp = render.icon; }

    // handle the event controllers
    var sMainEvents = sDD;
    var sImgEvents = sDD;

    // **** Render the HTML ***
    var retHtml = '<DIV id="' + id + '" ' + sMainEvents + ' style="white-space:nowrap;cursor:pointer;">';
    retHtml += '<DIV ';
    if (Object.isString(options.cssClass)) {
        retHtml += ' class="'+options.cssClass+'" ';
    } else {
        retHtml += ' class= "sdxDefaultPRS" ';
    }
    retHtml += sImgEvents;
    retHtml += '>';
    retHtml += '<IMG src="'+render.icon+'"/> ';
    if (!Object.isUndefined(options.title)) {
        retHtml += options.title;
    } else {
        console.warn('[SDX RenderHTML] no title was given in the creation options for an CRC > PRS node!');
        retHtml += ' PRS '+id;
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
//	ATTACH DRAG TO DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.PRS.AttachDrag2Data = function(divParentID, divDataID){
    if (Object.isUndefined($(divDataID))) {	return false; }

    // get the i2b2 data from the yuiTree node
    var tvTree = YAHOO.widget.TreeView.getTree(divParentID);
    var tvNode = tvTree.getNodeByProperty('nodeid', divDataID);
    if (!Object.isUndefined(tvNode.DDProxy)) { return true; }

    // attach DD
    var t = new i2b2.sdx.TypeControllers.PRS.DragDrop(divDataID)
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

/** 
 * Get the child records for the given PatientRecordSet.
 * @param {Object} sdxParentNode	The parent node we want to find the children of.
 * @param {ScopedCallback} onCompleteCallback A scoped-callback function to be executed using the results array.
 * @return {Boolean} Returns true to the calling function.
 * @return {Array} Returns an array of PatientRecord data represented as SDX Objects (without render data) to the callback function passed.
 * @memberOf i2b2.sdx.TypeControllers.QI
 * @method
 * @author Nick Benik
 * @version 1.0
 * @alias i2b2.sdx.Master.getChildRecords
 */
i2b2.sdx.TypeControllers.PRS.getChildRecords = function(sdxParentNode, onCompleteCallback, options) {
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

        // extract records from XML msg
        var ps = results.refXML.getElementsByTagName('patient');
        var dm = i2b2.CRC.model.QueryMasters;
        for(var i1=0; i1<ps.length; i1++) {
            var o = new Object;
            o.xmlOrig = ps[i1];
            o.patient_id = i2b2.h.getXNodeVal(ps[i1],'patient_id');
//			if (!Object.isUndefined(i2b2.h.XPath(ps[i1],'param[@name="vital_status_cd"]/text()')[0])) {
//				o.vital_status = i2b2.h.XPath(ps[i1],'param[@name="vital_status_cd"]/text()')[0].nodeValue;
//			}
            if ((i2b2.h.XPath(ps[i1],'param[@column="age_in_years_num"]/text()')[0]) != null) {
                o.age = i2b2.h.XPath(ps[i1],'param[@column="age_in_years_num"]/text()')[0].nodeValue;
            } else {
                o.age = "NA";
            }
            if ((i2b2.h.XPath(ps[i1],'param[@column="sex_cd"]/text()')[0]) != null) {
                o.sex = i2b2.h.XPath(ps[i1],'param[@column="sex_cd"]/text()')[0].nodeValue;
            } else {
                o.sex = "NA";
            }
            if ((i2b2.h.XPath(ps[i1],'param[@column="race_cd"]/text()')[0]) != null) {
                o.race = i2b2.h.XPath(ps[i1],'param[@column="race_cd"]/text()')[0].nodeValue;
            } else {
                o.race = "NA";
            }
            o.title = o.patient_id+" ["+o.age+" y/o "+ o.sex+" "+o.race+"]";
            var sdxDataNode = i2b2.sdx.Master.EncapsulateData('PR',o);
            // save record in the SDX system
            sdxDataNode = i2b2.sdx.Master.Save(sdxDataNode, cl_node);
            // append the data node to our returned results
            retChildren.push(sdxDataNode);
        }
        cl_node.children.loaded = true;
        // TODO: broadcast a data update event of the CRC data model
        retMsg.results = retChildren;
        if (getObjectClass(cl_onCompleteCB)=='i2b2_scopedCallback') {
            cl_onCompleteCB.callback.call(cl_onCompleteCB.scope, retMsg);
        } else {
            cl_onCompleteCB(retMsg);
        }
    }


    var msg_filter = '<input_list>\n' +
    '	<patient_list max="1000000" min="0">\n'+
    '		<patient_set_coll_id>'+sdxParentNode.sdxInfo.sdxKeyValue+'</patient_set_coll_id>\n'+
    '	</patient_list>\n'+
    '</input_list>\n'+
    '<filter_list/>\n'+
    '<output_option>\n'+
    '	<patient_set select="using_input_list" onlykeys="false"/>\n'+
    '</output_option>\n';

    // AJAX CALL
    var options  = {
        patient_limit: 0,
        PDO_Request: msg_filter
    };
    i2b2.CRC.ajax.getPDO_fromInputList("CRC:SDX:PatientRecordSet", options, scopedCallback);
}



i2b2.sdx.TypeControllers.PRS.LoadChildrenFromTreeview = function(node, onCompleteCallback) {
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = node.data.i2b2_SDX;
    scopedCallback.callback = function(retCellPack) {
        var cl_node = node;
        var cl_onCompleteCB = onCompleteCallback;

        var results = retCellPack.results;
        for(var i1=0; i1<1*results.length; i1++) {
            var o = results[i1];
            var renderOptions = {
                dragdrop: "i2b2.sdx.TypeControllers.PRC.AttachDrag2Data",
                icon: "sdx_CRC_PR.jpg",
                title: o.sdxInfo.sdxDisplayName,
                showchildren: false
            };
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
    if (node.data.i2b2_SDX.origData.size > 200)
    {
        node.loadComplete();
        alert("The patient count is greater then that can be displayed.");
    } else {
        i2b2.sdx.Master.getChildRecords(sdxParentNode, scopedCallback, options);
    }
}





// *********************************************************************************
//	DRAG DROP PROXY CONTROLLER
// *********************************************************************************
i2b2.sdx.TypeControllers.PRS.DragDrop = function(id, config) {
    if (id) {
        this.init(id, 'PRS',{isTarget:false});
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
i2b2.sdx.TypeControllers.PRS.DropHandler = function(sdxData) {
    alert('[PatientRecordSet DROPPED] You need to create your own custom drop event handler.');
}
// ==========================================================================
i2b2.sdx.TypeControllers.PRS.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};

// *********************************************************************************
//	DEPRECATED FUNCTIONS
// *********************************************************************************
i2b2.sdx.TypeControllers.PRS.AppendTreeNode = function() { console.error("[i2b2.sdx.TypeControllers.PRS.AppendTreeNode] is deprecated!"); }
i2b2.sdx.TypeControllers.PRS.SaveToDataModel = function() { console.error("[i2b2.sdx.TypeControllers.PRS.SaveToDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.PRS.LoadFromDataModel = function() { console.error("[i2b2.sdx.TypeControllers.PRS.LoadFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.PRS.ClearAllFromDataModel= function() { console.error("[i2b2.sdx.TypeControllers.PRS.ClearAllFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.PRS.onHoverOver = function() { console.error("[i2b2.sdx.TypeControllers.PRS.onHoverOver] is deprecated!"); }
i2b2.sdx.TypeControllers.PRS.onHoverOut = function() { console.error("[i2b2.sdx.TypeControllers.PRS.onHoverOut] is deprecated!"); }
i2b2.sdx.TypeControllers.PRS.AttachDrag2Data = function() { console.error("[i2b2.sdx.TypeControllers.PRS.AttachDrag2Data] is deprecated!"); }

console.timeEnd('execute time');
console.groupEnd();
