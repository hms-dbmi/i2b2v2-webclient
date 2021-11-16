/**
 * @projectDescription	The SDX controller library for the QueryMaster data-type.
 * @namespace	i2b2.sdx.TypeControllers.QM
 * @inherits 	i2b2.sdx.TypeControllers
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: CRC > SDX > QueryMaster');
console.time('execute time');


i2b2.sdx.TypeControllers.QM = {};
i2b2.sdx.TypeControllers.QM.model = {};
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
i2b2.sdx.TypeControllers.QM.getEncapsulateInfo = function() {
	// this function returns the encapsulation head information
	return {sdxType: 'QM', sdxKeyName: 'id', sdxControlCell:'CRC', sdxDisplayNameKey:'name'};
}

// *********************************************************************************
//	GENERATE HTML (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.QM.RenderHTML= function(sdxData, options, targetDiv) {
    console.warn("[i2b2.sdx.TypeControllers.QM.RenderHTML] is deprecated!");
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
	
	
	if (Object.isUndefined(conceptId))
	{
		options.title = sdxData.sdxInfo.sdxDisplayName;	
	}

	
	// process drag drop controllers
	if (!Object.isUndefined(options.dragdrop)) {
// NOTE TO SELF: should attachment of node dragdrop controller be handled by the SDX system as well? 
// This would ensure removal of the onmouseover call in a cross-browser way
		var sDD = '  onmouseover="' + options.dragdrop + '(\''+ targetDiv.id +'\',\'' + id + '\')" ';
	} else {
		var sDD = '';
	}

	if (Object.isUndefined(options.cssClass)) { options.cssClass = 'sdxDefaultQM';}

	// user can override
	bCanExp = true;
	if (Object.isBoolean(options.showchildren)) { 
		bCanExp = options.showchildren;
	}
	render.canExpand = bCanExp;
	render.iconType = "QM";
	
	if (!Object.isUndefined(options.icon)) { render.icon = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon }
	if (!Object.isUndefined(options.iconExp)) { render.iconExp = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.iconExp }
	// in cases of one set icon, copy valid icon to the missing icon
	if (Object.isUndefined(render.icon) && !Object.isUndefined(render.iconExp)) {	render.icon = render.iconExp; }
	if (!Object.isUndefined(render.icon) && Object.isUndefined(render.iconExp)) {	render.iconExp = render.icon; }

	// handle the event controllers
	var sMainEvents = sDD;
	var sImgEvents = sDD;
	if (options.click) {sMainEvents += ' onclick="'+ options.click +'" '; }
	if (options.dblclick) {sMainEvents += ' ondblclick="'+ options.dblclick +'" '; }
	if (options.context) {sMainEvents += ' oncontext="'+ options.context +'" '; } else {retHtml += ' oncontextmenu="return false" '; }
	// **** Render the HTML ***
	var retHtml = '<DIV id="' + id + '" ' + sMainEvents + ' style="white-space:nowrap;cursor:pointer;" >';
	if (options.tooltip) { var retHtml = '<DIV id="' + id + '" ' + sMainEvents + ' style="white-space:nowrap;cursor:pointer;" title="' + options.tooltip + '">'; }
	retHtml += '<DIV ';
	if (Object.isString(options.cssClass)) {
		retHtml += ' class="'+options.cssClass+'" ';
	} else {
		retHtml += ' class= "sdxDefaultQM" ';
	}
	retHtml += sImgEvents;
	retHtml += '>';
	retHtml += '<IMG src="'+render.icon+'"/> '; 
	if (!Object.isUndefined(options.title)) {
		retHtml += options.title;
	} else {
		console.warn('[SDX RenderHTML] no title was given in the creation options for an CRC>QM node!');
		retHtml += ' QM '+id;
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
i2b2.sdx.TypeControllers.QM.RenderData = function(sdxData, options) {
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
            var t = 'sdx_CRC_QM.gif';
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
		cssClassMain: "sdxStyleCRC-QM",
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
/**
 * Get the child QueryInstance records for the given QueryMaster.
 * @param {Object} sdxParentNode	The parent node we want to find the children of.
 * @param {ScopedCallback} onCompleteCallback A scoped-callback function to be executed using the results array.
 * @return {Boolean} Returns true to the calling function.
 * @return {Array} Returns an array of QueryInstance data represented as SDX Objects (without render data) to the callback function passed.
 * @memberOf i2b2.sdx.TypeControllers.QM
 * @method
 * @author Nick Benik
 * @version 1.0
 * @alias i2b2.sdx.Master.getChildRecords
 */
