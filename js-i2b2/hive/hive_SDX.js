/**
 * @projectDescription	Standard Data Exchange (SDX) subsystem's core message router.
 * @inherits 	i2b2
 * @namespace	i2b2
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik]
 */
console.group('Load & Execute component file: hive > SDX');
console.time('execute time');

i2b2.sdx.Master = {};
i2b2.sdx.TypeControllers = {};
i2b2.sdx.Master._nativeTargetRefs = {};
// ================================================================================================== //
i2b2.sdx.Master.EncapsulateData = function(inType, inData) {
    if (!i2b2.h.isObject(inData)) {
        console.error("Data to encapsulate into SDX package is not an object");
        return false;
    }

    try {
        var headInfo = i2b2.sdx.TypeControllers[inType].getEncapsulateInfo();
    } catch(e) {
        console.error('SDX Controller for Data Type: '+inType+' does not allow Encapsulation!');
        return false;
    }

    // class for all SDX communications
    function i2b2_SDX_Encapsulation() {}
    // create an instance and populate with info
    var sdxEncap = new i2b2_SDX_Encapsulation();
    sdxEncap.sdxInfo = headInfo;
    if (undefined==inData[headInfo.sdxKeyName]) {
        console.error('Key information was not found during an attempt to encapsulate '+inType+' data');
        console.group('(more info)');
        console.info('SDX Encapsulation header');
        console.dir(headInfo);
        console.info('Data sent to be Encapsulated');
        console.dir(inData);
        console.groupEnd();
        return false;
    }
    sdxEncap.sdxInfo.sdxKeyValue = inData[headInfo.sdxKeyName];
    if (headInfo.sdxDisplayNameKey) {
        var t = inData[headInfo.sdxDisplayNameKey];
        if (t) {
            sdxEncap.sdxInfo.sdxDisplayName = t;
            delete sdxEncap.sdxInfo.sdxDisplayNameKey;
        }
    }
    sdxEncap.origData = inData;
    return sdxEncap;
}


// ================================================================================================== //
i2b2.sdx.Master._KeyHash = function(key) {
    // create hash from key
    var kh = escape(key);
    kh = kh.replace('%','_');
    return "H$__"+kh;
}


// ================================================================================================== //
i2b2.sdx.Master.ClearAll = function(type, sdxParentOptional) { console.error("[i2b2.sdx.Master.ClearAll] is deprecated"); }
i2b2.sdx.Master.Save = function(sdxData, sdxParentNode) { console.error("[i2b2.sdx.Master.Save] is deprecated"); }
i2b2.sdx.Master.Load = function(type, key) { console.error("[i2b2.sdx.Master.Load] is deprecated"); }
// ================================================================================================== //
i2b2.sdx.Master.AppendChild = function(tvNode, type, key, data) { console.error("[i2b2.sdx.Master.AppendChild] is deprecated"); }
i2b2.sdx.Master.Attach2Data = function(domNode, type, key) { console.error("[i2b2.sdx.Master.Attach2Data] is deprecated"); }
i2b2.sdx.Master.RenderHTML = function(targetDivID, sdxDataPackage, options) { console.error("[i2b2.sdx.Master.RenderHTML] is deprecated"); }
i2b2.sdx.Master.AppendTreeNode = function(yuiTree, yuiRootNode, sdxDataPackage, sdxLoaderCallback) { console.error("[i2b2.sdx.Master.AppendTreeNode] is deprecated"); }
i2b2.sdx.Master.LoadChildrenFromTreeview = function(node, onCompleteCallback) { console.error("[i2b2.sdx.Master.LoadChildrenFromTreeview] is deprecated"); }
// ================================================================================================== //
i2b2.sdx.Master.Click = function(type,id, domNode) {}
i2b2.sdx.Master.onHoverOver = function(sdxType, eventObj, targetID, ddProxyObj) { console.error("[i2b2.sdx.Master.onHoverOver] is deprecated"); }
i2b2.sdx.Master.onHoverOut = function(sdxType, eventObj, targetID, ddProxyObj) { console.error("[i2b2.sdx.Master.onHoverOut] is deprecated"); }
// ================================================================================================== //




