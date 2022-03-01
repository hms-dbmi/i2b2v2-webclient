/**
 * @projectDescription	The SDX controller library for the Query Group Definition data-type.
 * @namespace	i2b2.sdx.TypeControllers.QGDEF
 * @inherits 	i2b2.sdx.TypeControllers
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > SDX > Query Group DEFinition');
console.time('execute time');


i2b2.sdx.TypeControllers.QGDEF = {};
i2b2.sdx.TypeControllers.QGDEF.model = {};


// ==========================================================================
i2b2.sdx.TypeControllers.QGDEF.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'QGDEF', sdxKeyName: 'key', sdxControlCell:'CRC', sdxDisplayNameKey: 'QGDEF_name'};
};


// ==========================================================================
i2b2.sdx.TypeControllers.QGDEF.DropHandler = function(sdxData) {
    alert('[PatientRecord DROPPED] You need to create your own custom drop event handler.');
};


// ==========================================================================
i2b2.sdx.TypeControllers.QGDEF.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};


// ==========================================================================
console.timeEnd('execute time');
console.groupEnd();