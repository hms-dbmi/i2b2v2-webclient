
i2b2.WORK.view.main = new i2b2Base_cellViewController(i2b2.WORK, 'main');

// ================================================================================================== //
i2b2.WORK.view.main._generateTvNode = function(title, nodeData, parentNode){
    let funcAddWrkNode = function(renderInfo){
        let nodeInfo = {
            i2b2_NodeRenderData: {
                idDOM: "WRK_TV-" + i2b2.GUID(),
                class: renderInfo.cssClass,
                icon: renderInfo.icon,
                annotation: renderInfo.annotation
            },
            title: nodeData.annotation,
            text: title,
            icon: renderInfo.cssClass,
            key: nodeData.key,
            i2b2: i2b2.sdx.Master.EncapsulateData('WRK', nodeData)
        };
        if (parentNode !== undefined) {
            nodeInfo.parentKey = parentNode;
        }
        return nodeInfo;
    };
    let render = {};
    let renderObj = {};
    switch (nodeData.visual) {
        case "CA":
            render.cssClass = "sdxStyleWORK-WRK";
            render.canExpand = true;
            render.iconType = "wrkRoot";
            render.icon = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/sdx_WORK_root.svg';
            render.iconExp = render.icon;
            renderObj = funcAddWrkNode(render);

            // TODO: Finish coding this so that the rendered node (root folder) is a drop target for all SDX types???
            // let id = renderObj.i2b2_NodeRenderData.idDOM;

            return renderObj;
            break;
        case "FA":
            render.cssClass = "sdxStyleWORK-WRK";
            render.canExpand = true;
            render.iconType = "wrkFolder";
            render.icon = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/sdx_WORK_folder.svg';
            render.iconExp = render.icon;
            renderObj = funcAddWrkNode(render);

            //TODO: Finish coding this so that the rendered node (child folder) is a drop target for all SDX types???
            //let id = renderObj.i2b2_NodeRenderData.idDOM;

            return renderObj;
            break;
        case "ZA":
            // create a new WORK SDX object
            let o = nodeData;
            o.index = nodeData.key;
            try {
                let sdxDataNode = i2b2.sdx.Master.EncapsulateData('WRK', o);
                let renderOptions = {
                    'title': title,
                    'tooltip': nodeData.annotation.replace("\n", "\nAnnotation: "), // PARTIAL BUG-FIX: WEBCLIENT-98
                    // TODO: Set the correct icon for Modifiers that have been dropped into the workplace
                    icon: i2b2.ONT.model.icons.term
                };
                sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
                if (!sdxDataNode.renderData) {
                    break;
                }

                sdxDataNode.renderData.idDOM = "WRK_TV-" + i2b2.GUID();
                let temp = {
                    title: sdxDataNode.renderData.moreDescriptMinor,
                    text: sdxDataNode.renderData.title,
                    icon: sdxDataNode.renderData.cssClassMain,
                    key: sdxDataNode.sdxInfo.sdxKeyValue,
                    iconImg: sdxDataNode.renderData.iconImg,
                    iconImgExp: sdxDataNode.renderData.iconImgExp,
                    i2b2: sdxDataNode
                };
                temp.state = sdxDataNode.renderData.tvNodeState;
                if(sdxDataNode.renderData.cssClassMinor !== undefined) {
                    temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
                }

                if (parentNode  === undefined) {
                    temp.parentKey = undefined;
                } else {
                    temp.parentKey = parentNode;
                }
                renderObj = temp;
            } catch (e) {}
            break;
        default:
            break;
    }
    return renderObj;
};


// ================================================================================================== //
i2b2.WORK.view.main.loadChildren = function(e, nodeData){
    if (nodeData.i2b2.sdxInfo.sdxKeyValue === undefined) {
        console.error('i2b2.WORK.view.main.loadChildren could not find tv_node.data.i2b2_SDX');
        return;
    }
    // create callback display routine
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = i2b2.WORK;
    scopedCallback.callback = function(results){
        let newNodes = [];
        let parentNode = results.msgParams.parent_key_value;
        let nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
        for (let i = 0; i < nlst.length; i++) {
            let s = nlst[i];
            let nodeData = {};
            nodeData.xmlOrig = s.outerHTML;
            nodeData.index = i2b2.h.getXNodeVal(s, "index");
            nodeData.key = nodeData.index;
            nodeData.name = i2b2.h.getXNodeVal(s, "folder/name");
            nodeData.annotation = i2b2.h.getXNodeVal(s, "tooltip");
            nodeData.share_id = i2b2.h.getXNodeVal(s, "share_id");
            nodeData.visual = String(i2b2.h.getXNodeVal(s, "visual_attributes")).trim();
            nodeData.encapType = i2b2.h.getXNodeVal(s, "work_xml_i2b2_type");
            nodeData.isRoot = false;
            // create new root node
            newNodes.push(i2b2.WORK.view.main._generateTvNode(nodeData.name, nodeData, parentNode));
        }
        // filter bad nodes
        newNodes = newNodes.filter(function(v) { return (typeof v === 'object' && JSON.stringify(v) !== '{}'); });
        // push new nodes into the treeview
        i2b2.WORK.view.main.treeview.treeview('addNodes', [
            newNodes,
            function(parent, child){ return parent.key === child.parentKey },
            false
        ]);

        // change the treeview icon to show it is no longer loading
        i2b2.WORK.view.main.treeview.treeview('setNodeLoaded', [
            function(parent, parentKey){ return parent.key === parentKey },
            parentNode
        ]);

        // render tree
        i2b2.WORK.view.main.treeview.treeview('redraw', []);
    };
    // ajax communicator call
    let varInput = {
        parent_key_value: nodeData.i2b2.sdxInfo.sdxKeyValue,
        result_wait_time: 180
    };
    i2b2.WORK.ajax.getChildren("WORK:Workplace", varInput, scopedCallback);
};