// ================================================================================================== //
i2b2.sdx.Master.onDragDropEvents = function(e,a) {
    // get a list of SDX types that are in this DD operation
    let ev = e.originalEvent;
    let sdxTypeList = [];
    for (let i in ev.dataTransfer.types) {
        if (String(ev.dataTransfer.types[i]).toLowerCase().indexOf("application/i2b2-sdxtype+") === 0) {
            let sdxTypes = String(ev.dataTransfer.types[i]).toUpperCase().split("+");
            sdxTypes.shift();
            sdxTypeList = sdxTypeList.concat(sdxTypes);
        }
    }
    let eventHandlers = {};
    eventHandlers = $(this).data("i2b2DragdropEvents");

//    console.dir(sdxTypeList);
//    console.dir(eventHandlers);
//    console.dir(e);

    switch(e.type) {
        case "drop":
            // forward the event to the drop handler passing the object being dropped
            while (sdxTypeList.length) {
                let sdxType = sdxTypeList.pop();
                if (typeof eventHandlers[sdxType] === "object" && typeof eventHandlers[sdxType].DropHandler === "function") {
                    // TODO: Finish this to pass the data
                    let sdxJSON = JSON.parse(e.originalEvent.dataTransfer.getData("application/i2b2+json"));
                    eventHandlers[sdxType].DropHandler(sdxJSON, e);
                }
            }
            e.stopImmediatePropagation();
            break;
        case "dragover":
            // enable drop if a drop handler exists for the object being dropped
            while (sdxTypeList.length) {
                let sdxType = sdxTypeList.pop();
                if (typeof eventHandlers[sdxType] === "object" && typeof eventHandlers[sdxType].DropHandler === "function") {
                    if (typeof eventHandlers[sdxType].DropChecker === "function") {
                        if (eventHandlers[sdxType].DropChecker(e.target, e, this)) {
                            // this is REQUIRED for proper drop
                            ev.preventDefault();
                        }
                    } else {
                        // this is REQUIRED for proper drop
                        ev.preventDefault();
                    }
                }
            }
            break;
        case "dragenter":
            while (sdxTypeList.length) {
                let sdxType = sdxTypeList.pop();
                if (typeof eventHandlers[sdxType] === "object" && typeof eventHandlers[sdxType].onHoverOver === "function") {
                    eventHandlers[sdxType].onHoverOver(e.target);
                }
            }
            break;
        case "dragleave":
            while (sdxTypeList.length) {
                let sdxType = sdxTypeList.pop();
                if (typeof eventHandlers[sdxType] === "object" && typeof eventHandlers[sdxType].onHoverOut === "function") {
                    eventHandlers[sdxType].onHoverOut(e.target);
                }
            }
            break;
    }
};
// ================================================================================================== //
i2b2.sdx.Master.ProcessDrop = function(sdxData, DroppedOnID){
    console.group("SDX Process DropEvent on container ID:"+DroppedOnID);
    console.dir(sdxData);
//TODO: clean up these array processing hacks
    if (sdxData[0]) {
        var typeCode = sdxData[0].sdxInfo.sdxType;
    } else {
        var typeCode = sdxData.sdxInfo.sdxType;
    }
    // do we have the container registered?
    try {
        var t = this._sysData[DroppedOnID][typeCode].DropHandler;
    } catch(e) {
        console.error("SDX DropHandler does not exist for drop target!");
        console.groupEnd();
        return false;
    }
    console.groupEnd();
    // TODO: perform any needed type translation
    var sdxObjs = [];
//TODO: clean up these array processing hacks
    if (sdxData[0]) {
        sdxData.each(function(sdxRec){
            if (sdxRec.sdxInfo.sdxType == typeCode) { sdxObjs.push(sdxRec); }
        });
    } else {
        sdxObjs.push(sdxData);
    }
    this._sysData[DroppedOnID][typeCode].DropHandler(sdxObjs, DroppedOnID);
}

// ================================================================================================== //
i2b2.sdx.Master.AttachType = function(container, typeCode, options) {
    // change the container into a DOM element reference
    if (typeof container === "string") {
        container = $("#"+container);
        if (container.length == 0) {
            container = null;
        }
    }
    // manage if it is a jQuery reference
    if (container.length && container.length > 0) {
        container = container[0];
    }

    // add class for target bubbling
    $(container).addClass("i2b2DropTarget");

    // confirm that it is a proper DOM node
    let attrlist = [
        "ondrag",
        "ondragend",
        "ondragenter",
        "ondragover"
    ];
    let isDomEl = true;
    while (attrlist.length) {
        if (typeof container[attrlist.pop()] !== "object") { isDomEl = false; }
    }

    // improper reference to a DOM element or element does not exist
    if (!isDomEl) {
        return false;
    } else {
        // attach/augment events using the jQuery .data() operation
        let dd_events = $(container).data("i2b2-dragdrop-events");
        if (typeof dd_events === "undefined") {
            dd_events = {};
        }
        // add new events
        dd_events[typeCode] = {
            "RenderHTML": i2b2.sdx.Master.getHandlerDefault(typeCode, "RenderHTML"),
            "AppendTreeNode": i2b2.sdx.Master.getHandlerDefault(typeCode, "AppendTreeNode"),
            "LoadChildrenFromTreeview":i2b2.sdx.Master.getHandlerDefault(typeCode, "LoadChildrenFromTreeview"),
            "onHoverOver":i2b2.sdx.Master.getHandlerDefault(typeCode, "onHoverOver"),
            "onHoverOut":i2b2.sdx.Master.getHandlerDefault(typeCode, "onHoverOut"),
            "DropHandler":i2b2.sdx.Master.setHandlerDefault(typeCode, "DropHandler")
        };
        $(container).data("i2b2-dragdrop-events", dd_events);

        // start listening for DD events
        $(container).on("drop dragover dragenter dragleave", i2b2.sdx.Master.onDragDropEvents);

        return true;
    }
};