i2b2.sdx.TypeControllers.QM.getChildRecords = function(sdxParentNode, onCompleteCallback) {
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
		var qi = results.refXML.getElementsByTagName('query_instance');
		for(var i1=0; i1<1*qi.length; i1++) {
			var o = new Object;
			o.xmlOrig = qi[i1];
			o.query_master_id = i2b2.h.getXNodeVal(qi[i1],'query_master_id');
			o.query_instance_id = i2b2.h.getXNodeVal(qi[i1],'query_instance_id');
			o.id = o.query_instance_id;
			o.batch_mode = i2b2.h.getXNodeVal(qi[i1],'batch_mode');
			o.start_date = i2b2.h.getXNodeVal(qi[i1],'start_date');
			o.end_date = i2b2.h.getXNodeVal(qi[i1],'end_date');
			o.query_status_type = i2b2.h.getXNodeVal(qi[i1],'query_status_type');
			o.title = "Results of " + sdxParentNode.origData.name;
			if(typeof o.batch_mode === "undefined"){ // CRC is below version 1.7.07
				o.title += " - " + i2b2.h.getXNodeVal(qi[i1],'description');
			} else { // CRC is version 1.7.08 or newer
				o.title += " - " + o.batch_mode;
			}
			var sdxDataNode = i2b2.sdx.Master.EncapsulateData('QI',o);
            sdxDataNode.origData.QM_title = sdxParentNode.origData.name;6
			// append the data node to our returned results
			retChildren.push(sdxDataNode);
		}
		retMsg.results = retChildren;
		retMsg.parentNode = cl_node;
		if (cl_onCompleteCB instanceof i2b2_scopedCallback) {
			cl_onCompleteCB.callback.call(cl_onCompleteCB.scope, retMsg);
		} else {
			cl_onCompleteCB(retMsg);
		}
	}
	i2b2.CRC.ajax.getQueryInstanceList_fromQueryMasterId("CRC:SDX:QueryMaster", {qm_key_value: sdxParentNode.sdxInfo.sdxKeyValue}, scopedCallback);
}


i2b2.sdx.TypeControllers.QM.LoadChildrenFromTreeview = function(node, onCompleteCallback) {
	var scopedCallback = new i2b2_scopedCallback();
	scopedCallback.scope = node.data.i2b2_SDX;
	scopedCallback.callback = function(retCellPack) {
		var cl_node = node;
		var cl_onCompleteCB = onCompleteCallback;

		var results = retCellPack.results;			
		for(var i1=0; i1<1*results.length; i1++) {
			var o = results[i1];
			var renderOptions = {
				title: o.origData.title,
				dragdrop: "i2b2.sdx.TypeControllers.QI.AttachDrag2Data",
				dblclick: "i2b2.CRC.view.history.ToggleNode(this,'"+cl_node.tree.id+"')",
				icon: "sdx_CRC_QI.gif",
				iconExp: "sdx_CRC_QI_exp.gif"
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
	i2b2.sdx.Master.getChildRecords(sdxParentNode, scopedCallback);
}


// *********************************************************************************
//	ATTACH DRAG TO DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.QM.AttachDrag2Data = function(divParentID, divDataID){
	if (Object.isUndefined($(divDataID))) {	return false; }
	
	// get the i2b2 data from the yuiTree node
	var tvTree = YAHOO.widget.TreeView.getTree(divParentID);
	var tvNode = tvTree.getNodeByProperty('nodeid', divDataID);
	if (!Object.isUndefined(tvNode.DDProxy)) { return true; }
	
	//If termporal query than dont allow drag
	//if (!Object.isUndefined(tvNode.data.i2b2_SDX.origData.master_type_cd)   && tvNode.data.i2b2_SDX.origData.master_type_cd == "TEMPORAL") { return true; }
	
	// attach DD
	var t = new i2b2.sdx.TypeControllers.QM.DragDrop(divDataID)
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
i2b2.sdx.TypeControllers.QM.DragDrop = function(id, config) {
	if (id) {
		this.init(id, 'QM', {isTarget:false});
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

/* TODO: Reimplement drag and drop
*/




// *********************************************************************************
//	<BLANK> DROP HANDLER 
//	!!!! DO NOT EDIT - ATTACH YOUR OWN CUSTOM ROUTINE USING
//	!!!! THE i2b2.sdx.Master.setHandlerCustom FUNCTION
// *********************************************************************************
i2b2.sdx.TypeControllers.QM.DropHandler = function(sdxData) {
	alert('[QueryMaster DROPPED] You need to create your own custom drop event handler.');
}
// ==========================================================================
i2b2.sdx.TypeControllers.QM.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};

// *********************************************************************************
//	DEPRECATED FUNCTIONS
// *********************************************************************************
i2b2.sdx.TypeControllers.QM.AppendTreeNode = function() { console.error("[i2b2.sdx.TypeControllers.QM.AppendTreeNode] is deprecated!"); }
i2b2.sdx.TypeControllers.QM.SaveToDataModel = function() { console.error("[i2b2.sdx.TypeControllers.QM.SaveToDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.QM.LoadFromDataModel = function() { console.error("[i2b2.sdx.TypeControllers.QM.LoadFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.QM.ClearAllFromDataModel= function() { console.error("[i2b2.sdx.TypeControllers.QM.ClearAllFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.QM.onHoverOver = function() { console.error("[i2b2.sdx.TypeControllers.QM.onHoverOver] is deprecated!"); }
i2b2.sdx.TypeControllers.QM.onHoverOut = function() { console.error("[i2b2.sdx.TypeControllers.QM.onHoverOut] is deprecated!"); }
i2b2.sdx.TypeControllers.QM.AttachDrag2Data = function() { console.error("[i2b2.sdx.TypeControllers.QM.AttachDrag2Data] is deprecated!"); }

console.timeEnd('execute time');
console.groupEnd();