// ================================================================================================== //
i2b2.WORK.view.main.ContextMenuRouter = function(a1, a2, a3){
    let ctxData = i2b2.WORK.view.main.contextTvNode;
    switch (a3) {
        case 'newFolder':
            i2b2.WORK.ctrlr.main.NewFolder(ctxData);
            break;
        case 'rename':
            i2b2.WORK.ctrlr.main.Rename(ctxData);
            break;
        case 'annotate':
            i2b2.WORK.ctrlr.main.Annotate(ctxData);
            break;
        case 'delete':
            i2b2.WORK.ctrlr.main.Delete(ctxData);
            break;
    }
};


// ==================================================================================================
i2b2.WORK.view.main.DropChecker = function(targetEl, ev, parentEl) {
    // see if it is a treeview node
    let nodeID = $(targetEl).data("nodeid");
    if (typeof nodeID === "undefined") return false;
    // get the treeview node data
    //let nodeData =$(targetEl).parent().parent().data("treeview").getNode(nodeID); //$(parentEl).data("treeview").getNode(nodeID);

    let nodeData = i2b2.WORK.view.main.treeview.data("treeview").getNode(nodeID);
    return (["CA", "FA"].includes(nodeData.i2b2.origData.visual));
};


// ==================================================================================================
i2b2.WORK.view.main.treeRedraw = function() {
    // attach HTML5 drag drop attribute
    $(i2b2.WORK.view.main.lm_view.element).find('li:not(:has(span.tv-depth-1))').attr("draggable", true);
    i2b2.WORK.view.main.treeview.treeview('getNodes', function() { return true }).forEach((treeItem) => {
        let treeview = $(treeItem.el_Node);
        if (treeItem.el_Node.hasClass("i2b2DropPrep") || treeItem.el_Node.hasClass("i2b2DropTarget")) return;

        i2b2.sdx.Master.AttachType(treeview, "CONCPT");
        i2b2.sdx.Master.AttachType(treeview, "WRK");
        i2b2.sdx.Master.AttachType(treeview, "QM");
        i2b2.sdx.Master.AttachType(treeview, "QI");
        i2b2.sdx.Master.AttachType(treeview, "PRC");
        i2b2.sdx.Master.AttachType(treeview, "PRS");
        i2b2.sdx.Master.AttachType(treeview, "ENS");
        i2b2.sdx.Master.AttachType(treeview, "PR");
        /* i2b2.sdx.Master.AttachType(treeview, "QDEF");
         i2b2.sdx.Master.AttachType(treeview, "QGDEF");
         i2b2.sdx.Master.AttachType(treeview, "XML");*/

        i2b2.sdx.Master.setHandlerCustom(treeview, "CONCPT", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "WRK", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "QM", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "PRC", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "PRS", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "ENS", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "PR", "DropHandler", i2b2.WORK.view.main.DropHandler);
        /*i2b2.sdx.Master.setHandlerCustom(treeview, "QDEF", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "QGDEF", "DropHandler", i2b2.WORK.view.main.DropHandler);
        i2b2.sdx.Master.setHandlerCustom(treeview, "XML", "DropHandler", i2b2.WORK.view.main.DropHandler);*/

        i2b2.sdx.Master.setHandlerCustom(treeview, "CONCPT", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "WRK", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "QM", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "PRC", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "PRS", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "ENS", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "PR", "DropChecker", i2b2.WORK.view.main.DropChecker);
        /*i2b2.sdx.Master.setHandlerCustom(treeview, "QDEF", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "QGDEF", "DropChecker", i2b2.WORK.view.main.DropChecker);
        i2b2.sdx.Master.setHandlerCustom(treeview, "XML", "DropChecker", i2b2.WORK.view.main.DropChecker);*/

    });
};