// ================================================================================================== //
i2b2.sdx.Master.setHandlerCustom = function(container, typeCode, handlerName, newHandlerFunction) {
    // containerID: string
    // typeCode: string
    // handlerName: string (example: Render, AddChild, ddStart, ddMove)
    // newHandlerFunction: function to be used
// change the container into a DOM element reference
    if (typeof container === "string") {
        container = $("#" + container);
        if (container.length == 0) {
            container = null;
        }
    }
    // manage if it is a jQuery reference
    if (container.length && container.length > 0) {
        container = container[0];
    }

    // confirm that it is a proper DOM node
    let attrlist = [
        "ondrag",
        "ondragend",
        "ondragenter",
        "ondragover"
    ];
    let isDomEl = true;
    while (attrlist.length) {
        if (typeof container[attrlist.pop()] !== "object") {
            isDomEl = false;
        }
    }

    // improper reference to a DOM element or element does not exist
    if (!isDomEl) {
        return false;
    } else {
        // attach/augment events using the jQuery .data() operation
        let dd_events = $(container).data("i2b2-dragdrop-events");
        if (typeof dd_events === "undefined") {
            dd_events = {};
        }
        // add new events
        dd_events[typeCode][handlerName] = newHandlerFunction;
        $(container).data("i2b2-dragdrop-events", dd_events);
        return true;
    }
};

// ================================================================================================== //
i2b2.sdx.Master.setHandlerDefault = function(containerID, typeCode, handlerName) {
    // containerID: string
    // typeCode: string
    // handlerName: string (example: Render, AddChild, ddStart, ddMove)
    // newHandlerFunction: function to be used
    if (undefined == i2b2.sdx.TypeControllers[typeCode]) {
        console.error("SDX TypeController does not exist for data type: " + typeCode);
        return false;
    }
    // do we have the container registered?
    if (Object.isUndefined(this._sysData[containerID])) {
        console.error("SDX does not have any references to a containerID: " + containerID);
        return false;
    }
    if (Object.isUndefined(i2b2.sdx.TypeControllers[typeCode][handlerName])) {
        console.warn("No default SDX '"+handlerName+"' handler exists for "+typeCode);
    } else {
        this._sysData[containerID][typeCode][handlerName] = i2b2.sdx.TypeControllers[typeCode][handlerName];
        console.info("ATTACHED default SDX '"+handlerName+"' handler for "+typeCode);
    }
    return true;
}

i2b2.sdx.Master.getHandlerDefault = function(typeCode, handlerName) {
    // typeCode: string
    // handlerName: string (example: Render, AddChild, ddStart, ddMove)
    if (typeof i2b2.sdx.TypeControllers[typeCode] === "undefined") {
        console.error("SDX TypeController does not exist for data type: " + typeCode);
        return false;
    }
    if (typeof i2b2.sdx.TypeControllers[typeCode][handlerName] === "undefined") {
        console.warn("No default SDX '"+handlerName+"' handler exists for "+typeCode);
    } else {
        return i2b2.sdx.TypeControllers[typeCode][handlerName];
    }
    return undefined;
}


