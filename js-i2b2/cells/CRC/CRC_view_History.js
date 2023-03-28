/**
 * @projectDescription	View controller for the history viewport. (CRC's "previous queries" window)
 * @inherits 	i2b2.CRC.view
 * @namespace	i2b2.CRC.view.history
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */


// create and save the screen objects
i2b2.CRC.view.history = new i2b2Base_cellViewController(i2b2.CRC, 'history');
i2b2.CRC.view.history.visible = false;
i2b2.CRC.view.history.template = {};

// ================================================================================================== //
i2b2.CRC.view.history.loadChildren = function(ev, nodeData) {
    // called via i2b2.CRC.view.history.treeview.on('nodeLoading', i2b2.CRC.view.history.loadChildren)
    // and is used to load all the children for a single passed node

    if (nodeData.i2b2.sdxInfo.sdxKeyValue === undefined) {
        console.error('i2b2.CRC.view.history.loadChildren could not find tv_node.i2b2.sdxInfo');
        return;
    }

    i2b2.sdx.Master.getChildRecords(nodeData.i2b2, (function(cellResult) {

        if (cellResult.error !== false) {return false;}

        let parentNode = this.key;
        // add the renderData to the nodes
        let newNodes = [];
        for ( let i1=0; i1 < cellResult.results.length; i1++) {
            let sdxDataNode = cellResult.results[i1];
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, {showchildren: true});
            sdxDataNode.renderData.idDOM = "CRC_H_TV-" + i2b2.GUID();
            let temp = {
                title: sdxDataNode.renderData.moreDescriptMinor,
                text: sdxDataNode.renderData.title,
                icon: sdxDataNode.renderData.cssClassMain,
                key: sdxDataNode.sdxInfo.sdxType + "-" + sdxDataNode.sdxInfo.sdxKeyValue,
                iconImg: sdxDataNode.renderData.iconImg,
                iconImgExp: sdxDataNode.renderData.iconImgExp,
                i2b2: sdxDataNode
            };
            temp.state = sdxDataNode.renderData.tvNodeState;
            if(sdxDataNode.renderData.cssClassMinor !== undefined) {
                temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
            }
            temp.parentKey = parentNode;
            newNodes.push(temp);
        }

        // add the children to the parent node
        $(ev.currentTarget).treeview('addNodes', [
            newNodes,
            function(parent, child){ return parent.key === child.parentKey },
            false
        ]);

        // change the treeview icon to show it is no longer loading
        $(ev.currentTarget).treeview('setNodeLoaded', [
            function(parent, parentKey){ return parent.key === parentKey },
            parentNode
        ]);

        // render tree
        $(ev.currentTarget).treeview('redraw', []);
    }).bind(nodeData));
};

//================================================================================================== //
i2b2.CRC.view.history.treeRedraw = function(ev, b) {
    // attach drag drop attribute
    i2b2.CRC.view.history.lm_view._contentElement.find('li:not(:has(span.tvRoot))').attr("draggable", true);
};

//================================================================================================== //
i2b2.CRC.view.history.loadMore = function() {
    $('.history-more-bar i.bi').removeClass("d-none");
    let newcount = i2b2.CRC.view.history.treeview.data('treeview').getNodes(()=>true).length;
    newcount = newcount + i2b2.CRC.view.history.params.maxQueriesDisp;
    i2b2.CRC.view.history.LoadQueryMasters(newcount);
}

// ================================================================================================== //

i2b2.CRC.view.history.sortResultsByName = function(resultNode1, resultNode2){
    // proper date handling (w/improper handling for latest changes to output format)
    let nameStr1 = resultNode1.origData["name"];
    let nameStr2 = resultNode2.origData["name"];

    let result;
    if(nameStr1 < nameStr2){
        result = -1;
    } else if(nameStr1 > nameStr2){
        result = 1;
    } else {
        result = 0;
    }

    return result;
}
// ================================================================================================== //