// ======================================================================================
i2b2.WORK.view.main.refreshNode = function(target_node, isParent){
    let parentNode;
    if(isParent){
        parentNode = target_node;
    }
    else{
        parentNode = i2b2.WORK.view.main.treeview.treeview('getParent', [target_node]);
    }

    let parentChildren = [];
    if(parentNode.nodes) {
        parentChildren = parentNode.nodes.map(function (node) {
            return node.nodeId;
        });
    }

    //these state settings force reload of the tree node
    parentNode.state.loaded = false;
    parentNode.state.expanded = false;
    parentNode.state.requested = false;

    parentNode.refTreeview.deleteNodes(parentChildren, true);
    parentNode.refTreeview.expandNode(parentNode.nodeId);
}

// ======================================================================================
i2b2.WORK.view.main.DropHandler = function(sdx, evt, handlerSelector){
    let treeview = $(evt.currentTarget).closest(".treeview").data("treeview");
    // remove the hover and drop target fix classes
    $(evt.target).closest(".i2b2DropTarget").removeClass("DropHover");
    $(evt.target).closest(".i2b2DropTarget").removeClass("i2b2DropPrep");

    let dropTarget = treeview.getNode($(evt.originalEvent.target).data("nodeid"));
    let droppedNodeKey = sdx.sdxInfo.sdxKeyValue;   

    // ignore the tricky double triggering by the SDX subsystem
    if (handlerSelector !== sdx.sdxInfo.sdxType) return false;

    // ignore modifiers
    if (sdx.origData.conceptModified !== undefined) return false;

    // ignore if a node is dropped on itself
    if (dropTarget.i2b2.sdxInfo.sdxKeyValue === droppedNodeKey) return false;

    // see if we are moving a node within the workspace
    if (dropTarget.i2b2.sdxInfo.sdxType === "WRK") {        
        // we can only drop things into a workspace folder
        if (sdx.sdxInfo.sdxType === "WRK") {
            // Drag and drop within the Workspace
            let parentNode = treeview.getParent(dropTarget.nodeId);
            // See if user is trying to drag a parent into the child (this should be prevented!)
            while (parentNode !== undefined) {
                // drill up the ancestor nodes to see if any of them have been dropped on one of their children
                if (parentNode.i2b2.sdxInfo.sdxKeyValue === droppedNodeKey) {
                    alert("You cannot move a parent folder into a folder that is its child.");
                    return false;
                }
                parentNode = treeview.getParent(parentNode.nodeId);
            }
            i2b2.WORK.ctrlr.main.MoveWorkItem(sdx, dropTarget);
        } else {
            // saves the external item to the workspace
            i2b2.WORK.ctrlr.main.AddWorkItem(sdx, dropTarget);
        }
    }
};

