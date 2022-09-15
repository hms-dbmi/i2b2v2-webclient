/**
 * @projectDescription	Standard Data Exchange (SDX) subsystem's core message router. [V2 rewrite]
 * @inherits 	i2b2
 * @namespace	i2b2
 * @version 	2.0
 **/
console.group('Load & Execute component file: hive > SDX');
console.time('execute time');

i2b2.sdx.Master = {};
i2b2.sdx.TypeControllers = {};
i2b2.sdx.Master._nativeTargetRefs = {};


// ================================================================================================== //
i2b2.sdx.Master.EncapsulateData = function(inType, inData) {
	if (typeof inData !== 'object') {
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
};


// ================================================================================================== //
i2b2.sdx.Master._KeyHash = function(key) {
    // create hash from key
    var kh = escape(key);
    kh = kh.replace('%','_');
    return "H$__"+kh;
};


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
    eventHandlers = $j(this).data("i2b2DragdropEvents");

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
                    eventHandlers[sdxType].DropHandler([sdxJSON], e);
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
    // TODO: clean up these array processing hacks
    let typeCode;
    if (sdxData[0]) {
        typeCode = sdxData[0].sdxInfo.sdxType;
    } else {
        typeCode = sdxData.sdxInfo.sdxType;
    }
    // do we have the container registered?
    let t = "";
    try {
        t = this._sysData[DroppedOnID][typeCode].DropHandler;
    } catch(e) {
        console.error("SDX DropHandler does not exist for drop target!");
        console.groupEnd();
        return false;
    }
    console.groupEnd();
    // TODO: perform any needed type translation
    let sdxObjs = [];
    // TODO: clean up these array processing hacks
    if (sdxData[0]) {
        sdxData.each(function(sdxRec){
            if (sdxRec.sdxInfo.sdxType === typeCode) { sdxObjs.push(sdxRec); }
        });
    } else {
        sdxObjs.push(sdxData);
    }
    this._sysData[DroppedOnID][typeCode].DropHandler(sdxObjs, DroppedOnID);
};


// ================================================================================================== //
i2b2.sdx.Master.AttachType = function(container, typeCode, options) {
    // change the container into a DOM element reference
    if (typeof container === "string") {
    	let el = $j("#"+container);
        if (el === null) {
        	console.error("Could not find element with ID of '"+container+"'");
        	container = null;
        	return false;
        } else {
        	container = el;
		}
    }
    // manage if it is a jQuery reference
    if (container.length && container.length > 0) {
        container = container[0];
    }

    // add class for target bubbling
	$j(container).addClass("i2b2DropTarget");

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
        let dd_events = $j(container).data("i2b2-dragdrop-events");
        if (typeof dd_events === "undefined") {
            dd_events = {};
        }
        // add new events
        dd_events[typeCode] = {
//            "RenderHTML": i2b2.sdx.Master.getHandlerDefault(typeCode, "RenderHTML"),
//            "AppendTreeNode": i2b2.sdx.Master.getHandlerDefault(typeCode, "AppendTreeNode"),
//            "LoadChildrenFromTreeview":i2b2.sdx.Master.getHandlerDefault(typeCode, "LoadChildrenFromTreeview"),
            "onHoverOver":i2b2.sdx.Master.getHandlerDefault(typeCode, "onHoverOver"),
            "onHoverOut":i2b2.sdx.Master.getHandlerDefault(typeCode, "onHoverOut"),
            "DropHandler":i2b2.sdx.Master.setHandlerDefault(typeCode, "DropHandler")
        };
        $j(container).data("i2b2-dragdrop-events", dd_events);

        // start listening for DD events
        $j(container).on("drop dragover dragenter dragleave", i2b2.sdx.Master.onDragDropEvents);

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
        container = $j("#" + container);
        if (container.length === 0) {
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
        let dd_events = $j(container).data("i2b2-dragdrop-events");
        if (typeof dd_events === "undefined") {
            dd_events = {};
        }
        // add new events
        dd_events[typeCode][handlerName] = newHandlerFunction;
        $j(container).data("i2b2-dragdrop-events", dd_events);
        return true;
    }
};


