/**
 * @projectDescription	View controller for ONT's "Terms" tab.
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
i2b2.ONT.view.nav.template = {};

// ================================================================================================== //
i2b2.ONT.view.nav.PopulateCategories = function() {		
    // insert the categories nodes into the Nav Treeview
    console.info("Populating Nav treeview with Categories");
    // clear the data first
//    i2b2.ONT.view.nav.treeview.clear();

    let newNodes = [];
    for (let i=0; i<i2b2.ONT.model.Categories.length; i++) {
        let catData = i2b2.ONT.model.Categories[i];
        // add categories to ONT navigate tree
        let sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',catData);
        if (!sdxDataNode) {
            console.error("SDX could not encapsulate CONCPT data!");
            console.dir(catData);
            return false;
        }

        let renderOptions = {
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
        newNodes.push(temp);
    }

    // push new nodes into the treeview
    i2b2.ONT.view.nav.treeview.treeview('addNodes', [newNodes, true]);
    // render tree
    i2b2.ONT.view.nav.treeview.treeview('redraw', []);
};


// ================================================================================================== //
i2b2.ONT.view.nav.loadChildren =  function(e, nodeData) {
    if (nodeData.i2b2.sdxInfo.sdxKeyValue === undefined) {
        console.error('i2b2.ONT.view.nav.loadChildren could not find tv_node.i2b2.sdxInfo');
        return;
    }

    i2b2.sdx.TypeControllers.CONCPT.LoadChildrenFromTreeview(nodeData, function(newNodes, parentNodes) {
        // change the tiles to contain the counts
        newNodes.forEach((node) => {
            if (node.i2b2.origData.total_num !== undefined) node.text += ' - (' + node.i2b2.origData.total_num + ')';
        });

        // push new nodes into the treeview
        i2b2.ONT.view.nav.treeview.treeview('addNodes', [
            newNodes,
            function(parent, child){ return parent.key === child.parentKey },
            false
        ]);

        // change the treeview icon to show it is no longer loading
        i2b2.ONT.view.nav.treeview.treeview('setNodeLoaded', [
            function(node, parentKeys){ return !(parentKeys.indexOf(node.key)) },
            parentNodes
        ]);
        // render tree
        i2b2.ONT.view.nav.treeview.treeview('redraw', []);
    });
};


//================================================================================================== //
i2b2.ONT.view.nav.doRefreshAll = function() {
    // clear out the treeview
    i2b2.ONT.view.nav.treeview.treeview('clear');

    // reload the root data
    i2b2.ONT.ctrlr.gen.loadCategories.call(i2b2.ONT.model.Categories);	// load categories into the data model
    i2b2.ONT.ctrlr.gen.loadSchemes.call(i2b2.ONT.model.Schemes);		// load categories into the data model
};
//================================================================================================== //

// Below code is executed once the entire cell has been loaded
//================================================================================================== //
i2b2.events.afterCellInit.add((function(cell){
    if (cell.cellCode === "ONT") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit]');
        // ___ Register this view with the layout manager ____________________
        i2b2.layout.registerWindowHandler("i2b2.ONT.view.nav",
            (function (container, scope) {
                // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                i2b2.ONT.view.nav.lm_view = container;

                // add the cellWhite flare
                let treeEl = $('<div class="cellWhite" id="i2b2TreeviewOntNav"></div>').appendTo(container._contentElement);

                // create an empty treeview for navigation
                let treeRef = $(treeEl).treeview({
                    showBorder: false,
                    onhoverColor: "rgba(205, 208, 208, 0.56)",
                    highlightSelected: false,
                    dynamicLoading: true,
                    levels: 1,
                    data: []
                });
                i2b2.ONT.view.nav.treeview = treeRef;
                treeRef.on('nodeLoading', i2b2.ONT.view.nav.loadChildren);
                treeRef.on('onDrag', i2b2.sdx.Master.onDragStart);
                treeRef.on('onRedraw', () => {
                    // attach drag drop attribute after the tree has been redrawn
                    i2b2.ONT.view.nav.treeview.find('li:not(:has(span.tvRoot))').attr("draggable", true);
                });

                i2b2.ONT.ctrlr.gen.loadCategories.call(i2b2.ONT.model.Categories);	// load categories into the data model
                i2b2.ONT.ctrlr.gen.loadSchemes.call(i2b2.ONT.model.Schemes);		// load categories into the data model

                i2b2.ONT.view.search.initSearch(container._contentElement);

                // -------------------- setup context menu --------------------
                i2b2.ONT.view.nav.ContextMenu =  i2b2.ONT.view.nav.createContextMenu('i2b2TreeviewOntNav',i2b2.ONT.view.nav.treeview);
            }).bind(this)
        );
    }
}));
//================================================================================================== //
i2b2.ONT.view.nav.createContextMenu = function(treeviewElemId, treeview) {

    //    return new BootstrapMenu('#' + treeviewElemId + ' li.list-group-item', {
    return new BootstrapMenu('#' + treeviewElemId + ' li.list-group-item', {
        fetchElementData: function($rowElem) {
            // fetch the data from the treeview
            return treeview.treeview('getNode', $rowElem.data('nodeid'));
        },
        // TODO: Finish wiring implementation
        actions: {
            nodeAnnotate: {
                name: 'Show More Info',
                onClick: function(node) {
                    i2b2.ONT.view.info.load(node.i2b2, true);
                }
            }
        }
    });
};
// ================================================================================================== //

console.timeEnd('execute time');
console.groupEnd();