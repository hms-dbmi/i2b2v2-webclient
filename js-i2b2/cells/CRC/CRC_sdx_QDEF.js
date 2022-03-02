/**
 * @projectDescription	The SDX controller library for the Query Definition data-type.
 * @namespace	i2b2.sdx.TypeControllers.QDEF
 * @inherits 	i2b2.sdx.TypeControllers
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
console.group('Load & Execute component file: CRC > SDX > Query DEFinition');
console.time('execute time');


i2b2.sdx.TypeControllers.QDEF = {};
i2b2.sdx.TypeControllers.QDEF.model = {};


// ==========================================================================
i2b2.sdx.TypeControllers.QDEF.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'QDEF', sdxKeyName: 'key', sdxControlCell:'CRC', sdxDisplayNameKey: 'QDEF_name'};
};


// ==========================================================================
i2b2.sdx.TypeControllers.QDEF.DropHandler = function(sdxData) {
    alert('[PatientRecord DROPPED] You need to create your own custom drop event handler.');
};


// ==========================================================================
i2b2.sdx.TypeControllers.QDEF.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};

console.timeEnd('execute time');
console.groupEnd();