i2b2.CRC.view.history.sortResultsByDate = function(resultNode1, resultNode2){
    // proper date handling (w/improper handling for latest changes to output format)
    let dateStr1 = resultNode1.origData["created"];
    let dateStr2 = resultNode2.origData["created"];

    let dateTime1 = Date.parse(dateStr1);
    let dateTime2 = Date.parse(dateStr2);

    let result;
    if(dateTime1 < dateTime2){
        result = -1;
    } else if(dateTime1 > dateTime2){
        result = 1;
    } else {
        result = 0;
    }

    return result;
}
// ================================================================================================== //
i2b2.CRC.view.history.clickSearchName = function() {
    // Hide Navigate treeview and search results message and display search status message
    $("#i2b2TreeviewQueryHistoryFinder").hide();
    $("#i2b2TreeviewQueryHistory").hide();
    $("#i2b2QueryHistoryFinderMessage").hide();
    $("#i2b2QueryHistoryFinderStatus").text("Searching...").show();

    // clear treeview
    i2b2.CRC.view.history.treeviewFinder.treeview('clear');

    // create a scoped callback message
    var scopeCB = new i2b2_scopedCallback();
    scopeCB.scope = i2b2.CRC.model;
    scopeCB.callback = function(cellResult) {
        // auto-extract SDX objects from returned XML
        cellResult.parse();

        // display the tree results
        let newNodes = {};
        if(i2b2.CRC.view.history.params.sortBy === 'NAME') {
            cellResult.model.sort(i2b2.CRC.view.history.sortResultsByName);
        }else{
            cellResult.model.sort(i2b2.CRC.view.history.sortResultsByDate);
        }

        let isAscending = i2b2.CRC.view['history'].params.sortOrder.indexOf("DESC") === -1;
        if(!isAscending){
            cellResult.model.reverse();
        }
        for ( let i1=0; i1 < cellResult.model.length; i1++) {
            let sdxDataNode = cellResult.model[i1];
            let renderOptions = {
                title: sdxDataNode.sdxDisplayName ,
                icon: "sdx_CRC_QM.gif",
                showchildren: true
            };
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
            sdxDataNode.renderData.idDOM = "CRC_H_TV-" + i2b2.GUID();
            let temp = {
                title: sdxDataNode.renderData.moreDescriptMinor,
                text: sdxDataNode.renderData.title,
                icon: sdxDataNode.renderData.cssClassMain,
                key: sdxDataNode.sdxInfo.sdxType + "-" + sdxDataNode.sdxInfo.sdxKeyValue,
                iconImg: sdxDataNode.renderData.iconImg,
                iconImgExp: sdxDataNode.renderData.iconImgExp,
                i2b2: sdxDataNode
            };

            temp.state = sdxDataNode.renderData.tvNodeState;
            if(sdxDataNode.renderData.cssClassMinor !== undefined) {
                temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
            }
            if(!newNodes[temp.key]) {
                newNodes[temp.key] = temp;
            }
        }
        // push new nodes into the treeview
        i2b2.CRC.view.history.treeviewFinder.treeview('addNodes', [Object.values(newNodes), true]);

        // render tree
        i2b2.CRC.view.history.treeviewFinder.treeview('redraw', []);
        $("#i2b2QueryHistoryFinderStatus").hide();

        // Display search results treeview
        let historyFinderTreeview = $("#i2b2TreeviewQueryHistoryFinder").show();

        if(cellResult.model.length === 0){
            $("#i2b2QueryHistoryFinderMessage").text("No records found.").show();
            historyFinderTreeview.hide();
        }
    };

    let crc_find_strategy = "contains"
    let crc_find_category = $("#querySearchFilter").data("selectedFilterValue");
    if(crc_find_category === "pdo") crc_find_strategy = "exact"

    // fire the AJAX call
    let options = {
        result_wait_time: 180,
        crc_max_records: i2b2.CRC.view['history'].params.maxQueriesDisp,
        crc_sort_by: i2b2.CRC.view['history'].params.sortBy,
        crc_user_type: 	(i2b2.PM.model.userRoles.indexOf("MANAGER") === -1 ? "CRC_QRY_getQueryMasterList_fromUserId" : "CRC_QRY_getQueryMasterList_fromGroupId"),
        crc_sort_order: (i2b2.CRC.view['history'].params.sortOrder.indexOf("DESC") === -1?"true": "false"),
        crc_find_category: crc_find_category,
        crc_find_strategy: crc_find_strategy,
        crc_find_string: $("#querySearchTermText").val()
    };
    i2b2.CRC.ajax.getNameInfo("CRC:History", options, scopeCB);
};

