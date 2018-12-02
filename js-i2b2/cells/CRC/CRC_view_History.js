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
// define the option functions
// ================================================================================================== //
i2b2.CRC.view.history.showOptions = function(subScreen){
/*
	if (!this.modalOptions) {
		var handleSubmit = function(){
			// submit value(s)
			var value = $('HISTMaxQryDisp').value;
			if(!isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))){
				if(parseInt(value, 10) > 0){
					if (this.submit()) {
						if ($('HISTsortOrderASC').checked) {
							tmpValue = 'ASC';
						}
						else {
							tmpValue = 'DESC';
						}
						i2b2.CRC.view['history'].params.sortOrder = tmpValue;
						if ($('HISTsortByNAME').checked) {
							tmpValue = 'NAME';
						}
						else {
							tmpValue = 'DATE';
						}
						i2b2.CRC.view['history'].params.sortBy = tmpValue;
						tmpValue = parseInt($('HISTMaxQryDisp').value, 10);
						i2b2.CRC.view['history'].params.maxQueriesDisp = tmpValue;
						// requery the history list
						i2b2.CRC.ctrlr.history.Refresh();
					}
				} else {
					alert('Please enter number greater than 0 for Maximum Children to Display.');
					$('HISTMaxQryDisp').style.border = "2px inset red";
				}
			} else {
				alert('Please enter a valid number for Maximum Queries to Display.');
				$('HISTMaxQryDisp').style.border = "2px inset red";
			}
			
		}
		var handleCancel = function(){
			this.cancel();
		}
		this.modalOptions = new YAHOO.widget.SimpleDialog("optionsHistory", {
			width: "400px",
			fixedcenter: true,
			constraintoviewport: true,
			modal: true,
			zindex: 700,
			buttons: [{
				text: "OK",
				handler: handleSubmit,
				isDefault: true
			}, {
				text: "Cancel",
				handler: handleCancel
			}]
		});
		$('optionsHistory').show();
		this.modalOptions.validate = function(){
			// now process the form data
			var tmpValue = parseInt($('HISTMaxQryDisp').value, 10);
			var value = $('HISTMaxQryDisp').value;
			if(!isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))){
				$('HISTMaxQryDisp').style.border = "2px inset";
				return true;
			} else {
				alert("The max number of Queries must be a whole number larger then zero.");
				$('HISTMaxQryDisp').style.border = "2px inset red";
				return false;
			}
		};
		this.modalOptions.render(document.body);
	} 
	this.modalOptions.show();
	// load settings
	if (this.params.sortOrder=="ASC") {
		$('HISTsortOrderASC').checked = true;
	} else {
		$('HISTsortOrderDESC').checked = true;
	}
	if (this.params.sortBy=="NAME") {
		$('HISTsortByNAME').checked = true;
	} else {
		$('HISTsortByDATE').checked = true;
	}
	$('HISTMaxQryDisp').value = this.params.maxQueriesDisp;
*/
}

// ================================================================================================== //
// deprecated functions
i2b2.CRC.view.history.ToggleNode = function(divTarg, divTreeID) {};
i2b2.CRC.view.history.selectTab = function(tabCode) {};
i2b2.CRC.view.history.Resize = function(e) {};
i2b2.CRC.view.history.splitterDragged = function()  {};
i2b2.CRC.view.history.ResizeHeight = function() {};
i2b2.CRC.view.history.ZoomView = function() {}





