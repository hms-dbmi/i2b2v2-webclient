/**
 * @projectDescription	View controller for ONT's "Navigate Terms" tab.
 * @inherits 	i2b2.ONT.view
 * @namespace	i2b2.ONT.view.nav
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: ONT > view > Nav');
console.time('execute time');


// create and save the view object
i2b2.ONT.view.nav = new i2b2Base_cellViewController(i2b2.ONT, 'nav');
i2b2.ONT.view.nav.visible = false;
i2b2.ONT.view.nav.modifier = false;

// ================================================================================================== //
// deprecated functions
i2b2.ONT.view.nav.showView = function() { console.error("[i2b2.ONT.view.nav.showView] is deprecated!"); }
i2b2.ONT.view.nav.hideView = function() { console.error("[i2b2.ONT.view.nav.hideView] is deprecated!"); }
i2b2.ONT.view.nav.Resize = function(e) { console.error("[i2b2.ONT.view.nav.Resize] is deprecated!"); }
i2b2.ONT.view.nav.ResizeHeight = function() { console.error("[i2b2.ONT.nav.find.ResizeHeight] is deprecated!"); }


// ================================================================================================== //


// define the option functions
// ================================================================================================== //
i2b2.ONT.view.nav.showOptions = function(subScreen) {
    /* TODO: Refactor this
    if (!this.modalOptions) {
        var handleSubmit = function() {
            // submit value(s)
            var value = $('ONTNAVMaxQryDisp').value;
            if(!isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))){
                if(this.submit()) {
                    $('ONTNAVMaxQryDisp').style.border = "2px inset";
                    i2b2.ONT.view['nav'].params.max = parseInt($('ONTNAVMaxQryDisp').value,10);
                    i2b2.ONT.view['nav'].params.synonyms = $('ONTNAVshowSynonyms').checked;
                    i2b2.ONT.view['nav'].params.hiddens = $('ONTNAVshowHiddens').checked;
                    i2b2.ONT.view['nav'].params.modifiers = $('ONTNAVdisableModifiers').checked;
                    i2b2.ONT.view.nav.doRefreshAll();
                }
            } else {
                alert('Please enter a valid number for Maximum Children to Display.');
                $('ONTNAVMaxQryDisp').style.border = "2px inset red";
            }
        }
        var handleCancel = function() {
            this.cancel();
        }
        this.modalOptions = new YAHOO.widget.SimpleDialog("optionsOntNav",
        { width : "400px",
            fixedcenter : true,
            constraintoviewport : true,
            modal: true,
            zindex: 700,
            buttons : [ { text:"OK", handler:handleSubmit, isDefault:true },
                    { text:"Cancel", handler:handleCancel } ]
        } );
        $('optionsOntNav').show();
        this.modalOptions.validate = function() {
            if (parseInt($('ONTNAVMaxQryDisp').value,10) <= 0) {
                alert('You must display at least one child!');
                return false;
            }
            return true;
        };
        this.modalOptions.render(document.body);
    }
    this.modalOptions.show();
    // load settings from html
    i2b2.ONT.view.nav.params.max = parseInt($('ONTNAVMaxQryDisp').value,10);
    i2b2.ONT.view.nav.params.synonyms = $('ONTNAVshowSynonyms').checked;
    i2b2.ONT.view.nav.params.hiddens = $('ONTNAVshowHiddens').checked;
    i2b2.ONT.view.nav.params.modifiers = $('ONTNAVdisableModifiers').checked;
    */
}

