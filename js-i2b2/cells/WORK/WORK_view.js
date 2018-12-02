console.group('Load & Execute component file: WORK > view > main');
console.time('execute time');



// ********* View: List ********* 
// create and save the view object
i2b2.WORK.view.main = new i2b2Base_cellViewController(i2b2.WORK, 'main');


// ================================================================================================== //






i2b2.WORK.view.main._generateTvNode = function(title, nodeData, parentNode){
    var funcAddWrkNode = function(renderInfo){
        var nodeInfo = {
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
        if (!i2b2.h.isUndefined(parentNode)) {
            nodeInfo.parentKey = parentNode;
        }
        return nodeInfo;
    };
    var render = {};
    var renderObj = {};
    switch (nodeData.visual) {
        case "CA":
            render.cssClass = "sdxStyleWORK-WRK";
            render.canExpand = true;
            render.iconType = "wrkRoot";
            render.icon = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/WORK_root.gif';
            render.iconExp = render.icon;
            renderObj = funcAddWrkNode(render);
            var id = renderObj.i2b2_NodeRenderData.idDOM;

            return renderObj;
            //TODO: Finish coding this
            /*
            var ddProxy = i2b2.sdx.Master.Attach2Data(id, "WRK", id);
            i2b2.sdx.Master.AttachType(id, "QM", optDD);
            i2b2.sdx.Master.AttachType(id, "PRC", optDD);
            i2b2.sdx.Master.AttachType(id, "PRS", optDD);
            i2b2.sdx.Master.AttachType(id, "ENS", optDD);
            i2b2.sdx.Master.AttachType(id, "PR", optDD);
            i2b2.sdx.Master.AttachType(id, "CONCPT", optDD);
            i2b2.sdx.Master.AttachType(id, "QDEF", optDD);
            i2b2.sdx.Master.AttachType(id, "QGDEF", optDD);
            i2b2.sdx.Master.AttachType(id, "XML", optDD);
            i2b2.sdx.Master.AttachType(id, "WRK", optDD);

            i2b2.sdx.Master.setHandlerCustom(id, "QM", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "PRC", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "PRS", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "ENS", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "PR", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "CONCPT", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "QDEF", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "QGDEF", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "XML", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "WRK", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);

            i2b2.sdx.Master.setHandlerCustom(id, "QM", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "PRC", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "PRS", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "ENS", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "PR", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "CONCPT", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "QDEF", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "QGDEF", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "XML", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "WRK", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);

            i2b2.sdx.Master.setHandlerCustom(id, "QM", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "PRC", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "PRS", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "ENS", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "PR", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "CONCPT", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "QDEF", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "QGDEF", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "XML", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "WRK", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            */
            break;
        case "FA":
            render.cssClass = "sdxStyleWORK-WRK";
            render.canExpand = true;
            render.iconType = "wrkFolder";
            render.icon = i2b2.hive.cfg.urlFramework + 'cells/WORK/assets/WORK_folder.gif';
            render.iconExp = render.icon;
            renderObj = funcAddWrkNode(render);
            var id = renderObj.i2b2_NodeRenderData.idDOM;
            return renderObj;

            //TODO: Finish coding this
            /*
            var ddProxy = i2b2.sdx.Master.Attach2Data(id, "WRK", id);
            ddProxy.yuiTreeNode = renderObj;
            var optDD = {
                dropTarget: true
            };
            i2b2.sdx.Master.AttachType(id, "QM", optDD);
            i2b2.sdx.Master.AttachType(id, "PRC", optDD);
            i2b2.sdx.Master.AttachType(id, "PRS", optDD);
            i2b2.sdx.Master.AttachType(id, "ENS", optDD);
            i2b2.sdx.Master.AttachType(id, "PR", optDD);
            i2b2.sdx.Master.AttachType(id, "CONCPT", optDD);
            i2b2.sdx.Master.AttachType(id, "QDEF", optDD);
            i2b2.sdx.Master.AttachType(id, "QGDEF", optDD);
            i2b2.sdx.Master.AttachType(id, "XML", optDD);
            i2b2.sdx.Master.AttachType(id, "WRK", optDD);

            i2b2.sdx.Master.setHandlerCustom(id, "QM", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "PRC", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "PRS", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "ENS", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "PR", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "CONCPT", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "QDEF", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "QGDEF", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "XML", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);
            i2b2.sdx.Master.setHandlerCustom(id, "WRK", "DropHandler", i2b2.WORK.ctrlr.main.HandleDrop);

            i2b2.sdx.Master.setHandlerCustom(id, "QM", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "PRC", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "PRS", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "ENS", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "PR", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "CONCPT", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "QDEF", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "QGDEF", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "XML", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);
            i2b2.sdx.Master.setHandlerCustom(id, "WRK", "onHoverOver", i2b2.WORK.view.main.ddHoverOver);

            i2b2.sdx.Master.setHandlerCustom(id, "QM", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "PRC", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "PRS", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "ENS", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "PR", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "CONCPT", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "QDEF", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "QGDEF", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "XML", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            i2b2.sdx.Master.setHandlerCustom(id, "WRK", "onHoverOut", i2b2.WORK.view.main.ddHoverOut);
            */
            break;
        case "ZA":
            // create a new WORK SDX object
            var o = nodeData;
            o.index = nodeData.key;
            try {
                var sdxDataNode = i2b2.sdx.Master.EncapsulateData('WRK', o);
                var renderOptions = {
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
                var temp = {
                    title: sdxDataNode.renderData.moreDescriptMinor,
                    text: sdxDataNode.renderData.title,
                    icon: sdxDataNode.renderData.cssClassMain,
                    key: sdxDataNode.sdxInfo.sdxKeyValue,
                    iconImg: sdxDataNode.renderData.iconImg,
                    iconImgExp: sdxDataNode.renderData.iconImgExp,
                    i2b2: sdxDataNode
                };
                temp.state = sdxDataNode.renderData.tvNodeState;
                if(!i2b2.h.isUndefined(sdxDataNode.renderData.cssClassMinor)) {
                    temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
                }

                if (i2b2.h.isUndefined(parentNode)) {
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


i2b2.WORK.view.main.loadChildren = function(e, nodeData){
    if (i2b2.h.isUndefined(nodeData.i2b2.sdxInfo.sdxKeyValue)) {
        console.error('i2b2.WORK.view.main.loadChildren could not find tv_node.data.i2b2_SDX');
        return;
    }
    // create callback display routine
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = i2b2.WORK;
    scopedCallback.callback = function(results){
        var newNodes = [];
        var parentNode = results.msgParams.parent_key_value;
        var nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
        for (var i = 0; i < nlst.length; i++) {
            var s = nlst[i];
            var nodeData = {};
            nodeData.xmlOrig = s;
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
        newNodes = newNodes.filter(function(v) { return (typeof v == 'object' && JSON.stringify(v) != '{}'); });
        // push new nodes into the treeview
        i2b2.WORK.view.main.treeview.treeview('addNodes', [
            newNodes,
            function(parent, child){ return parent.key == child.parentKey },
            false
        ]);

        // change the treeview icon to show it is no longer loading
        i2b2.WORK.view.main.treeview.treeview('setNodeLoaded', [
            function(parent, parentKey){ return parent.key == parentKey },
            parentNode
        ]);
        // render tree
        i2b2.WORK.view.main.treeview.treeview('redraw', []);
        // reset the loading icon in the stack buttons list
        $('#stackRefreshIcon_i2b2-WORK-view-main').removeClass("refreshing");
    };
    // ajax communicator call
    var varInput = {
        parent_key_value: nodeData.i2b2.sdxInfo.sdxKeyValue,
        result_wait_time: 180
    };
    // set loading icon in the stack buttons list
    $('#stackRefreshIcon_i2b2-WORK-view-main').addClass("refreshing");

    i2b2.WORK.ajax.getChildren("WORK:Workplace", varInput, scopedCallback);
};


// ================================================================================================== //
i2b2.WORK.view.main.ContextMenuRouter = function(a1, a2, a3){
    var ctxData = i2b2.WORK.view.main.contextTvNode;
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
}

// ==================================================================================================
i2b2.WORK.view.main.DropHandler = function(a1, a2){
    alert("i2b2.WORK.view.main.DropHandler() received a drop event");
    console.dir(this);
    console.dir(a1);
    console.dir(a2);
};


// ==================================================================================================
i2b2.WORK.view.main.DropChecker = function(targetEl, ev, parentEl) {
    // see if it is a treeview node
    let nodeID = $(targetEl).data("nodeid");
    if (typeof nodeID === "undefined") {
        return false;
    }
    // get the treeview node data
    let nodeData = $(parentEl).data("treeview").getNode(nodeID);
    if (nodeData.i2b2.origData.visual == "CA" || nodeData.i2b2.origData.visual == "FA" ) {
        return true;
    }
    return false;
};

// ==================================================================================================
i2b2.WORK.view.main.treeRedraw = function() {
    // attach drag drop attribute
    i2b2.WORK.view.main.lm_view._contentElement.find('li:not(:has(span.tv-depth-1))').attr("draggable", true);
};



// =========================================================
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode == "WORK") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.WORK.view.main",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                i2b2.WORK.view.main.lm_view = container;

                // add the cellWhite flare
                var treeTarget = $('<div class="cellWhite" id="i2b2TreeviewWork"></div>').appendTo(container._contentElement);

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

            }).bind(this)
        );
        return;
	}


}));
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
// =========================================================


// =========================================================

i2b2.events.afterLogin.add((function(cell_list) {
    // create initial loader display routine
}).bind(i2b2.WORK));


i2b2.events.afterHiveInit.add((function(cell_list){
    console.debug('[EVENT CAPTURED i2b2.events.afterHiveInit]');
}).bind(i2b2.WORK));
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
// =========================================================



console.timeEnd('execute time');
console.groupEnd();