i2b2.CRC.view.history.loadChildren = function(ev, node) {
    // called via i2b2.CRC.view.history.treeview.on('nodeLoading', i2b2.CRC.view.history.loadChildren)
	debugger;
	console.dir(ev);
    console.dir(node);

    var funct_AddChildNodes = (function(cellResult) {
        console.dir(cellResult);
        console.dir(node);

        // TODO: add the renderData to the nodes

        // TODO: add the children to the parent node


        // display the tree results
        var newNodes = [];
        for ( var i1=0; i1 < cellResult.results.length; i1++) {
            var sdxDataNode = cellResult.results[i1];
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, {showchildren: true});
            sdxDataNode.renderData.idDOM = "CRC_H_TV-" + i2b2.GUID();
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
            newNodes.push(temp);
        }
        // push new nodes into the treeview
        i2b2.CRC.view.history.treeview.treeview('addNodes', [newNodes, true]);

        // render tree
        i2b2.CRC.view.history.treeview.treeview('redraw', []);
        // reset the loading icon in the stack buttons list
        $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");


    });

    switch (node.i2b2.sdxInfo.sdxType) {
        case "QM":
            $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");
            i2b2.sdx.TypeControllers.QM.getChildRecords(node.i2b2, funct_AddChildNodes);
            break;

    }
};

