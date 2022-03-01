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


// ==========================================================================
i2b2.sdx.TypeControllers.XML.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'XML', sdxKeyName: 'key', sdxControlCell:'WORK', sdxDisplayNameKey:'name'};
};


// ==========================================================================
i2b2.sdx.TypeControllers.XML.RenderHTML= function(sdxData, options, targetDiv) {
    console.warn("[i2b2.sdx.TypeControllers.XML.RenderHTML] is deprecated!");
};


// ==========================================================================
i2b2.sdx.TypeControllers.XML.getChildRecords = function(sdxParentNode, onCompleteCallback) {
    let retMsg = {
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
};


// ==========================================================================
i2b2.sdx.TypeControllers.XML.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    if (i2b2Data.sdxUnderlyingPackage !== undefined) {
        delete i2b2Data.sdxUnderlyingPackage.origData.xmlOrig;
        delete i2b2Data.sdxUnderlyingPackage.origData.parent;
    }
    return i2b2Data;
};


// ==========================================================================
console.timeEnd('execute time');
console.groupEnd();