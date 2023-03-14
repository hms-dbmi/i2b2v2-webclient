/**
 * @projectDescription	View controller for ONT's "Terms" tab.
 * @inherits 	i2b2.ONT.view
 * @namespace	i2b2.ONT.view.nav
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */

// create and save the view object
i2b2.ONT.view.nav = new i2b2Base_cellViewController(i2b2.ONT, 'nav');
i2b2.ONT.view.nav.options = {};
i2b2.ONT.view.nav.template = {};

// ================================================================================================== //
i2b2.ONT.view.nav.PopulateCategories = function() {		
    // insert the categories nodes into the Nav Treeview

    let newNodes = [];
    for (let i=0; i<i2b2.ONT.model.Categories.length; i++) {
        let catData = i2b2.ONT.model.Categories[i];
        // add categories to ONT navigate tree
        let sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',catData);
        if (!sdxDataNode) {
            console.error("SDX could not encapsulate CONCPT data!");
            return false;
        }

        let renderOptions = {
            title: catData.name,
            icon: i2b2.ONT.model.icons.term
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
            let enablePatientCounts = i2b2.ONT.view.nav.params.patientCounts;
            if (enablePatientCounts !== false && node.i2b2.origData.total_num !== undefined) {
                node.text += ' - (' + node.i2b2.origData.total_num + ')';
            }
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
// ======================================================================================
i2b2.ONT.view.nav.displayAlertDialog = function(inputData){
    let ontMsgDialogModal = $("#ontMsgDialog");
    if (ontMsgDialogModal.length === 0) {
        $("body").append("<div id='ontMsgDialog'/>");
        ontMsgDialogModal = $("#ontMsgDialog");
    }
    ontMsgDialogModal.empty();

    let data = {
        "title": inputData.title,
        "alertMsg": inputData.alertMsg,
    };
    $(i2b2.ONT.view.nav.templates.alertDialog(data)).appendTo(ontMsgDialogModal);
    $("#ONTAlertDialog").modal('show');
}

// Below code is executed once the entire cell has been loaded
//================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
    if (cell.cellCode === "ONT") {
        console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

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

                let optionsDialogModal = $("<div id='ontOptionsModal'/>");
                $("body").append(optionsDialogModal);
                optionsDialogModal.load('js-i2b2/cells/ONT/assets/modalOptionsONT.html', function () {
                    $("body #ontOptionsModal button.options-save").click(function () {
                        i2b2.ONT.view.nav.params.modifiers = $('#ONTNAVdisableModifiers').is(":checked");
                        i2b2.ONT.view.nav.params.max = parseInt($('#ONTNAVMaxQryDisp').val(), 10);
                        i2b2.ONT.view.nav.params.synonyms = $('#ONTNAVshowSynonyms').is(":checked");
                        i2b2.ONT.view.nav.params.hiddens = $('#ONTNAVshowHiddens').is(":checked");
                        i2b2.ONT.view.nav.params.patientCounts = $('#ONTNAVshowPatientCounts').is(":checked");
                        i2b2.ONT.view.nav.params.showConceptCode = $('#ONTNAVshowCodeTooltips').is(":checked");
                        i2b2.ONT.view.nav.params.showShortTooltips = $('#ONTNAVshowShortTooltips').is(":checked");
                        i2b2.ONT.view.nav.doRefreshAll();
                        $("#ontOptionsModal div").eq(0).modal("hide");
                    });
                });

                container.on( 'tab', function( tab ){
                    if(tab.element.text() === 'Terms') {
                        //add unique id to the term tab
                        let elemId = "ontologyTermTab";
                        $(tab.element).attr("id", elemId);
                        i2b2.ONT.view.nav.options.ContextMenu = new BootstrapMenu("#" + elemId, {
                            actions: {
                                nodeAnnotate: {
                                    name: 'Show Options',
                                    onClick: function (node) {
                                        $("#ontOptionsFields").empty();
                                        $((Handlebars.compile("{{> OntologyOptions}}"))(i2b2.ONT.view.nav.params)).appendTo("#ontOptionsFields");
                                        $("#ontOptionsModal div").eq(0).modal("show");
                                    }
                                }
                            }
                        });
                    }
                });

                //HTML template for ontology options
                $.ajax("js-i2b2/cells/ONT/templates/OntologyOptions.html", {
                    success: (template, status, req) => {
                        Handlebars.registerPartial("OntologyOptions", req.responseText);
                    },
                    error: (error) => { console.error("Could not retrieve template: OntologyOptions.html"); }
                });

                cell.view.nav.templates = {};
                $.ajax("js-i2b2/cells/ONT/templates/AlertDialog.html", {
                    success: (template) => {
                        cell.view.nav.templates.alertDialog = Handlebars.compile(template);
                    },
                    error: (error) => { console.error("Could not retrieve template: AlertDialog.html"); }
                });

                //set default values
                i2b2.ONT.view.nav.params.modifiers = false;
                i2b2.ONT.view.nav.params.synonyms = false;
                i2b2.ONT.view.nav.params.hiddens = false;
                i2b2.ONT.view.nav.params.max = 200;
            }).bind(this)
        );
    }
});
//================================================================================================== //
i2b2.ONT.view.nav.createContextMenu = function(treeviewElemId, treeview, includeModifier) {

    let actions = {
        nodeAnnotate: {
            name: 'Show More Info',
                onClick: function(node) {
                i2b2.ONT.view.info.load(node.i2b2, true);
            }
        }
    };
    if(includeModifier){
       actions.nodeModifier =  {
           name: 'Show Modifiers',
               onClick: function(node) {
                   i2b2.sdx.TypeControllers.CONCPT.LoadModifiers(node, function(newNodes) {
                       if (newNodes.length === 0) {
                           i2b2.ONT.view.nav.displayAlertDialog({
                                    title: "Show Modifiers",
                                    alertMsg: "No modifiers found for " + node.text + "."
                                }
                           );
                       }
                       else{
                           //get existing children
                           let getAllChildren = function (childNode, allChildren) {
                               childNode.nodes.forEach((n) => {
                                   let parentNode = i2b2.ONT.view.search.treeview.treeview('getParent', [n]);
                                   n.parentKey = parentNode.key;
                                   allChildren.push(n);
                                   if (n.nodes !== undefined && n.nodes.length >= 0) {
                                       return getAllChildren(n, allChildren);
                                   }
                               });
                           }

                           let temp_childrenAll = [];
                           getAllChildren(node, temp_childrenAll);
                           let temp_childrenId = node.nodes.map(function (node) { return node.nodeId; });
                           i2b2.ONT.view.search.treeview.treeview('deleteNodes', [temp_childrenId]);

                           //append existing children so that the modifiers appear first in the tree
                           newNodes = newNodes.concat(temp_childrenAll);

                           i2b2.ONT.view.search.treeview.treeview('addNodes', [
                               newNodes,
                               function (parent, child) { return parent.key === child.parentKey},
                               false
                           ]);

                           // render tree
                           i2b2.ONT.view.search.treeview.treeview('redraw', []);
                       }
                   }, true);
               }
       }
    }
    return new BootstrapMenu('#' + treeviewElemId + ' li.list-group-item', {
        fetchElementData: function($rowElem) {
            // fetch the data from the treeview
            return treeview.treeview('getNode', $rowElem.data('nodeid'));
        },
        actions: actions
    });
};
