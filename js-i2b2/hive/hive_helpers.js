/**
 * @projectDescription	Various helper functions used by the i2b2 framework and cells.
 * @inherits 	i2b2
 * @namespace	i2b2.h
 * @version 	2.0
 **/
console.group('Load & Execute component file: hive > helpers');
console.time('execute time');


if (typeof i2b2.h === "undefined") i2b2.h = {};


// ================================================================================================== //
// TODO: Remove this functionality
i2b2.h.parseXml = function(xmlString){
    var xmlDocRet = false;
    var isActiveXSupported = false;

    try { new ActiveXObject ("MSXML2.DOMDocument.6.0"); isActiveXSupported =  true; } catch (e) { isActiveXSupported =  false; }

    if (isActiveXSupported) {
        //Internet Explorer
        xmlDocRet = new ActiveXObject("Microsoft.XMLDOM");
        xmlDocRet.async = "false";
        xmlDocRet.loadXML(xmlString);
        xmlDocRet.setProperty("SelectionLanguage", "XPath");
    } else {
        //Firefox, Mozilla, Opera, etc.
        parser = new DOMParser();
        xmlDocRet = parser.parseFromString(xmlString, "text/xml");
    }

    return xmlDocRet;
};


// ================================================================================================== //
i2b2.h.XPath = function(xmlDoc, xPath) {
    var retArray = [];

    // do some inline translation of the xmlDoc from string to XMLDocument
    if (typeof xmlDoc === 'string') {
        try {
            let parser = new DOMParser();
            let test = parser.parseFromString(xmlDoc, "text/xml");
            xmlDoc = test.documentElement;
        } catch(e) {
            return retArray;
        }
    }

    if (!xmlDoc) {
        console.warn("An invalid XMLDoc was passed to i2b2.h.XPath");
        return retArray;
    }
    try {
        if (window.ActiveXObject  || "ActiveXObject" in window) {
            if((!!navigator.userAgent.match(/Trident.*rv\:11\./)) && (typeof xmlDoc.selectNodes == "undefined")) { // IE11 handling
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.loadXML(new XMLSerializer().serializeToString(xmlDoc));
                xmlDoc = doc;
            }

            // Microsoft's XPath implementation
            // HACK: setProperty attempts execution when placed in IF statements' test condition, forced to use try-catch
            try {
                xmlDoc.setProperty("SelectionLanguage", "XPath");
            } catch(e) {
                try {
                    xmlDoc.ownerDocument.setProperty("SelectionLanguage", "XPath");
                } catch(e) {}
            }
            retArray = xmlDoc.selectNodes(xPath);

        }
        else if (document.implementation && document.implementation.createDocument) {
            // W3C XPath implementation (Internet standard)
            var ownerDoc = xmlDoc.ownerDocument;
            if (!ownerDoc) {ownerDoc = xmlDoc; }
            var nodes = ownerDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
            var rec = nodes.iterateNext();
            while (rec) {
                retArray.push(rec);
                rec = nodes.iterateNext();
            }
        }
    } catch (e) {
        console.error("An error occurred while trying to perform XPath query.");
        console.dir(e);
    }
    return retArray;
};


// ================================================================================================== //
i2b2.h.getXNodeVal = function(xmlElement, nodeName, includeChildren) {
    if (xmlElement === undefined) return undefined;
    // do some inline translation of the xmlDoc from string to XMLDocument
    if (typeof xmlElement === 'string') {
        try {
            let parser = new DOMParser();
            let test = parser.parseFromString(xmlElement, "text/xml");
            xmlElement = test.documentElement;
        } catch(e) {
            return undefined;
        }
    }

    var gotten = i2b2.h.XPath(xmlElement, "descendant-or-self::"+nodeName+"/text()");

    if (gotten.length == 0) return undefined;

    var final = "";
    if (includeChildren == true || includeChildren == true) {
        for (var i=0; i<gotten.length; i++) {
            final += gotten[i].nodeValue;
        }
    } else {
        for (var i=0; i<gotten.length; i++) {
            final += gotten[i].nodeValue;
        }
    }
    return final;
}