// *****************************************************************************
//  THE BELOW FUNCTIONS ARE IMPLIMENTATION ION OF A ROUTER PATTERN
//  WHICH ROUTES REQUESTS DEPENDANT ON: DATA TYPE,
//  TARGET CONTAINER AND REGISTRATION ENTRIES OF SDX CONTROLLERS
// *****************************************************************************
// <BEGIN Router Pattern using dynamic registration and per-target overrides BEGIN>
// ================================================================================================== //
i2b2.sdx.Master.RenderData = function(sdxDataPackage, options) {
    // function returns following data that is used for rendering (at a minimum)
    // === title
    // === iconImg (url)
    // === cssClassMain
    // === cssClassMinor
    // === moreDescriptMain
    // === moreDescriptMinor
    // === tvNodeState

    var funcName = "[i2b2.sdx.Master.RenderData] ";
    if (i2b2.h.isUndefined(sdxDataPackage)) {
        console.error(funcName +'the SDX Data Package is empty!');
        return false;
    }
    try {
        var sdxType = sdxDataPackage.sdxInfo.sdxType;
    } catch (e) {
        console.error(funcName+'the data object type is not valid!');
        return false;
    }

    if (i2b2.h.isUndefined(i2b2.sdx.TypeControllers[sdxType].RenderData)) {
        console.error(funcName+'the SDX Controller for '+sdxType+' does not handle RenderData!');
        return false;
    }

    var ret = i2b2.sdx.TypeControllers[sdxType].RenderData(sdxDataPackage, options);

    if (ret) {
        // default values
        if (i2b2.h.isUndefined(ret.title)) ret.title = '';
        if (i2b2.h.isUndefined(ret.iconImg)) ret.iconImg = '';
        if (i2b2.h.isUndefined(ret.iconImgExp)) ret.iconImgExp = '';
        if (i2b2.h.isUndefined(ret.cssClassMain)) ret.cssClassMain = '';
        if (i2b2.h.isUndefined(ret.cssClassMinor)) ret.cssClassMinor = '';
        if (i2b2.h.isUndefined(ret.moreDescriptMain)) ret.moreDescriptMain = '';
        if (i2b2.h.isUndefined(ret.moreDescriptMinor)) ret.moreDescriptMinor = '';
        if (i2b2.h.isUndefined(ret.tvNodeState)) ret.tvNodeState = {};
    }

    return ret;
};
// ================================================================================================== //



// <END Router Pattern using dynamic registration and per-target overrides END>
// ================================================================================================== //
i2b2.sdx.Master.onDragStart = function(event, node) {
    // route to the proper SDX type controller for management
    try {
        var sdxType = node.data.i2b2.sdxInfo.sdxType;
        if (i2b2.sdx.TypeControllers[sdxType] !== undefined) {
            // valid SDX type... do processing in type controller
            var i2b2Data = $.extend(true, {}, node.data.i2b2);
            if (i2b2.sdx.TypeControllers[sdxType].dragStartHandler !== undefined) {
                i2b2Data = i2b2.sdx.TypeControllers[sdxType].dragStartHandler(i2b2Data);
            } else {
                // i2b2 data
                delete i2b2Data.origData.xmlOrig;
                delete i2b2Data.origData.parent;
                delete i2b2Data.renderData.idDOM;
                if (i2b2.sdxUnderlyingPackage !== undefined) {
                    delete i2b2Data.sdxUnderlyingPackage.origData.xmlOrig;
                    delete i2b2Data.sdxUnderlyingPackage.origData.parent;
                }
            }
            // attach the filtered results to dragged object
            // first is main data available only after drop
            node.event.originalEvent.dataTransfer.setData("application/i2b2+json", JSON.stringify(i2b2Data));
            // next is sdxType data we are sending in the MIME type content label that can be read during hover over
            var sdxTypeString = i2b2Data.sdxInfo.sdxType;
            var sdxTypeData = [i2b2Data.sdxInfo.sdxControlCell + ":" + i2b2Data.sdxInfo.sdxType];
            if (i2b2Data.sdxUnderlyingPackage !== undefined) {
                sdxTypeString += "+" + i2b2Data.sdxUnderlyingPackage.sdxInfo.sdxType;
                sdxTypeData.push(i2b2Data.sdxUnderlyingPackage.sdxInfo.sdxControlCell + ":" + i2b2Data.sdxUnderlyingPackage.sdxInfo.sdxType);
            }
            node.event.originalEvent.dataTransfer.setData("application/i2b2-sdxType+" + sdxTypeString, JSON.stringify(sdxTypeData));
        }
    } catch (e) {}
};


// ================================================================================================== //
i2b2.sdx.Master.getChildRecords = function(sdxParent, onCompleteCallback) {
    var sdxType = sdxParent.sdxInfo.sdxType;
    if (i2b2.sdx.TypeControllers[sdxType] !== undefined) {
        i2b2.sdx.TypeControllers[sdxParent.sdxInfo.sdxType].getChildRecords(sdxParent, onCompleteCallback);
    }
};


// hack to allow drag targets to alter their target DOM
document.addEventListener("dragstart", function(event) {
    $(".i2b2DropTarget").addClass("i2b2DropPrep");
}, false);
document.addEventListener("dragend", function(event) {
    $(".i2b2DropTarget").removeClass("i2b2DropPrep");
}, false);


console.timeEnd('execute time');
console.groupEnd();