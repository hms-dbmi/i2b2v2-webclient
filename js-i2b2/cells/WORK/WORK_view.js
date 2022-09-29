console.group('Load & Execute component file: WORK > view > main');
console.time('execute time');


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
            render.icon = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/sdx_WORK_root.gif';
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
            render.icon = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/sdx_WORK_folder.gif';
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
                    icon: {
                        root: "sdx_ONT_CONCPT_root.gif",
                        rootExp: "sdx_ONT_CONCPT_root-exp.gif",
                        branch: "sdx_ONT_CONCPT_branch.gif",
                        branchExp: "sdx_ONT_CONCPT_branch-exp.gif",
                        leaf: "sdx_ONT_CONCPT_leaf.gif"
                    }
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
        // reset the loading icon in the stack buttons list
        $('#stackRefreshIcon_i2b2-WORK-view-main').removeClass("refreshing");
    };
    // ajax communicator call
    let varInput = {
        parent_key_value: nodeData.i2b2.sdxInfo.sdxKeyValue,
        result_wait_time: 180
    };
    // set loading icon in the stack buttons list
    $('#stackRefreshIcon_i2b2-WORK-view-main').addClass("refreshing");

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
    let nodeData = $(parentEl).data("treeview").getNode(nodeID);
    return (nodeData.i2b2.origData.visual === "CA" || nodeData.i2b2.origData.visual === "FA" );
};


// ==================================================================================================
i2b2.WORK.view.main.treeRedraw = function() {
    // attach HTML5 drag drop attribute
    i2b2.WORK.view.main.lm_view._contentElement.find('li:not(:has(span.tv-depth-1))').attr("draggable", true);
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
    let parentChildren = parentNode.nodes.map(function(node) { return node.nodeId; });
    parentNode.refTreeview.deleteNodes(parentChildren, true);
    parentNode.refTreeview.expandNode(parentNode.nodeId);
}
// ======================================================================================

// ======================================================================================
i2b2.WORK.view.main.displayContextDialog = function(inputData){
    let contextDialogModal = $("#workContextDialog");
    if (contextDialogModal.length === 0) {
        $("body").append("<div id='workContextDialog'/>");
        contextDialogModal = $("#workContextDialog");
    }
    contextDialogModal.empty();

    i2b2.WORK.view.main.dialogCallbackWrapper = function() {
        let newValue = $("#WKContextMenuInput").val();
        inputData.onOk(newValue);
        $("#WKContextMenuDialog").modal('hide');
    }

    let data = {
        "title": inputData.title,
        "inputLabel": inputData.prompt,
        "placeHolder": inputData.placeHolder,
        "onOk": "i2b2.WORK.view.main.dialogCallbackWrapper()",
        "inputValue" : inputData.inputValue,
        "onCancel": inputData.onCancel
    };
    $(i2b2.WORK.view.main.templates.contextDialog(data)).appendTo(contextDialogModal);
    $("#WKContextMenuDialog").modal('show');
}
// =========================================================
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode === "WORK") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.WORK.view.main",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                i2b2.WORK.view.main.lm_view = container;

                // add the cellWhite flare
                let treeTarget = $('<div class="cellWhite" id="i2b2TreeviewWork"></div>').appendTo(container._contentElement);

                // create an empty treeview
                i2b2.WORK.view.main.treeview = $(treeTarget).treeview({
                    showBorder: false,
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

                // attach SDX object DragDrop handlers
                let treeview = i2b2.WORK.view.main.treeview[0];
                i2b2.sdx.Master.AttachType(treeview, "QM");
                i2b2.sdx.Master.AttachType(treeview, "QI");
                i2b2.sdx.Master.AttachType(treeview, "PRC");
                i2b2.sdx.Master.AttachType(treeview, "PRS");
                i2b2.sdx.Master.AttachType(treeview, "ENS");
                i2b2.sdx.Master.AttachType(treeview, "PR");
                i2b2.sdx.Master.AttachType(treeview, "CONCPT");
                i2b2.sdx.Master.AttachType(treeview, "QDEF");
                i2b2.sdx.Master.AttachType(treeview, "QGDEF");
                i2b2.sdx.Master.AttachType(treeview, "XML");
                i2b2.sdx.Master.AttachType(treeview, "WRK");

                i2b2.sdx.Master.setHandlerCustom(treeview, "QM", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "PRC", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "PRS", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "ENS", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "PR", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "CONCPT", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "QDEF", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "QGDEF", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "XML", "DropHandler", i2b2.WORK.view.main.DropHandler);
                i2b2.sdx.Master.setHandlerCustom(treeview, "WRK", "DropHandler", i2b2.WORK.view.main.DropHandler);

                i2b2.sdx.Master.setHandlerCustom(treeview, "QM", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "PRC", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "PRS", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "ENS", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "PR", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "CONCPT", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "QDEF", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "QGDEF", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "XML", "DropChecker", i2b2.WORK.view.main.DropChecker);
                i2b2.sdx.Master.setHandlerCustom(treeview, "WRK", "DropChecker", i2b2.WORK.view.main.DropChecker);



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
                                console.dir(node);
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
                                console.dir(node);
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
                                console.dir(node);
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
                                console.dir(node);
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
            }).bind(this)
        );
    }
}));


// =========================================================
console.timeEnd('execute time');
console.groupEnd();