// ================================================================================================== //
i2b2.h.GenerateAlphaNumId = function(ReqIdLength) {
    var IdLen = 0;
    var retId = "";
    while (IdLen <= ReqIdLength) {
        IdLen++;
        switch(Math.floor(Math.random() * 3)) {
            case 0:
                // add a number
                retId += Math.floor(Math.random() * 10).toString();
                break;
            case 1:
                // upper case letter
                retId += String.fromCharCode(Math.floor(Math.random() * 26)+65);
                break;
            case 2:
                // lower case letter
                retId += String.fromCharCode(Math.floor(Math.random() * 26)+97);
                break;
        }
    }
    return retId;
};


// ================================================================================================== //
i2b2.h.Escape = function(inStrValue) {
    if ($("head div").length === 0) $("head").append("<div></div>");
    const el = $("head div")[0];
    el.textContent = inStrValue;
    const ret = el.innerHTML;
    el.innerHTML = "";
    return ret;
};


// ================================================================================================== //
i2b2.h.Unescape = function(inStrValue) {
    if ($("head div").length === 0) $("head").append("<div></div>");
    const el = $("head div")[0];
    el.innerHTML = inStrValue;
    const ret = el.textContent;
    el.innerHTML = "";
    return ret;
};


// ================================================================================================== //
i2b2.h.EscapeTemplateVars = function(refTemplateVals, arryIgnoreVars) {
    for (var vname in refTemplateVals) {
        var ignore = false;
        for (var i=0; i<arryIgnoreVars.length; i++) {
            if (vname == arryIgnoreVars[i]) {
                ignore = true;
                break;
            }
        }
        if (!ignore) {
            // escaping value
            refTemplateVals[vname] = this.Escape(refTemplateVals[vname]);
        }
    }
};


// ================================================================================================== //
// this function will hide/show elements tagged with the "debug" classname
i2b2.h.debugElements = function(rootElement) {
    if (i2b2.h.inDebugMode()) {
        $(rootElement).find(".debug").show();
    } else {
        $(rootElement).find(".debug").hide();
    }
};


// ================================================================================================== //
i2b2.h.isObject = function(value) {
    return value != null && typeof value == 'object';
};


// ================================================================================================== //
Object.isBoolean = function(testObj) { return (testObj === true || testObj === false) };


// ================================================================================================== //
Boolean.parseTo = function(inputValue) {
    if (typeof inputValue == "string") {
        return inputValue.match(/true/i);
    }
    return (inputValue==true);
};


// This is a special closure-based function to return a unique ID every time called.
// The closure counter gets wrapped into a private "bubble" within the JsVM that
// is not accessable from other calls...  Let the scope-chain bending begin!
// ================================================================================================== //
i2b2.GUID = (function() {
    var closure_Counter = 0 ;
    function closure_nextID() {
        var prevID = closure_Counter;
        closure_Counter++;
        if (prevID > closure_Counter) console.error("[i2b2.GUID function's internal counter encountered an overflow!!!]");
        return closure_Counter;
    }
    return (function() { return closure_nextID(); });
})();


// ================================================================================================== //
i2b2.h.getObjectClass = function(obj) {
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(/function\s*(\w+)/);
        if (arr && arr.length == 2) { return arr[1]; }
    }
    return undefined;
};


// ================================================================================================== //
i2b2.h.isNumber = function(v) { return $.isNumeric(v); };


// ================================================================================================== //
i2b2.h.Xml2String = function(x) {
    var xmlSerializer;
    try {
        xmlSerializer = new XMLSerializer();
        var s = xmlSerializer.serializeToString(x);
        if (s) {
            return s;
        } else {
            return 'Browser not supported yet. (Try Firefox)';
        }
    }
    catch (e) {
        return x.xml;
    }
};


// ================================================================================================== //
Handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

// ================================================================================================== //
Handlebars.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});


// ================================================================================================== //
// helper function to build a sniffer package for Cell Communications events
i2b2.h.BuildSniffPack = function(cellName, cellFuncName, results, signalOrigin) {
    function i2b2_CellCommPackage() {}
    var sniffPackage = new i2b2_CellCommPackage();
    sniffPackage.CellName = cellName;
    sniffPackage.CellAction = cellFuncName;
    sniffPackage.CommDetails = results;
    sniffPackage.SignalOrigin = signalOrigin;
    return sniffPackage;
};


// ================================================================================================== //
i2b2.h.StripCRLF = function(input) {
    let ret = String(input).replace(/\r/g, ">");
    return ret.replace(/\n/g, ">");
};


// ================================================================================================== //
console.timeEnd('execute time');
console.groupEnd();
