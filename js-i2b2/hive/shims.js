// ===========================================================
if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function()
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


// ===========================================================
if(typeof(String.prototype.strip) === "undefined")
{
    String.prototype.strip = function()
    {
        console.warn("String.strip() is deprecated!");
        return String(this).trim();
    };
}





// wrap YUI functions into the JS Object constructor to augment Protype-JS functions
// ================================================================================================== //
Object.isObject = function(testObj) {
    console.warn("Object.isObject is deprecated! Use i2b2.h.isObject()");
    return i2b2.h.isObject(testObj);
}
Object.isNull = function(testObj) { return YAHOO.lang.isNull(testObj); }
Object.isBoolean = function(testObj) { return YAHOO.lang.isBoolean(testObj); }
Boolean.parseTo = function(inputValue) {
    if (typeof inputValue == "string") {
        return inputValue.match(/true/i);
    }
    return (inputValue==true);
}

function getObjectClass(obj) {
    console.error("Function getObjectClass() is deprecated!!! (This shim may not always work!)");
    return String(temp.constructor).split("(").shift().split(" ")[1];
}
