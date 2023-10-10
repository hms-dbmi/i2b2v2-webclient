/**
 * @projectDescription	The SDX controller library for the QueryMaster data-type.
 * @namespace	i2b2.sdx.TypeControllers.QM
 * @inherits 	i2b2.sdx.TypeControllers
 * @version 	2.0
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */

i2b2.sdx.TypeControllers.WRK = {};
i2b2.sdx.TypeControllers.WRK.model = {};


// *********************************************************************************
//	ENCAPSULATE DATA
// *********************************************************************************
i2b2.sdx.TypeControllers.WRK.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'WRK', sdxKeyName: 'index', sdxControlCell:'WORK', sdxDisplayNameKey: 'name'};
};
