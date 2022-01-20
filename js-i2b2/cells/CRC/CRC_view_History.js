/**
 * @projectDescription	View controller for the history viewport. (CRC's "previous queries" window)
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.history
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: CRC > view > History');
console.time('execute time');


// create and save the screen objects
i2b2.CRC.view.history = new i2b2Base_cellViewController(i2b2.CRC, 'history');
i2b2.CRC.view.history.visible = false;
i2b2.CRC.view.history.params.maxQueriesDisp = 20; // TODO: This does not work
// define the option functions
// ================================================================================================== //
i2b2.CRC.view.history.showOptions = function(subScreen){};

// ================================================================================================== //
// deprecated functions
i2b2.CRC.view.history.ToggleNode = function(divTarg, divTreeID) {};
i2b2.CRC.view.history.selectTab = function(tabCode) {};
i2b2.CRC.view.history.Resize = function(e) {};
i2b2.CRC.view.history.splitterDragged = function()  {};
i2b2.CRC.view.history.ResizeHeight = function() {};
i2b2.CRC.view.history.ZoomView = function() {};





i2b2.CRC.view.history.loadChildren = function(ev, nodeData) {
    // called via i2b2.CRC.view.history.treeview.on('nodeLoading', i2b2.CRC.view.history.loadChildren)
    // and is used to load all the children for a single passed node

    if (i2b2.h.isUndefined(nodeData.i2b2.sdxInfo.sdxKeyValue)) {
        console.error('i2b2.CRC.view.history.loadChildren could not find tv_node.i2b2.sdxInfo');
        return;
    }

    $('#stackRefreshIcon_i2b2-CRC-view-history').addClass("refreshing");

    i2b2.sdx.Master.getChildRecords(nodeData.i2b2, (function(cellResult) {

        if (cellResult.error !== false) {return false;}

        // add the renderData to the nodes
        var newNodes = [];
        for ( var i1=0; i1 < cellResult.results.length; i1++) {
            var sdxDataNode = cellResult.results[i1];
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, {showchildren: true});
            sdxDataNode.renderData.idDOM = "CRC_H_TV-" + i2b2.GUID();
            var temp = {
                title: sdxDataNode.renderData.moreDescriptMinor,
                text: sdxDataNode.renderData.title,
                icon: sdxDataNode.renderData.cssClassMain,
                key: sdxDataNode.sdxInfo.sdxType + "-" + sdxDataNode.sdxInfo.sdxKeyValue,
                iconImg: sdxDataNode.renderData.iconImg,
                iconImgExp: sdxDataNode.renderData.iconImgExp,
                i2b2: sdxDataNode
            };
            temp.state = sdxDataNode.renderData.tvNodeState;
            if(!i2b2.h.isUndefined(sdxDataNode.renderData.cssClassMinor)) {
                temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
            }
            temp.parentKey = this.key;
            newNodes.push(temp);
        }

        // add the children to the parent node
        i2b2.CRC.view.history.treeview.treeview('addNodes', [
            newNodes,
            function(parent, child){ return parent.key == child.parentKey },
            false
        ]);

        // render tree
        i2b2.CRC.view.history.treeview.treeview('redraw', []);

        // change the treeview icon to show it is no longer loading
        $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");

    }).bind(nodeData));

};

i2b2.CRC.view.history.treeRedraw = function(ev, b) {
    // called via i2b2.CRC.view.history.treeview.on('onRedraw', i2b2.CRC.view.history.treeRedraw);
    $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");
    // attach drag drop attribute
    i2b2.CRC.view.history.lm_view._contentElement.find('li:not(:has(span.tvRoot))').attr("draggable", true);
};



//================================================================================================== //
i2b2.CRC.view.history.LoadQueryMasters = function() {
    $('#stackRefreshIcon_i2b2-CRC-view-history').addClass("refreshing");
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = this;
    scopedCallback.callback = function(cellResult) {
        $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");
        i2b2.CRC.view.history.treeview.treeview('clear');
        // THIS function is used to process the AJAX results of the getChild call
        //              results data object contains the following attributes:
        //                      refXML: xmlDomObject <--- for data processing
        //                      msgRequest: xml (string)
        //                      msgResponse: xml (string)
        //                      error: boolean
        //                      errorStatus: string [only with error=true]
        //                      errorMsg: string [only with error=true]

		// auto-extract SDX objects from returned XML
        cellResult.parse();

		// display the tree results
		var newNodes = [];
        for ( var i1=0; i1 < cellResult.model.length; i1++) {
            var sdxDataNode = cellResult.model[i1];
            var renderOptions = {
                title: sdxDataNode.sdxDisplayName ,
                icon: "sdx_CRC_QM.gif",
                showchildren: true
            };
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
            sdxDataNode.renderData.idDOM = "CRC_H_TV-" + i2b2.GUID();
            var temp = {
                title: sdxDataNode.renderData.moreDescriptMinor,
                text: sdxDataNode.renderData.title,
                icon: sdxDataNode.renderData.cssClassMain,
                key: sdxDataNode.sdxInfo.sdxType + "-" + sdxDataNode.sdxInfo.sdxKeyValue,
                iconImg: sdxDataNode.renderData.iconImg,
                iconImgExp: sdxDataNode.renderData.iconImgExp,
                i2b2: sdxDataNode
            };
            temp.state = sdxDataNode.renderData.tvNodeState;
            if(!i2b2.h.isUndefined(sdxDataNode.renderData.cssClassMinor)) {
                temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
            }
            newNodes.push(temp);
        }
        // push new nodes into the treeview
        i2b2.CRC.view.history.treeview.treeview('addNodes', [newNodes, true]);

        // render tree
        i2b2.CRC.view.history.treeview.treeview('redraw', []);
        // reset the loading icon in the stack buttons list
        $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");
    }
    i2b2.CRC.ajax.getQueryMasterList_fromUserId("CRC:History", {"crc_user_type": "CRC_QRY_getQueryMasterList_fromUserId", "crc_max_records":"20"}, scopedCallback);

};

// ================================================================================================== //
i2b2.CRC.view.history.PopulateQueryMasters = function(dm_ptr, dm_name, options) {
    // DEPRECATED ???
};



// =========== Context Menu Suff =========== 
// ================================================================================================== //
i2b2.CRC.view.history.doDisplay = function(node) {
	var op = node.i2b2;
	i2b2.CRC.ctrlr.QT.doQueryLoad(op, node);
}

// ================================================================================================== //
i2b2.CRC.view.history.doRename = function(node) {
    var op = node.i2b2;
	i2b2.CRC.ctrlr.history.queryRename(op, false, node);
}

// ================================================================================================== //
i2b2.CRC.view.history.doDelete = function(node) {
    var op = node.i2b2;
	i2b2.CRC.ctrlr.history.queryDelete(op, node);
}

// ================================================================================================== //
i2b2.CRC.view.history.doRefreshAll = function() {
    $('#stackRefreshIcon_i2b2-CRC-view-history').addClass("refreshing");
    i2b2.CRC.view.history.treeview.treeview('clear');
    i2b2.CRC.view.history.LoadQueryMasters();
}


// This is done once the entire cell has been loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((function(cell){
        if (cell.cellCode == "CRC") {
// =========================================================
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.history",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    i2b2.CRC.view.history.lm_view = container;

                    // add the cellWhite flare
                    var treeTarget = $('<div class="cellWhite" id="i2b2TreeviewCrcHistory"></div>').appendTo(container._contentElement);

                    // create an empty treeview
                    i2b2.CRC.view.history.treeview = $(treeTarget).treeview({
                        showBorder: false,
                        highlightSelected: false,
                        dynamicLoading: true,
                        levels: 1,
                        data: []
                    });

                    i2b2.CRC.view.history.treeview.on('nodeLoading', i2b2.CRC.view.history.loadChildren);
                    i2b2.CRC.view.history.treeview.on('onRedraw', i2b2.CRC.view.history.treeRedraw);
                    i2b2.CRC.view.history.treeview.on('onDrag', i2b2.sdx.Master.onDragStart);

                    // call the loading request for the history view
                    i2b2.CRC.view.history.LoadQueryMasters();


                    // -------------------- setup context menu --------------------
                    i2b2.WORK.view.main.ContextMenu = new BootstrapMenu('#i2b2TreeviewCrcHistory li.list-group-item', {
                        fetchElementData: function($rowElem) {
                            // fetch the data from the treeview
                            return i2b2.CRC.view.history.treeview.treeview('getNode', $rowElem.data('nodeid'));
                        },
                        actions: {
                            nodeDisplay: {
                                name: 'Display',
                                onClick: function(node) {
                                    console.dir(node);
                                    i2b2.CRC.view.history.doDisplay(node);
                                },
                                isShown: function(node) {
                                    if (node.depth === 1) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                },
                                isEnabled: false
                            },
                            nodeRename: {
                                name: 'Rename',
                                onClick: function(node) {
                                    console.dir(node);
                                    i2b2.CRC.view.history.doRename(node);
                                },
                                isShown: function(node) {
                                    if (node.depth === 1) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            },
                            nodeDelete: {
                                name: 'Delete',
                                onClick: function(node) {
                                    console.dir(node);
                                    i2b2.CRC.view.history.doDelete(node);
                                },
                                isShown: function(node) {
                                    if (node.depth === 1) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            },
                            newRefresh: {
                                name: 'Refresh All',
                                onClick: function (node) {
                                    console.dir(node);
                                    i2b2.CRC.view.history.doRefreshAll(node);
                                },
                                isShown: function (node) {
                                    if (node.depth === 1) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    });


                }).bind(this)
            );
        }
}));
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");

// =========================================================


console.timeEnd('execute time');
console.groupEnd();
