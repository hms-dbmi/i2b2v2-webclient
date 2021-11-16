/**
 * @projectDescription	The SDX controller library for generic XML data-type.
 * @namespace	i2b2.sdx.TypeControllers.XML
 * @inherits 	i2b2.sdx.TypeControllers
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 1-12-09: RC5 launch [Nick Benik] 
 */
console.group('Load & Execute component file: WORK > SDX > Generic XML');
console.time('execute time');


i2b2.sdx.TypeControllers.XML = {};
i2b2.sdx.TypeControllers.XML.model = {};
// *********************************************************************************
//	ENCAPSULATE DATA
// *********************************************************************************
/** 
 * Get the sdxInfo data template for all QueryMaster.
 * @memberOf i2b2.sdx.TypeControllers.XML
 * @method
 * @return {Object} Returns a data object containing sdxType, sdxKeyName, sdxControlCell info for GenericXML-type objects.
 * @author Nick Benik
 * @version 1.0
 * @alias i2b2.sdx.Master.EncapsulateData
 */
i2b2.sdx.TypeControllers.XML.getEncapsulateInfo = function() {
	// this function returns the encapsulation head information
	return {sdxType: 'XML', sdxKeyName: 'key', sdxControlCell:'WORK', sdxDisplayNameKey:'name'};
}


// *********************************************************************************
//	GENERATE HTML (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.XML.RenderHTML= function(sdxData, options, targetDiv) {    
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
	var id = "WORK_ID-" + i2b2.GUID();
	
	// process drag drop controllers
	if (!Object.isUndefined(options.dragdrop)) {
// NOTE TO SELF: should attachment of node dragdrop controller be handled by the SDX system as well? 
// This would ensure removal of the onmouseover call in a cross-browser way
		var sDD = '  onmouseover="' + options.dragdrop + '(\''+ targetDiv.id +'\',\'' + id + '\')" ';
	} else {
		var sDD = '';
	}

	if (Object.isUndefined(options.cssClass)) { options.cssClass = 'sdxDefaultXML';}

	// user can override
	bCanExp = true;
	if (Object.isBoolean(options.showchildren)) { 
		bCanExp = options.showchildren;
	}
	render.canExpand = bCanExp;
	render.iconType = "XML";
	
	if (!Object.isUndefined(options.icon)) { render.icon = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/'+ options.icon }
	if (!Object.isUndefined(options.iconExp)) { render.iconExp = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/'+ options.iconExp }
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
	var retHtml = '<DIV id="' + id + '" ' + sMainEvents + ' style="white-space:nowrap;cursor:pointer;">';
	retHtml += '<DIV ';
	if (Object.isString(options.cssClass)) {
		retHtml += ' class="'+options.cssClass+'" ';
	} else {
		retHtml += ' class= "sdxDefaultXML" ';
	}
	retHtml += sImgEvents;
	retHtml += '>';
	retHtml += '<IMG src="'+render.icon+'"/> '; 
	if (!Object.isUndefined(options.title)) {
		retHtml += options.title;
	} else {
		console.warn('[SDX RenderHTML] no title was given in the creation options for an WORK>XML node!');
		retHtml += ' XML '+id;
	}
	retHtml += '</DIV></DIV>';
	render.html = retHtml;
	render.htmlID =  id;
	var retObj = {};
	$.extend(retObj, sdxData);
	retObj.renderData = render;
	return retObj;
}


i2b2.sdx.TypeControllers.XML.getChildRecords = function(sdxParentNode, onCompleteCallback) {
	var retMsg = {
		error: true,
		msgRequest: '',
		msgResponse: '',
		msgUrl: '',
		results: null
	};
	if (getObjectClass(onCompleteCallback)=='i2b2_scopedCallback') {
		onCompleteCallback.callback.call(onCompleteCallback.scope, retMsg);
	} else {
		onCompleteCallback(retMsg);
	}
}


// *********************************************************************************
//	DRAG DROP PROXY CONTROLLER
// *********************************************************************************
i2b2.sdx.TypeControllers.XML.DragDrop = function(id, config) {
	if (id) {
		this.init(id, 'XML', {isTarget:false});
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
i2b2.sdx.TypeControllers.XML.DropHandler = function(sdxData) {
	alert('[XML DROPPED] You need to create your own custom drop event handler.');
}
// ==========================================================================
i2b2.sdx.TypeControllers.XML.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    if (!i2b2.h.isUndefined(i2b2Data.sdxUnderlyingPackage)) {
        delete i2b2Data.sdxUnderlyingPackage.origData.xmlOrig;
        delete i2b2Data.sdxUnderlyingPackage.origData.parent;
    }
    return i2b2Data;
};

// *********************************************************************************
//	DEPRECATED FUNCTIONS
// *********************************************************************************
i2b2.sdx.TypeControllers.XML.AppendTreeNode = function() { console.error("[i2b2.sdx.TypeControllers.XML.AppendTreeNode] is deprecated!"); }
i2b2.sdx.TypeControllers.XML.SaveToDataModel = function() { console.error("[i2b2.sdx.TypeControllers.XML.SaveToDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.XML.LoadFromDataModel = function() { console.error("[i2b2.sdx.TypeControllers.XML.LoadFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.XML.ClearAllFromDataModel= function() { console.error("[i2b2.sdx.TypeControllers.XML.ClearAllFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.XML.onHoverOver = function() { console.error("[i2b2.sdx.TypeControllers.XML.onHoverOver] is deprecated!"); }
i2b2.sdx.TypeControllers.XML.onHoverOut = function() { console.error("[i2b2.sdx.TypeControllers.XML.onHoverOut] is deprecated!"); }
i2b2.sdx.TypeControllers.XML.AttachDrag2Data = function() { console.error("[i2b2.sdx.TypeControllers.XML.AttachDrag2Data] is deprecated!"); }


console.timeEnd('execute time');
console.groupEnd();