/**
 * @projectDescription	i2b2 web client UI configuration information & display functions
 * @inherits 	i2b2
 * @namespace	i2b2.UI
 * @author		Nich Wattanasin
 * @version 	1.7.08
 * ----------------------------------------------------------------------------------------
 * updated 9-7-16: Initial Launch
 */
 
 
i2b2.UI = {};
/* Start Configuration. Note: be careful to keep trailing commas after each parameter */
i2b2.UI.cfg = {
    loginDefaultUsername : "demo", /* [Default: "demo"] Default text inside the username input */
    loginDefaultPassword : "demouser", /* [Default: "demouser"] Default text inside the password input */
    obfuscatedDisplayNumber: 3, /* [Default: 3] Display number after plus/minus for obfuscated results.
                                  Control the real obfuscation value from server in CRC properties. */
    useFloorThreshold: false, /* [Default: false] If true, any result below floorThresholdNumber shows as 'Less Than {floorThresholdNumber}' */
    floorThresholdNumber: 10, /* [Default: 10] Threshold for low number of results */
    floorThresholdText: "Less Than " // [Default: "Less Than "] Text that is prefixed before floorThresholdNumber (include trailing space)
};
/* End Configuration */