// ================================================================================================== //
i2b2.sdx.Master.setHandlerDefault = function(containerID, typeCode, handlerName) {
    // containerID: string
    // typeCode: string
    // handlerName: string (example: Render, AddChild, ddStart, ddMove)
    // newHandlerFunction: function to be used
    if (undefined === i2b2.sdx.TypeControllers[typeCode]) {
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
};


// ================================================================================================== //
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
};


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

    let funcName = "[i2b2.sdx.Master.RenderData] ";
    if (sdxDataPackage === undefined) {
        console.error(funcName +'the SDX Data Package is empty!');
        return false;
    }
    let sdxType;
    try {
        sdxType = sdxDataPackage.sdxInfo.sdxType;
    } catch (e) {
        console.error(funcName+'the data object type is not valid!');
        return false;
    }

    if (i2b2.sdx.TypeControllers[sdxType].RenderData === undefined) {
        console.error(funcName+'the SDX Controller for '+sdxType+' does not handle RenderData!');
        return false;
    }

    let ret = i2b2.sdx.TypeControllers[sdxType].RenderData(sdxDataPackage, options);

    if (ret) {
        // default values
        if (ret.title === undefined) ret.title = '';
        if (ret.iconImg === undefined) ret.iconImg = '';
        if (ret.iconImgExp === undefined) ret.iconImgExp = '';
        if (ret.cssClassMain === undefined) ret.cssClassMain = '';
        if (ret.cssClassMinor === undefined) ret.cssClassMinor = '';
        if (ret.moreDescriptMain === undefined) ret.moreDescriptMain = '';
        if (ret.moreDescriptMinor === undefined) ret.moreDescriptMinor = '';
        if (ret.tvNodeState === undefined) ret.tvNodeState = {};
    }

    return ret;
};
// <END Router Pattern using dynamic registration and per-target overrides END>


// ================================================================================================== //
i2b2.sdx.Master.onDragStart = function(event, node) {
    // route to the proper SDX type controller for management
    try {
        let sdxType = node.data.i2b2.sdxInfo.sdxType;
        if (i2b2.sdx.TypeControllers[sdxType] !== undefined) {
            // valid SDX type... do processing in type controller
            let i2b2Data = $j.extend(true, {}, node.data.i2b2);
            if (i2b2.sdx.TypeControllers[sdxType].dragStartHandler !== undefined) {
                i2b2Data = i2b2.sdx.TypeControllers[sdxType].dragStartHandler(i2b2Data);
            } else {
                // i2b2 data
                delete i2b2Data.origData.xmlOrig;
                delete i2b2Data.origData.parent;
                if (i2b2Data.renderData !== undefined) delete i2b2Data.renderData.idDOM;
                if (i2b2.sdxUnderlyingPackage !== undefined) {
                    delete i2b2Data.sdxUnderlyingPackage.origData.xmlOrig;
                    delete i2b2Data.sdxUnderlyingPackage.origData.parent;
                }
            }
            // attach the filtered results to dragged object
            // first is main data available only after drop
            node.event.originalEvent.dataTransfer.setData("application/i2b2+json", JSON.stringify(i2b2Data));
            // next is sdxType data we are sending in the MIME type content label that can be read during hover over
            let sdxTypeString = i2b2Data.sdxInfo.sdxType;
            let sdxTypeData = [i2b2Data.sdxInfo.sdxControlCell + ":" + i2b2Data.sdxInfo.sdxType];
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
    let sdxType = sdxParent.sdxInfo.sdxType;
    if (i2b2.sdx.TypeControllers[sdxType] !== undefined) {
        i2b2.sdx.TypeControllers[sdxParent.sdxInfo.sdxType].getChildRecords(sdxParent, onCompleteCallback);
    }
};


// ================================================================================================== //
// hack to allow drag targets to alter their target DOM
document.addEventListener("dragstart", function(event) {
    $j(".i2b2DropTarget").addClass("i2b2DropPrep");
}, false);


// ================================================================================================== //
document.addEventListener("dragend", function(event) {
    $j(".i2b2DropTarget").removeClass("i2b2DropPrep");
}, false);


// ================================================================================================== //
console.timeEnd('execute time');
console.groupEnd();