i2b2.CRC.view.history.treeRedraw = function(ev, b) {
    // called via i2b2.CRC.view.history.treeview.on('onRedraw', i2b2.CRC.view.history.treeRedraw);
    $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");
	debugger;
    console.dir(ev);
    console.dir(b);
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
    	debugger;
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
                key: sdxDataNode.sdxInfo.sdxKeyValue,
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
	var thisview = i2b2.CRC.view.history;
	// clear the data first
	var tvTree = i2b2.CRC.view.history.yuiTree;
	var tvRoot = tvTree.getRoot();
	tvTree.removeChildren(tvRoot);
	tvTree.locked = false;
	
	// sort by the options
	if (Object.isUndefined(options)) { var options = {}; }
	if (!options.sortBy) { options.sortBy = 'DATE'; }
	if (!options.sortOrder) { options.sortBy = 'DESC'; }
	if (options.sortBy=='NAME') {
		var compareAttrib = 'name';
	} else {
		var compareAttrib = 'created';
	}
	if (options.sortOrder=='ASC') {
		var reverseSort = false;
	} else {
		var reverseSort = true;
	}

	// NEW SORT METHOD USING prototype Enumerators
	var QM_sortVal = function(rec) {
		var hash_key = rec[0]; 
		var sdxExtObj = rec[1];
		var cl_compareAttrib = compareAttrib;  // <---- closure var
		var t = sdxExtObj.origData[cl_compareAttrib];
		if (cl_compareAttrib=="created") {
			// proper date handling (w/improper handling for latest changes to output format)
			var sd = t.toUpperCase();
			if (sd.indexOf('Z') != -1 || sd.indexOf('T') != -1) {
				t = t.toLowerCase();
			} else {
				t = Date.parse(t);
			}
		} else {
			t = String(t.toLowerCase() );
		}
		return t;
	};
	var sortFinal = i2b2.CRC.model.QueryMasters.sortBy(QM_sortVal);
	// reverse if needed
	if (reverseSort) { sortFinal.reverse(true); }
	
	// populate the Query Masters into the treeview
	for (var i=0; i<sortFinal.length; i++) {
		// add categories to ONT navigate tree
		var sdxDataNode = sortFinal[i][1];
		
		if (sdxDataNode.origData.master_type_cd == "TEMPORAL")
		{
			icon = "sdx_CRC_QMT.gif";
			iconExp = "sdx_CRC_QMT_exp.gif";
		}
		else
		{
			
			icon = "sdx_CRC_QM.gif";
			iconExp = "sdx_CRC_QM_exp.gif";		
		}
		var renderOptions = {
			title: sdxDataNode.origData.name,
			dragdrop: "i2b2.sdx.TypeControllers.QM.AttachDrag2Data",
			dblclick: "i2b2.CRC.view.history.ToggleNode(this,'"+tvTree.id+"')",
			icon: icon,
			iconExp: iconExp
		};
		var sdxRenderData = i2b2.sdx.Master.RenderHTML(tvTree.id, sdxDataNode, renderOptions);
		i2b2.sdx.Master.AppendTreeNode(tvTree, tvRoot, sdxRenderData);
	}
	tvTree.draw();
    $('#stackRefreshIcon_i2b2-CRC-view-history').removeClass("refreshing");
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
    i2b2.CRC.ctrlr.history.Refresh();
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

/*
    var thisview = i2b2.CRC.view.history;
			thisview.Resize();
			// initialize treeview
			if (!thisview.yuiTree) {
				thisview.yuiTree = new YAHOO.widget.TreeView("crcHistoryData");
				thisview.yuiTree.setDynamicLoad(i2b2.sdx.Master.LoadChildrenFromTreeview,1);
				// register the treeview with the SDX subsystem to be a container for QM, QI, PRS, PRC objects
				i2b2.sdx.Master.AttachType("crcHistoryData","QM");
				i2b2.sdx.Master.AttachType("crcHistoryData","QI");
				i2b2.sdx.Master.AttachType("crcHistoryData","ENS");
				i2b2.sdx.Master.AttachType("crcHistoryData","PRC");
				i2b2.sdx.Master.AttachType("crcHistoryData","PRS");
				i2b2.sdx.Master.AttachType("crcHistoryData","PR");

			}
                        // initialize treeview
                        if (!thisview.yuiFindTree) {
                                thisview.yuiFindTree = new YAHOO.widget.TreeView("crcSearchNamesResults");
                                thisview.yuiFindTree.setDynamicLoad(i2b2.sdx.Master.LoadChildrenFromTreeview,1);
                                // register the treeview with the SDX subsystem to be a container for QM, QI, PRS, PRC objects
                                i2b2.sdx.Master.AttachType("crcSearchNamesResults","QM");
                                i2b2.sdx.Master.AttachType("crcSearchNamesResults","QI");
                                i2b2.sdx.Master.AttachType("crcSearchNamesResults","ENS");
                                i2b2.sdx.Master.AttachType("crcSearchNamesResults","PRC");
                                i2b2.sdx.Master.AttachType("crcSearchNamesResults","PRS");
                                i2b2.sdx.Master.AttachType("crcSearchNamesResults","PR");

			}			
			// we need to make sure everything is loaded
			setTimeout("i2b2.CRC.ctrlr.history.Refresh();",300);			
			
// -------------------------------------------------------
			i2b2.CRC.ctrlr.history.events.onDataUpdate.subscribe(
				(function(en,co) {
					console.group("[EVENT CAPTURED i2b2.CRC.ctrlr.history.events.onDataUpdate]");
					console.dir(co[0]);
					var dm_loc = co[0].DataLocation;
					var dm_ptr = co[0].DataRef;
					if (dm_loc=='i2b2.CRC.model.QueryMasters') {
						console.debug("Processing QueryMasters update");
						var options = {};
						options.sortBy = i2b2.CRC.view['history'].params.sortBy;
						options.sortOrder = i2b2.CRC.view['history'].params.sortOrder;
						options.max = i2b2.CRC.view['history'].params.maxQueriesDisp;
						i2b2.CRC.view.history.PopulateQueryMasters(dm_ptr, dm_loc, options);
					}
					console.groupEnd();
				})
			);
			
			
			
// -------------------------------------------------------
		// override default handler (we need this so that we can properly capture the XML request/response messagees
		 i2b2.sdx.Master.setHandlerCustom('crcHistoryData', 'QM', 'LoadChildrenFromTreeview', (function(node, onCompleteCallback) {
			var scopedCallback = new i2b2_scopedCallback();
			scopedCallback.scope = node.data.i2b2_SDX;
			scopedCallback.callback = function(cellResult) {
				var cl_node = node;
				var cl_onCompleteCB = onCompleteCallback;
				// THIS function is used to process the AJAX results of the getChild call
				//		results data object contains the following attributes:
				//			refXML: xmlDomObject <--- for data processing
				//			msgRequest: xml (string)
				//			msgResponse: xml (string)
				//			error: boolean
				//			errorStatus: string [only with error=true]
				//			errorMsg: string [only with error=true]
				for(var i1=0; i1<1*cellResult.results.length; i1++) {
					var o = cellResult.results[i1];
					var renderOptions = {
						title: o.origData.title,
						dragdrop: "i2b2.sdx.TypeControllers.QI.AttachDrag2Data",
						dblclick: "i2b2.CRC.view.history.ToggleNode(this,'"+cl_node.tree.id+"')",
						icon: "sdx_CRC_QI.gif",
						iconExp: "sdx_CRC_QI_exp.gif"
					};
					var sdxRenderData = i2b2.sdx.Master.RenderHTML(cl_node.tree.id, o, renderOptions);
					i2b2.sdx.Master.AppendTreeNode(cl_node.tree, cl_node, sdxRenderData);
				}
				// handle the YUI treeview	
				if (getObjectClass(cl_onCompleteCB)=='i2b2_scopedCallback') {
					cl_onCompleteCB.callback.call(cl_onCompleteCB.scope, cellResult);
				} else {
					cl_onCompleteCB(cellResult);
				}
			}
			var sdxParentNode = node.data.i2b2_SDX;
			i2b2.sdx.Master.getChildRecords(sdxParentNode, scopedCallback);
		}));

                 i2b2.sdx.Master.setHandlerCustom('crcSearchNamesResults', 'QM', 'LoadChildrenFromTreeview', (function(node, onCompleteCallback) {
                        var scopedCallback = new i2b2_scopedCallback();
                        scopedCallback.scope = node.data.i2b2_SDX;
                        scopedCallback.callback = function(cellResult) {
                                var cl_node = node;
                                var cl_onCompleteCB = onCompleteCallback;
                                // THIS function is used to process the AJAX results of the getChild call
                                //              results data object contains the following attributes:
                                //                      refXML: xmlDomObject <--- for data processing
                                //                      msgRequest: xml (string)
                                //                      msgResponse: xml (string)
                                //                      error: boolean
                                //                      errorStatus: string [only with error=true]
                                //                      errorMsg: string [only with error=true]
                                for(var i1=0; i1<1*cellResult.results.length; i1++) {
                                        var o = cellResult.results[i1];
                                        var renderOptions = {
                                                title: o.origData.title,
                                                dragdrop: "i2b2.sdx.TypeControllers.QI.AttachDrag2Data",
                                                dblclick: "i2b2.CRC.view.history.ToggleNode(this,'"+cl_node.tree.id+"')",
                                                icon: "sdx_CRC_QI.gif",
                                                iconExp: "sdx_CRC_QI_exp.gif"
                                        };
                                        var sdxRenderData = i2b2.sdx.Master.RenderHTML(cl_node.tree.id, o, renderOptions);
                                        i2b2.sdx.Master.AppendTreeNode(cl_node.tree, cl_node, sdxRenderData);
                                }
                                // handle the YUI treeview      
                                if (getObjectClass(cl_onCompleteCB)=='i2b2_scopedCallback') {
                                        cl_onCompleteCB.callback.call(cl_onCompleteCB.scope, cellResult);
                                } else {
                                        cl_onCompleteCB(cellResult);
                                }
                        }
                        var sdxParentNode = node.data.i2b2_SDX;
                        i2b2.sdx.Master.getChildRecords(sdxParentNode, scopedCallback);
                }));
// -------------------------------------------------------
		
			i2b2.CRC.view.history.ContextMenu = new YAHOO.widget.ContextMenu( 
					"divContextMenu-History",  
					{ lazyload: true,
					trigger: $('crcNavDisp'), 
					itemdata: [
						{ text: "Display",	onclick: { fn: i2b2.CRC.view.history.doDisplay } },
						{ text: "Rename", 	onclick: { fn: i2b2.CRC.view.history.doRename } },
						{ text: "Delete", 		onclick: { fn: i2b2.CRC.view.history.doDelete } },
						{ text: "Refresh All",	onclick: { fn: i2b2.CRC.view.history.doRefreshAll } }
					] }  
			); 
			i2b2.CRC.view.history.ContextMenu.subscribe("triggerContextMenu",i2b2.CRC.view.history.ContextMenuValidate); 
*/
// =========================================================			


console.timeEnd('execute time');
console.groupEnd();