//================================================================================================== //
i2b2.CRC.view.history.LoadQueryMasters = function(maxRecords) {
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = this;
    scopedCallback.callback = function(cellResult) {
        i2b2.CRC.view.history.treeview.treeview('clear');

        // auto-extract SDX objects from returned XML
        cellResult.parse();

        //sort the results
        if(i2b2.CRC.view.history.params.sortBy === 'NAME') {
            cellResult.model.sort(i2b2.CRC.view.history.sortResultsByName);
        }else{
            cellResult.model.sort(i2b2.CRC.view.history.sortResultsByDate);
        }

        let isAscending = i2b2.CRC.view['history'].params.sortOrder.indexOf("DESC") === -1;
        if(!isAscending){
            cellResult.model.reverse();
        }

        // display the tree results
        let newNodes = [];
        for ( let i1=0; i1 < cellResult.model.length; i1++) {
            let sdxDataNode = cellResult.model[i1];
            let renderOptions = {
                title: sdxDataNode.sdxDisplayName ,
                icon: "sdx_CRC_QM.gif",
                showchildren: true
            };

            //Change the icons for temporal query
            if(sdxDataNode.sdxInfo.sdxDisplayName.startsWith("(t)")){
                renderOptions.icon = 'sdx_CRC_QMT.gif';
                renderOptions.cssClassMain = "sdxStyleCRC-QMT";
            }
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
            sdxDataNode.renderData.idDOM = "CRC_H_TV-" + i2b2.GUID();
            let temp = {
                title: sdxDataNode.renderData.moreDescriptMinor,
                text: sdxDataNode.renderData.title,
                icon: sdxDataNode.renderData.cssClassMain,
                key: sdxDataNode.sdxInfo.sdxType + "-" + sdxDataNode.sdxInfo.sdxKeyValue,
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

        // hide "Load More" link if we have all the records
        if (newNodes.length < max) {
            $('.history-more-bar').addClass("d-none");
        } else {
            $('.history-more-bar').removeClass("d-none");
        }

        // push new nodes into the treeview
        i2b2.CRC.view.history.treeview.treeview('addNodes', [newNodes, true]);

        // render tree
        i2b2.CRC.view.history.treeview.treeview('redraw', []);
        $('.history-more-bar i.bi').addClass("d-none");
    };

    // fire the AJAX call
    let request_type = "CRC_QRY_getQueryMasterList_fromUserId";
    var user_type = i2b2.PM.model.login_username;
    if(i2b2.PM.model.userRoles.indexOf("MANAGER") > -1){
        if($('#HISTUser').val() === '@'){
            request_type = "CRC_QRY_getQueryMasterList_fromGroupId";
        } else {
            user_type = $('#HISTUser').val();
        }
    }

    let max = maxRecords ? maxRecords : i2b2.CRC.view.history.params.maxQueriesDisp;
    let options = {
        crc_max_records: max,
        crc_user_type: request_type,
        crc_user_by: user_type
    };
    i2b2.CRC.ajax.getQueryMasterList_fromUserId("CRC:History", options,  scopedCallback);
};


// =========== Context Menu Suff =========== 
// ================================================================================================== //
i2b2.CRC.view.history.doDisplay = function(node) {
    let sdxData = node.i2b2;
    let qm_id = sdxData.sdxInfo.sdxKeyValue;
    i2b2.CRC.ctrlr.QT.doQueryLoad(qm_id);
};

// ================================================================================================== //
i2b2.CRC.view.history.doRename = function(node) {
    let op = node.i2b2;
    i2b2.CRC.ctrlr.history.queryRename(op, false, node);
};

// ================================================================================================== //
i2b2.CRC.view.history.doDelete = function(node) {
    let op = node.i2b2;
    i2b2.CRC.ctrlr.history.queryDelete(op, node);
};

// ================================================================================================== //
i2b2.CRC.view.history.doRefreshAll = function() {
    i2b2.CRC.view.history.treeview.treeview('clear');
    i2b2.CRC.view.history.LoadQueryMasters();
};


// This is done once the entire cell has been loaded
// ================================================================================================== //
i2b2.events.afterCellInit.add((cell) => {
        if (cell.cellCode === "CRC") {
            console.debug('[EVENT CAPTURED i2b2.events.afterCellInit] --> ' + cell.cellCode);

            // ___ Register this view with the layout manager ____________________
            i2b2.layout.registerWindowHandler("i2b2.CRC.view.history",
                (function (container, scope) {
                    // THIS IS THE MASTER FUNCTION THAT IS USED TO INITIALIZE THE WORK CELL'S MAIN VIEW
                    i2b2.CRC.view.history.lm_view = container;

                    // Load the finder templatee
                    $.ajax("js-i2b2/cells/CRC/assets/QueryHistoryFinder.html", {
                        success: (template) => {
                            cell.view.history.template.finder = Handlebars.compile(template);
                            // Render the template into place
                            $(cell.view.history.template.finder({})).prependTo(container._contentElement);

                            $("#querySearchTermText").on("keypress",function(e) {
                                if(e.which === 13) {
                                    // enter key was pressed while in the query history search entry box
                                    if($("#submitQueryHistorySearch").attr("disabled") === undefined) {
                                        i2b2.CRC.view.history.clickSearchName();
                                    }
                                }
                            });
                        },
                        error: (error) => { console.error("Could not retrieve template: QueryHistoryFinder.html"); }
                    });

                    $('<div id="i2b2QueryHistoryFinderMessage"></div>').prependTo(container._contentElement).hide();

                    // add the status DIV
                    $('<div id="i2b2QueryHistoryFinderStatus"></div>').prependTo(container._contentElement).hide();

                    // create an empty Navigation treeview
                    let treeRoot = $(`
                        <div id="i2b2TreeviewQueryHistory">
                            <div class="history-container">
                                <div class="history-tv"></div>
                                <div class="history-more-bar">Load more...<i class="bi bi-arrow-repeat d-none"></i></div>
                            </div>
                        </div>
                    `).appendTo(container._contentElement);
                    $('.history-more-bar', treeRoot).on('click', i2b2.CRC.view.history.loadMore);
                    let treeTargetNav = $('.history-tv', treeRoot);
                    i2b2.CRC.view.history.treeview = $(treeTargetNav).treeview({
                        showBorder: false,
                        onhoverColor: "rgba(205, 208, 208, 0.56)",
                        highlightSelected: false,
                        dynamicLoading: true,
                        levels: 1,
                        data: []
                    });
                    i2b2.CRC.view.history.treeview.on('nodeLoading', i2b2.CRC.view.history.loadChildren);
                    i2b2.CRC.view.history.treeview.on('onRedraw', i2b2.CRC.view.history.treeRedraw);
                    i2b2.CRC.view.history.treeview.on('onDrag', i2b2.sdx.Master.onDragStart);

                    // create an empty Finder treeview
                    let treeTargetFinder = $('<div id="i2b2TreeviewQueryHistoryFinder"></div>').appendTo(container._contentElement);
                    treeTargetFinder.hide();
                    i2b2.CRC.view.history.treeviewFinder = $(treeTargetFinder).treeview({
                        showBorder: false,
                        onhoverColor: "rgba(205, 208, 208, 0.56)",
                        highlightSelected: false,
                        dynamicLoading: true,
                        levels: 1,
                        data: []
                    });
                    // TODO: THIS NEXT FUNCTION MAY BE USING GLOBAL VARIABLES IN THE i2b2.CRC... NAMESPACE
                    i2b2.CRC.view.history.treeviewFinder.on('nodeLoading', i2b2.CRC.view.history.loadChildren);
                    i2b2.CRC.view.history.treeviewFinder.on('onRedraw', i2b2.CRC.view.history.treeRedraw);
                    i2b2.CRC.view.history.treeviewFinder.on('onDrag', i2b2.sdx.Master.onDragStart);


                    // call the loading request for the history navigation view
                    i2b2.CRC.view.history.LoadQueryMasters();


                    // -------------------- setup context menu --------------------
                    i2b2.CRC.view.history.ContextMenu = new BootstrapMenu('#i2b2TreeviewQueryHistory li.list-group-item', {
                        fetchElementData: function($rowElem) {
                            // fetch the data from the treeview
                            return i2b2.CRC.view.history.treeview.treeview('getNode', $rowElem.data('nodeid'));
                        },
                        actions: {
                            nodeDisplay: {
                                name: 'Display',
                                onClick: function(node) {
                                    i2b2.CRC.view.history.doDisplay(node);
                                },
                                isShown: function(node) {
                                    if (node.depth === 1) {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                }
                            },
                            nodeRename: {
                                name: 'Rename',
                                onClick: function(node) {
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

                    let crcHistoryOptionsModal = $("<div id='crcHistoryOptionsModal'/>");
                    $("body").append(crcHistoryOptionsModal);
                    crcHistoryOptionsModal.load('js-i2b2/cells/CRC/assets/modalOptionsHistory.html', function () {
                        $("body #crcHistoryOptionsModal button.options-save").click(function () {
                            let value = $('#HISTMaxQryDisp').val();
                            let userValue = $('#HISTUser').val();
                            if(!isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10))){
                                if(parseInt(value, 10) > 0){
                                    if ($('#HISTsortOrderASC').is(":checked")) {
                                        tmpValue = 'ASC';
                                    }
                                    else {
                                        tmpValue = 'DESC';
                                    }
                                    i2b2.CRC.view.history.params.sortOrder = tmpValue;
                                    if ($('#HISTsortByNAME').is(":checked")) {
                                        tmpValue = 'NAME';
                                    }
                                    else {
                                        tmpValue = 'DATE';
                                    }
                                    i2b2.CRC.view.history.params.sortBy = tmpValue;
                                    tmpValue = parseInt($('#HISTMaxQryDisp').val(), 10);
                                    i2b2.CRC.view.history.params.maxQueriesDisp = tmpValue;
                                    i2b2.CRC.view.history.params.userBy = userValue;
                                    // requery the history list
                                    i2b2.CRC.view.history.doRefreshAll();

                                    let refreshValue = parseInt($('#HISTAuto').val(), 10);
                                    if(refreshValue > 0){
                                        clearInterval(i2b2.CRC.view.history.autorefresh);
                                        i2b2.CRC.view.history.autorefresh = setInterval(function(){
                                            i2b2.CRC.view.history.doRefreshAll();
                                        }, refreshValue*1000);
                                    } else {
                                        clearInterval(i2b2.CRC.view.history.autorefresh);
                                    }

                                    $("#crcHistoryOptionsModal div").eq(0).modal("hide");
                                } else {
                                    $('#HISTMaxQryDisp').parent().css("border", "2px inset red");
                                    $("#HISTMaxQryDisp-error").text("Please enter number greater than 0.")
                                        .removeClass("hidden");
                                }
                            } else {
                                $('#HISTMaxQryDisp').parent().css("border","2px inset red");
                                $("#HISTMaxQryDisp-error").text("Please enter a valid number.").removeClass("hidden");
                            }
                        });
                    });

                    //HTML template for ontology options
                    $.ajax("js-i2b2/cells/CRC/templates/QueryHistoryOptions.html", {
                        success: (template, status, req) => {
                            Handlebars.registerPartial("QueryHistoryOptions", req.responseText);
                        },
                        error: (error) => { console.error("Could not retrieve template: QueryHistoryOptions.html"); }
                    });

                    container.on( 'tab', function( tab ){
                        if(tab.element.text() === 'Queries') {
                            //add unique id to the term tab
                            let elemId = "queryHistoryTab";
                            $(tab.element).attr("id", elemId);
                            i2b2.ONT.view.nav.options.ContextMenu = new BootstrapMenu("#" + elemId, {
                                actions: {
                                    nodeAnnotate: {
                                        name: 'Show Options',
                                        onClick: function (node) {
                                            $("#queryHistoryOptionsFields").empty();
                                            $((Handlebars.compile("{{> QueryHistoryOptions}}"))(i2b2.CRC.view.history.params)).appendTo("#queryHistoryOptionsFields");
                                            $("#crcHistoryOptionsModal div").eq(0).modal("show");
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

