// ensure the parent namespace exists before adding to it
if (typeof i2b2.CRC === 'undefined') i2b2.CRC = {};

// central location for obfuscation logic
i2b2.CRC.Obfuscate = {};
// mirror the user's obfuscation state (set by the PM cell at login, before the cells are loaded)
i2b2.CRC.Obfuscate.isObfuscated = i2b2.PM.model.isObfuscated;

i2b2.CRC.Obfuscate.obfuscatedValue = function(number, floorValue, obfuscateValue) {
    // this function is used by all the breakdown modules to generate the display numbers
    number = parseInt(number);
    if (['string','number'].includes(typeof floorValue)) {
        floorValue = parseInt(floorValue)
    } else {
        floorValue = null;
    }
    if (['string','number'].includes(typeof obfuscateValue)) {
        obfuscateValue = parseInt(obfuscateValue)
    } else {
        obfuscateValue = null;
    }

    // a non-zero floorValue is used as the threshold, otherwise fall back to the UI config threshold
    let floorThreshold = floorValue || i2b2.UI?.cfg?.floorThresholdNumber;
    if (typeof floorThreshold === 'undefined') floorThreshold = 0;

    // floor threshold: a non-zero floorValue always applies, the UI config only applies if useFloorThreshold is set
    if ((floorValue || i2b2.UI?.cfg?.useFloorThreshold) && (number <= floorThreshold)) {
        let prefix = i2b2.UI?.cfg?.floorThresholdText;
        if (typeof prefix === 'undefined') prefix = "≤";
        return prefix + parseInt(floorThreshold).toLocaleString();
    }

    // obfuscation: a positive obfuscateValue is used directly
    if (obfuscateValue > 0) {
        return number.toLocaleString() + "±" + obfuscateValue.toLocaleString();
    }
    // obfuscation: null/NaN obfuscateValue (but not 0) falls back to the UI config
    if (!obfuscateValue && obfuscateValue !== 0 && i2b2.PM.model.isObfuscated && i2b2.UI?.cfg?.obfuscatedDisplayNumber) {
        return number.toLocaleString() + "±" + parseInt(i2b2.UI.cfg.obfuscatedDisplayNumber).toLocaleString();
    }
    return number.toLocaleString();
};

i2b2.CRC.Obfuscate.obfuscationSuffix = function(obfuscateValue) {
    // a positive numeric obfuscateValue is used directly
    if (typeof obfuscateValue === "number" && obfuscateValue > 0) {
        return "±" + parseInt(obfuscateValue).toLocaleString();
    }
    // an empty value (undefined/null/NaN/"", but not 0) falls back to the UI config
    if (!obfuscateValue && obfuscateValue !== 0 && i2b2.PM.model.isObfuscated && i2b2.UI?.cfg?.obfuscatedDisplayNumber) {
        return "±" + parseInt(i2b2.UI.cfg.obfuscatedDisplayNumber).toLocaleString();
    }
    return "";
};