// ======================================================================================
i2b2.WORK.view.main.displayContextDialog = function(inputData){
    let contextDialogModal = $("#workContextDialog");
    if (contextDialogModal.length === 0) {
        $("body").append("<div id='workContextDialog'/>");
        contextDialogModal = $("#workContextDialog");
    }
    contextDialogModal.empty();

    i2b2.WORK.view.main.dialogCallbackWrapper = function(event) {
        if (inputData.confirmMsg) {
            inputData.onOk();
            $("#WKContextMenuDialog").modal('hide');
        }
        else {
            let newValueInput = $("#WKContextMenuInput");
            let newValue = newValueInput.val().trim();
            newValueInput.val(newValue);
            if(inputData.required && newValue.length === 0){
                $("#workContextDialog .required-input").addClass("visible");

            }
            else{
                inputData.onOk(newValue);
                $("#WKContextMenuDialog").modal('hide');
            }
        }
    }

    i2b2.WORK.view.main.dialogKeyupCallbackWrapper = function(event) {
        if(event.keyCode === 13){
            $("#WKContextMenuDialog .context-menu-save").click();
        }
        else if(inputData.required){
            $("#workContextDialog .required-input").removeClass("visible");
        }
    }

    let data = {
        "title": inputData.title,
        "inputLabel": inputData.prompt,
        "placeHolder": inputData.placeHolder,
        "confirmMsg": inputData.confirmMsg,
        "onOk": "i2b2.WORK.view.main.dialogCallbackWrapper(event)",
        "onKeyup": "i2b2.WORK.view.main.dialogKeyupCallbackWrapper(event)",
        "inputValue" : inputData.inputValue,
        "onCancel": inputData.onCancel,
        "largeInput": inputData.largeInput
    };
    $(i2b2.WORK.view.main.templates.contextDialog(data)).appendTo(contextDialogModal);
    $("#WKContextMenuDialog").modal('show').on('shown.bs.modal', function() {
        $(this).find('[autofocus]').focus();
    });
}
// =========================================================
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "WORK") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.WORK.view.main",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                i2b2.WORK.view.main.lm_view = container;

                // add the cellWhite flare
                let treeTarget = $('<div class="cellWhite" id="i2b2TreeviewWork"></div>').appendTo(container.element);

                // create an empty treeview
                i2b2.WORK.view.main.treeview = $(treeTarget).treeview({
                    showBorder: false,
                    onhoverColor: "rgba(205, 208, 208, 0.56)",
                    highlightSelected: false,
                    dynamicLoading: true,
                    levels: 1,
                    data: []
                });

                i2b2.WORK.view.main.treeview.on('nodeLoading', i2b2.WORK.view.main.loadChildren);
                i2b2.WORK.view.main.treeview.on('onRedraw', i2b2.WORK.view.main.treeRedraw);
                i2b2.WORK.view.main.treeview.on('onDrag', i2b2.sdx.Master.onDragStart);

                // load the data
                i2b2.WORK.ctrlr.refreshAll();

                // -------------------- setup context menu --------------------
                i2b2.WORK.view.main.ContextMenu = new BootstrapMenu('#i2b2TreeviewWork li.list-group-item', {
                    fetchElementData: function($rowElem) {
                        // fetch the data from the treeview
                        return i2b2.WORK.view.main.treeview.treeview('getNode', $rowElem.data('nodeid'));
                    },
//            actionsGroups: [
//                ['nodeRename', 'nodeAnnotate', 'nodeDelete']
//            ],
                    // TODO: Finish wiring implementation
                    actions: {
                        nodeRename: {
                            name: 'Rename',
                            onClick: function(node) {
                                i2b2.WORK.ctrlr.main.Rename(node);
                            },
                            isShown: function(node) {
                                switch (node.i2b2.origData.visual) {
                                    case "FA":
                                    case "ZA":
                                        return true;
                                    default:
                                        return false;
                                }
                            }
                        },
                        nodeAnnotate: {
                            name: 'Annotate',
                            onClick: function(node) {
                                i2b2.WORK.ctrlr.main.Annotate(node);
                            },
                            isShown: function(node) {
                                switch (node.i2b2.origData.visual) {
                                    case "FA":
                                    case "ZA":
                                        return true;
                                    default:
                                        return false;
                                }
                            }
                        },
                        nodeDelete: {
                            name: 'Delete',
                            onClick: function(node) {
                                i2b2.WORK.ctrlr.main.Delete(node);
                            },
                            isShown: function(node) {
                                switch (node.i2b2.origData.visual) {
                                    case "FA":
                                    case "ZA":
                                        return true;
                                    default:
                                        return false;
                                }
                            }
                        },
                        newFolder: {
                            name: 'New Folder',
                            onClick: function (node) {
                                i2b2.WORK.ctrlr.main.NewFolder(node);
                            },
                            isShown: function (node) {
                                switch (node.i2b2.origData.visual) {
                                    case "CA":
                                    case "FA":
                                        return true;
                                    default:
                                        return false;
                                }
                            }
                        },
                        refreshAll: {
                            name: 'Refresh All',
                            onClick: function (node) {
                                i2b2.WORK.ctrlr.refreshAll();
                            },
                            isShown: function (node) {
                                switch (node.i2b2.origData.visual) {
                                    case "CA":
                                    case "FA":
                                        return true;
                                    default:
                                        return false;
                                }
                            }
                        }
                    }
                });

                i2b2.WORK.view.main.templates = {};
                $.ajax("js-i2b2/cells/WORK/templates/ContextMenuDialog.html", {
                    success: (template) => {
                        cell.view.main.templates.contextDialog = Handlebars.compile(template);
                    },
                    error: (error) => { console.error("Could not retrieve template: ContextMenuDialog.html"); }
                });

                container.on( 'tab', function( tab ){
                    if( tab.element.textContent === 'Workplace') {
                        //add unique id to the term tab
                        let elemId = "workplaceTab";
                        $(tab.element).attr("id", elemId);

                        let optionsBtn = $('<div id="workplaceOptions" class="menuOptions"><i class="bi bi-chevron-down" title="Workplace Options"></i></div>');
                        $(optionsBtn).insertAfter($(tab.element).find(".lm_title"));

                        i2b2.ONT.view.nav.options.ContextMenu = new BootstrapMenu("#workplaceOptions", {
                            menuEvent: "click",
                            actions: {
                                RefreshAll: {
                                    name: 'Refresh All',
                                    onClick: function (node) {
                                        i2b2.WORK.ctrlr.refreshAll();
                                    }
                                }
                            }
                        });
                    }
                });
            }).bind(this)
        );
    }
});
