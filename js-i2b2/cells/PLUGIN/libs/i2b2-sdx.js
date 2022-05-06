/**
 * This file is the library that is loaded into a plugin to allow
 * SDX-style drag and drop with the main i2b2 UI.
 **/

i2b2.sdx = {};
i2b2.sdx = {};
i2b2.sdx.dd_events = {};
i2b2.sdx.AttachType = function(container, typeCode, options) {
    let isDomEl = true;

    // change the container into a DOM element reference
    if (typeof container === "string") {
        container = document.getElementById(container);
        if (container.length === 0) {
            container = null;
        }
    }

    // manage if it is a document reference
    if (container && container.length > 0) {
        container = container[0];
    }

    if(!container){
        return false;
    }

    // add class for target bubbling
    container.className += " i2b2DropTarget";

    // confirm that it is a proper DOM node
    let attrlist = [
        "ondrag",
        "ondragend",
        "ondragenter",
        "ondragover"
    ];

    while (attrlist.length) {
        if (typeof container[attrlist.pop()] !== "object") { isDomEl = false; }
    }

    // improper reference to a DOM element or element does not exist
    if (!isDomEl) {
        return false;
    } else {
        // attach/augment events using the jQuery .data() operation
        let dd_events = container.dataset["i2b2-dragdrop-events"];
        if (typeof dd_events === "undefined") {
            dd_events = {};
        }

        ['drop', 'dragover', 'dragenter', 'dragleave'].forEach(function(e) {
            container.addEventListener(e, i2b2.sdx.onDragDropEvents);
        });

        return true;
    }
};
//======================================================================================================================
i2b2.sdx.onDragDropEvents = function(e,a) {
    // get a list of SDX types that are in this DD operation
    let ev = e;
    let sdxTypeList = [];
    for (let i in ev.dataTransfer.types) {
        if (String(ev.dataTransfer.types[i]).toLowerCase().indexOf("application/i2b2-sdxtype+") === 0) {
            let sdxTypes = String(ev.dataTransfer.types[i]).toUpperCase().split("+");
            sdxTypes.shift();
            sdxTypeList = sdxTypeList.concat(sdxTypes);
        }
    }
    let eventHandlers = i2b2.sdx.dd_events[this.id];

    switch(e.type) {
        case "drop":
            // forward the event to the drop handler passing the object being dropped
            while (sdxTypeList.length) {
                let sdxType = sdxTypeList.pop();
                if (typeof eventHandlers[sdxType] === "object" && typeof eventHandlers[sdxType].DropHandler === "function") {
                    let sdxJSON = JSON.parse(e.dataTransfer.getData("application/i2b2+json"));
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
                        e.preventDefault();
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
            e.preventDefault();
            break;
        case "dragleave":
            while (sdxTypeList.length) {
                let sdxType = sdxTypeList.pop();
                if (typeof eventHandlers[sdxType] === "object" && typeof eventHandlers[sdxType].onHoverOut === "function") {
                    eventHandlers[sdxType].onHoverOut(e.target);
                }
            }
            e.preventDefault();
            break;
    }

    return false;
};

//======================================================================================================================
i2b2.sdx.setHandlerCustom = function(container, typeCode, handlerName, newHandlerFunction) {
    // containerID: string
    // typeCode: string
    // handlerName: string (example: Render, AddChild, ddStart, ddMove)
    // newHandlerFunction: function to be used
    // change the container into a DOM element reference

    if (typeof container === "string") {
        container = document.getElementById(container);
        if (container.length === 0) {
            container = null;
        }
    }

    // manage if it is a document reference
    if (container && container.length > 0) {
        container = container[0];
    }

    if(!container){
        return false;
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
        if (typeof i2b2.sdx.dd_events[container.id] === "undefined") {
            i2b2.sdx.dd_events[container.id] = {};
            i2b2.sdx.dd_events[container.id][typeCode] = {};
        }

        // add new events
        i2b2.sdx.dd_events[container.id][typeCode][handlerName] = newHandlerFunction;
        return true;
    }
};

window.addEventListener("I2B2_INIT_SDX", function(evt) {
    console.log("Initialize SDX routines");
    i2b2.sdx.TypeControllers = {};
    evt.detail.forEach(function(e) {
        i2b2.sdx.TypeControllers[e] = {};
    });

    // once initialized, sent the ready signal to the plugin's i2b2 loader
    window.dispatchEvent(new Event('I2B2_SDX_READY'));
});