// ================================================================================================== //
i2b2.ONT.view.nav.PopulateCategories = function() {		
    // insert the categories nodes into the Nav Treeview
    console.info("Populating Nav treeview with Categories");
    // clear the data first
    console.dir(i2b2.ONT.view.nav.treeview);
//    i2b2.ONT.view.nav.treeview.clear();

    // populate the Categories from the data model
//	i2b2.ONT.view['nav'].params.max = parseInt($('ONTNAVMaxQryDisp').value,10);
//	i2b2.ONT.view['nav'].params.synonyms = $('ONTNAVshowSynonyms').checked;
//	i2b2.ONT.view['nav'].params.hiddens = $('ONTNAVshowHiddens').checked;
//	i2b2.ONT.view['nav'].params.modifiers = $('ONTNAVdisableModifiers').checked;

    var newNodes = [];
    for (var i=0; i<i2b2.ONT.model.Categories.length; i++) {
        var catData = i2b2.ONT.model.Categories[i];
        // add categories to ONT navigate tree
        var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',catData);
        if (!sdxDataNode) {
            console.error("SDX could not encapsulate CONCPT data!");
            console.dir(catData);
            return false;
        }

        var renderOptions = {
            title: catData.name,
            icon: {
                root: "sdx_ONT_CONCPT_root.gif",
                rootExp: "sdx_ONT_CONCPT_root-exp.gif",
                branch: "sdx_ONT_CONCPT_branch.gif",
                branchExp: "sdx_ONT_CONCPT_branch-exp.gif",
                leaf: "sdx_ONT_CONCPT_leaf.gif"
            }
        };
        sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
        sdxDataNode.renderData.idDOM = "ONT_TV-" + i2b2.GUID();
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
    i2b2.ONT.view.nav.treeview.treeview('addNodes', [newNodes, true]);
    // render tree
    i2b2.ONT.view.nav.treeview.treeview('redraw', []);
    // reset the loading icon in the stack buttons list
    $('#stackRefreshIcon_i2b2-ONT-view-nav').removeClass("refreshing");
}
// ================================================================================================== //
i2b2.ONT.view.nav.loadChildren =  function(e, nodeData) {
    if (i2b2.h.isUndefined(nodeData.i2b2.sdxInfo.sdxKeyValue)) {
        console.error('i2b2.ONT.view.nav.loadChildren could not find tv_node.i2b2.sdxInfo');
        return;
    }

    $('#stackRefreshIcon_i2b2-ONT-view-nav').addClass("refreshing");
    i2b2.sdx.TypeControllers.CONCPT.LoadChildrenFromTreeview(nodeData, function(newNodes, parentNodes) {
        // push new nodes into the treeview
        i2b2.ONT.view.nav.treeview.treeview('addNodes', [
            newNodes,
            function(parent, child){ return parent.key == child.parentKey },
            false
        ]);

        // change the treeview icon to show it is no longer loading
        i2b2.ONT.view.nav.treeview.treeview('setNodeLoaded', [
            function(node, parentKeys){ return !(parentKeys.indexOf(node.key)) },
            parentNodes
        ]);
        // render tree
        i2b2.ONT.view.nav.treeview.treeview('redraw', []);
        $('#stackRefreshIcon_i2b2-ONT-view-nav').removeClass("refreshing");
    });
};

// This is done once the entire cell has been loaded
// ================================================================================================== //
console.info("SUBSCRIBED TO i2b2.events.afterCellInit");
i2b2.events.afterCellInit.add(
    (function(cell) {
        if (cell.cellCode=='ONT') {
// ===================================================================
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
            // TODO: Refactor this for the new GUI
// ===================================================================
        }
    })
);

//================================================================================================== //
i2b2.ONT.view.nav.setChecked = function(here) {
    //var oCheckedItem = here.parent.checkedItem;
    if (here.cfg.getProperty("checked")) {//(oCheckedItem != here) {
          here.cfg.setProperty("checked", false);
         // here.parent.checkedItem = here;
    } else {
           here.cfg.setProperty("checked", true);
    }
}

//================================================================================================== //
i2b2.ONT.view.nav.doRefreshAll = function() {
    // set the loading icon in the stack buttons list
    $('#stackRefreshIcon_i2b2-ONT-view-nav').addClass("refreshing");

    // clear out the treeview
    i2b2.ONT.view.nav.treeview.treeview('clear');

    // reload the root data
    i2b2.ONT.ctrlr.gen.loadCategories.call(i2b2.ONT.model.Categories);	// load categories into the data model
    i2b2.ONT.ctrlr.gen.loadSchemes.call(i2b2.ONT.model.Schemes);		// load categories into the data model
}

//================================================================================================== //
i2b2.ONT.view.nav.ContextMenuValidate = function(p_oEvent) {
    var clickId = null;
    var currentNode = this.contextEventTarget;
    while (!currentNode.id) {
        if (currentNode.parentNode) {
            currentNode = currentNode.parentNode;
        } else {
            // we have recursed up the tree to the window/document DOM... it's a bad click
            this.cancel();
            return;
        }
    }
    clickId = currentNode.id;
    // see if the ID maps back to a treenode with SDX data
    var tvNode = i2b2.ONT.view.nav.yuiTree.getNodeByProperty('nodeid', clickId);
    if (tvNode) {
        if (tvNode.data.i2b2_SDX) {
            if (tvNode.data.i2b2_SDX.sdxInfo.sdxType == "CONCPT") {
                i2b2.ONT.view.nav.contextRecord = tvNode.data.i2b2_SDX;
            } else {
                this.cancel();
                return;
            }
        }
    }
};


//================================================================================================== //
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode == "ONT") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.ONT.view.nav",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                i2b2.ONT.view.nav.lm_view = container;

                // add the cellWhite flare
                var treeTarget = $('<div class="cellWhite" id="i2b2TreeviewOntNav"></div>').appendTo(container._contentElement);

                // create an empty treeview
                i2b2.ONT.view.nav.treeview = $(treeTarget).treeview({
                    showBorder: false,
                    highlightSelected: false,
                    dynamicLoading: true,
                    levels: 1,
                    data: []
                });

                i2b2.ONT.view.nav.treeview.on('nodeLoading', i2b2.ONT.view.nav.loadChildren);
                i2b2.ONT.view.nav.treeview.on('onRedraw', i2b2.ONT.view.nav.treeRedraw);
                i2b2.ONT.view.nav.treeview.on('onDrag', i2b2.sdx.Master.onDragStart);

                i2b2.ONT.ctrlr.gen.loadCategories.call(i2b2.ONT.model.Categories);	// load categories into the data model
                i2b2.ONT.ctrlr.gen.loadSchemes.call(i2b2.ONT.model.Schemes);		// load categories into the data model
            }).bind(this)
        );
    }
}));


//================================================================================================== //
i2b2.ONT.view.nav.treeRedraw = function() {
    // attach drag drop attribute after the tree has been redrawn
    i2b2.ONT.view.nav.lm_view._contentElement.find('li:not(:has(span.tvRoot))').attr("draggable", true);
};


console.timeEnd('execute time');
console.groupEnd();