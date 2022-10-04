console.group('Load & Execute component file: WORK > ctrl > general');
console.time('execute time');


// ======================================================================================
i2b2.WORK.ctrlr.refreshAll = function(view_component) {

    // set loading icon in the stack buttons list
    $('#stackRefreshIcon_i2b2-WORK-view-main').addClass("refreshing");

    i2b2.WORK.view.main.treeview.treeview('clear', []);

    // create initial loader display routine
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = i2b2.WORK;
    scopedCallback.callback = function(results){
        let newNodes = [];
        let nlst = i2b2.h.XPath(results.refXML, "//folder[name and share_id and index and visual_attributes]");
        for (let i = 0; i < nlst.length; i++) {
            let s = nlst[i];
            let nodeData = {};
            nodeData.xmlOrig = s.outerHTML;
            nodeData.index = i2b2.h.getXNodeVal(s, "index");
            nodeData.key = nodeData.index;
            nodeData.name = i2b2.h.getXNodeVal(s, "name");
            nodeData.annotation = i2b2.h.getXNodeVal(s, "tooltip");
            nodeData.share_id = i2b2.h.getXNodeVal(s, "share_id");
            nodeData.visual = String(i2b2.h.getXNodeVal(s, "visual_attributes")).trim();
            nodeData.encapType = i2b2.h.getXNodeVal(s, "work_xml_i2b2_type");
            nodeData.isRoot = true;
            // create new root node
            newNodes.push(i2b2.WORK.view.main._generateTvNode(nodeData.name, nodeData));
        }
        // filter bad nodes
        newNodes = newNodes.filter(function(v) { return v; });
        // push new nodes into the treeview
        i2b2.WORK.view.main.treeview.treeview('addNodes', [
            newNodes,
            true
        ]);
        // render tree
        i2b2.WORK.view.main.treeview.treeview('redraw', []);
        // reset the loading icon in the stack buttons list
        $('#stackRefreshIcon_i2b2-WORK-view-main').removeClass("refreshing");
    };
    // ajax communicator call
    if (i2b2.PM.model.userRoles.indexOf("MANAGER") === -1) {
        i2b2.WORK.ajax.getFoldersByUserId("WORK:Workplace", {}, scopedCallback);
    } else {
        i2b2.WORK.ajax.getFoldersByProject("WORK:Workplace", {}, scopedCallback);
    }
};


// ======================================================================================
i2b2.WORK.ctrlr.main = {};
i2b2.WORK.ctrlr.main.moveItem = function(target_nodeTV, new_parent_nodeTV) {
    // TODO: Reimplement this
    alert("not yet implemented");
};


// ======================================================================================
i2b2.WORK.ctrlr.main.NewFolder = function(parent_node) {
    let fldrName = prompt("What name should be used for the new folder?", "New Folder");
    if (!fldrName)  return false;

    // create callback display routine
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = parent_node;
    scopedCallback.callback = function(results) {
        let cl_new_key = newChildKey;
        let cl_parent_node = parent_node;
        if (results.error) {
            alert("An error occurred while trying to create a new work item!");
        } else {
            // TODO: THIS IS NOT DONE YET!
            // whack the "already loaded" status out of the parent node and initiate a
            // dynamic reloading of the childs nodes (including our newest addition)
            // You may need to delete the child nodes first
            let parentNode = i2b2.WORK.view.main.treeview.treeview('getParent', [target_node]);
            temp_children = parentNode.nodes.map(function(node) { return node.nodeId; });
            i2b2.WORK.view.main.treeview.treeview('deleteNodes', [temp_children]);
            i2b2.WORK.view.main.treeview.treeview('expandNode', [parentNode.nodeId]);
        }
    };

    let newChildKey = i2b2.h.GenerateAlphaNumId(20);
    let pn = parent_node.i2b2;
    let varInput = {
            child_name: fldrName,
            share_id: pn.origData.share_id,
            child_index: newChildKey,
            parent_key_value: pn.sdxInfo.sdxKeyValue,
            child_visual_attributes: "FA",
            child_annotation: "FOLDER:"+fldrName,
            child_work_type: "FOLDER",
            result_wait_time: 180
    };
    i2b2.WORK.ajax.addChild("WORK:Workplace", varInput, scopedCallback);
};


// ======================================================================================
i2b2.WORK.ctrlr.main.Rename = function(target_node) {
    let nd = target_node.i2b2;
    if (typeof nd === 'undefined') {
        console.error("The target node does not have SDX data attached.");
        return false;
    }
    let origName = nd.origData.name;
    let newName = prompt('Rename this work item to:', origName);
    if (!newName || newName === origName) return false;

    // set loading icon in the stack buttons list
    $('#stackRefreshIcon_i2b2-WORK-view-main').addClass("refreshing");

    // create callback display routine
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = target_node;
    scopedCallback.callback = function(results) {
        // reset loading icon in the stack buttons list
        $('#stackRefreshIcon_i2b2-WORK-view-main').removeClass("refreshing");

        let cl_parent_node = target_node.parentNode; // TODO: is this valid?
        if (results.error) {
            alert("An error occurred while trying to rename the selected item!");
        } else {
            // whack the "already loaded" status out of the parent node and initiate a
            // dynamic reloading of the childs nodes (including our newest addition)
            let parentNode = i2b2.WORK.view.main.treeview.treeview('getParent', [target_node]);
            temp_children = parentNode.nodes.map(function(node) { return node.nodeId; });
            i2b2.WORK.view.main.treeview.treeview('deleteNodes', [temp_children]);
            i2b2.WORK.view.main.treeview.treeview('expandNode', [parentNode.nodeId]);
        }
    };
    let pn = target_node.i2b2;
    let varInput = {
        rename_text: newName,
        rename_target_id: pn.sdxInfo.sdxKeyValue,
        result_wait_time: 180
    };
    i2b2.WORK.ajax.renameChild("WORK:Workplace", varInput, scopedCallback);
};


// ======================================================================================
i2b2.WORK.ctrlr.main.Delete = function(target_node, options) {
    // TODO: This needs to be done
    let nd = target_node.i2b2;
    if (!options) { options = {}; }
    if (!options.silent) {
        let nodeTitle = target_node.text;
        nodeTitle = String(nodeTitle).trim();
        let go;
        if (nd.origData.encapType === "FOLDER") {
            go = confirm('Are you sure you want to delete the folder "'+nodeTitle+'" and all of it\'s contents?');
        } else {
            go = confirm('Are you sure you want to delete "'+nodeTitle+'"?');
        }
        if (!go) return false;
    }

    // set loading icon in the stack buttons list
    $('#stackRefreshIcon_i2b2-WORK-view-main').addClass("refreshing");

    let scopedCallback;
    if (options.callback) {
        scopedCallback = options.callback;
    } else {
        // create callback GUI update routine
        scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = target_node;
        scopedCallback.callback = function(results) {
            // unsetset loading icon in the stack buttons list
            $('#stackRefreshIcon_i2b2-WORK-view-main').removeClass("refreshing");

            if (results.error) {
                alert("An error occurred while trying to delete the selected item!");
            } else {
                // Delete targeted node from the treeview and refresh it
                i2b2.WORK.view.main.treeview.treeview('deleteNodes', [target_node.nodeId, false]);
                i2b2.WORK.view.main.treeview.treeview('redraw', []);
            }
        }
    }
    let varInput = {
        delete_target_id: nd.sdxInfo.sdxKeyValue,
        result_wait_time: 180
    };
    i2b2.WORK.ajax.deleteChild("WORK:Workplace", varInput, scopedCallback);
};


// ======================================================================================
i2b2.WORK.ctrlr.main.Annotate = function(target_node) {
    // TODO: This needs to be done
    let nd = target_node.i2b2;
    if (typeof nd === 'undefined') {
        console.error("The target node does not have SDX data attached.");
        return false;
    }
    let origAnno = nd.origData.annotation;
    if (!origAnno) {
        origAnno = '';
    } else {
        let eachLine = origAnno.split('\n');
        if(eachLine.length > 1){ // an annotation was found
            let tempAnno = '';
            for(let i = 1, l = eachLine.length; i < l; i++) {
                tempAnno += eachLine[i];
            }
            origAnno = tempAnno;
        } else {
            origAnno = '';
        }
    }
    let newAnno = prompt('Change this work item\'s annotation to:', origAnno);
    if (!newAnno || newAnno === origAnno) { return false; }

    // create callback display routine
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = target_node;
    scopedCallback.callback = function(results) {
        if (results.error) {
            alert("An error occurred while trying to annotate the selected item!");
        } else {
            // GUI refresh is not needed
            //this.data.i2b2_SDX.origData.annotation = newAnno;
            i2b2.WORK.view.main.refreshTree();
        }
    };
    let varInput = {
        annotation_text: newAnno,
        annotation_target_id: dn.sdxInfo.sdxKeyValue,
        result_wait_time: 180
    };
    i2b2.WORK.ajax.annotateChild("WORK:Workplace", varInput, scopedCallback);
};


// ======================================================================================
i2b2.WORK.ctrlr.main.HandleDrop = function(sdxDropped) {
    // TODO: This needs to be done (or does it?)
};


// ======================================================================================
i2b2.WORK.ctrlr.main.AddWorkItem = function(sdxChild, targetTvNode, options) {
    debugger;

    // TODO: This needs to be done
    if (!options) { options={}; }
    // sanity check can only add children to WRK folders
    if (targetTvNode.i2b2.sdxInfo.sdxType !== "WRK") {
        console.error("This operation was refused. Only a Workplace folder can contain child work items.");
        return false;
    }

    // TODO: filter out WRK objects, if anything process using the sdxUnderlyingData info

    // generate the AJAX submessage depending upon SDX type
    let encapXML = "";
    let encapWorkType = "";
    let encapValues = {};
    let encapTitle = "";
    let encapNoEscape = [];
    switch(sdxChild.sdxInfo.sdxType) {
        case "CONCPT":
            encapXML = i2b2.WORK.cfg.msgs.encapsulateCONCPT;
            encapWorkType = "CONCEPT";
            encapValues.concept_level = sdxChild.origData.level;
            encapValues.concept_id = sdxChild.sdxInfo.sdxKeyValue;
            encapValues.concept_name = sdxChild.origData.name;
            encapTitle = encapValues.concept_name;
            encapValues.concept_synonym = i2b2.h.getXNodeVal(sdxChild.origData.xmlOrig,'synonym_cd');
            encapValues.concept_visual_attributes = i2b2.h.getXNodeVal(sdxChild.origData.xmlOrig,'visualattributes');
            encapValues.concept_total = i2b2.h.getXNodeVal(sdxChild.origData.xmlOrig,'totalnum');
            encapValues.concept_basecode = "";
            encapValues.concept_fact_table_column = i2b2.h.getXNodeVal(sdxChild.origData.xmlOrig,'facttablecolumn');;
            encapValues.concept_table_name = sdxChild.origData.table_name;
            encapValues.concept_column_name = sdxChild.origData.column_name;
            encapValues.concept_column_data_type = i2b2.h.getXNodeVal(sdxChild.origData.xmlOrig,'columndatatype');
            encapValues.concept_operator = sdxChild.origData.operator;
            encapValues.concept_dimcode = sdxChild.origData.dim_code;
            encapValues.concept_comment = i2b2.h.getXNodeVal(sdxChild.origData.xmlOrig,'comment');
            if (!encapValues.concept_comment) { encapValues.concept_comment=''; }
            encapValues.concept_tooltip = sdxChild.origData.tooltip;
            break;
        case "PRS":
            encapXML = i2b2.WORK.cfg.msgs.encapsulatePRS;
            encapWorkType = "PATIENT_COLL";
            encapValues.prs_id = sdxChild.sdxInfo.sdxKeyValue;
            encapValues.qi_id = sdxChild.origData.QI_id;
            encapValues.prs_name = sdxChild.origData.title;
            encapTitle = sdxChild.origData.titleCRC;
            encapValues.prs_description = sdxChild.origData.titleCRC;
            encapValues.prs_set_size = sdxChild.origData.size;
            encapValues.prs_start_date = sdxChild.origData.start_date;
            encapValues.prs_end_date = sdxChild.origData.end_date;
            break;
        case "ENS":
            encapXML = i2b2.WORK.cfg.msgs.encapsulateENS;
            encapWorkType = "ENCOUNTER_COLL";
            encapValues.prs_id = sdxChild.sdxInfo.sdxKeyValue;
            encapValues.qi_id = sdxChild.origData.QI_id;
            encapValues.prs_name = sdxChild.origData.title;
            encapTitle = sdxChild.origData.titleCRC;
            encapValues.prs_description = sdxChild.origData.titleCRC;
            encapValues.prs_set_size = sdxChild.origData.size;
            encapValues.prs_start_date = sdxChild.origData.start_date;
            encapValues.prs_end_date = sdxChild.origData.end_date;
            break;
        case "PRC":
            encapXML = i2b2.WORK.cfg.msgs.encapsulatePRC;
            encapWorkType = "PATIENT_COUNT_XML";
            encapValues.prc_id = sdxChild.sdxInfo.sdxKeyValue;
            encapValues.qi_id = sdxChild.origData.QI_id;
            encapValues.prc_name = sdxChild.origData.title;
            encapTitle = encapValues.prc_name;
            encapValues.prc_set_size = sdxChild.origData.size;
            encapValues.prc_start_date = sdxChild.origData.start_date;
            encapValues.prc_end_date = sdxChild.origData.end_date;
            break;
        case "QM":
            encapXML = i2b2.WORK.cfg.msgs.encapsulateQM;
            encapWorkType = "PREV_QUERY";
            encapValues.qm_id = sdxChild.sdxInfo.sdxKeyValue;
            encapValues.qm_name = sdxChild.origData.name;
            encapTitle = encapValues.qm_name;
            encapValues.qm_user_id = sdxChild.origData.userid;
            encapValues.qm_user_group_id = sdxChild.origData.group;
            break;
        case "PR":
            encapXML = i2b2.WORK.cfg.msgs.encapsulatePR;
            encapWorkType = "PATIENT";
            encapValues.pr_id = sdxChild.sdxInfo.sdxKeyValue;
            encapValues.pr_name = sdxChild.sdxInfo.sdxDisplayName;
            encapValues.parent_prs_id = sdxChild.parent.sdxInfo.sdxKeyValue;
            encapValues.parent_prs_name = sdxChild.parent.sdxInfo.sdxDisplayName;
            encapTitle = encapValues.pr_name;
            break;
        case "QDEF":
            encapXML = i2b2.WORK.cfg.msgs.encapsulateQDEF;
            encapWorkType = "QUERY_DEFINITION";
            encapValues.query_def = i2b2.h.Xml2String(sdxChild.origData.xmlOrig);
            encapTitle = sdxChild.sdxInfo.sdxDisplayName;
            encapNoEscape.push("query_def");
            break;
        case "QGDEF":
            encapXML = i2b2.WORK.cfg.msgs.encapsulateQGDEF;
            encapWorkType = "GROUP_TEMPLATE";
            encapValues.query_def = i2b2.h.Xml2String(sdxChild.origData.xmlOrig);
            encapValues.name = sdxChild.sdxInfo.sdxDisplayName;
            encapTitle = encapValues.name;
            encapNoEscape.push("query_def");
            break;
        default:
            console.error("The operation failed. "+sdxChild.sdxInfo.sdxType+" is an unhandled SDX Type");
            return false;
    }
    // package the work_xml snippet
    i2b2.h.EscapeTemplateVars(encapValues, encapNoEscape);
    let encapMsg = encapXML;
    Object.entries(encapValues).forEach((entry) => {
        console.dir(entry);
        encapMsg = encapMsg.replace(new RegExp("{{{"+entry[0]+"}}}", 'g'), entry[1]);
    });

    // gather primary message info
    let newChildKey = i2b2.h.GenerateAlphaNumId(20);
    let varInput = {
        child_name: encapTitle,
        child_index: newChildKey,
        parent_key_value: targetTvNode.i2b2.sdxInfo.sdxKeyValue,
        share_id: targetTvNode.i2b2.origData.share_id,
        child_visual_attributes: "ZA",
        child_annotation: "",
        child_work_type: encapWorkType,
        child_work_xml: encapMsg,
        result_wait_time: 180
    };
    let scopedCallback;
    if (options.callback) {
        scopedCallback = options.callback;
    } else {
        // create callback display routine
        scopedCallback = new i2b2_scopedCallback();
        scopedCallback.scope = targetTvNode;
        scopedCallback.callback = function(results) {
            let cl_new_key = newChildKey;
            let cl_parent_node = targetTvNode;
            if (results.error) {
                alert("An error occurred while trying to create a new work item!");
            } else {
                // get a list of all children in the parent node
                let parentChildren = cl_parent_node.refTreeview.findNodes(cl_parent_node.nodeId, '', 'parentId').map((node)=>{return node.nodeId});
                // delete the nodes and reset the dynamic loading settings
                cl_parent_node.refTreeview.deleteNodes(parentChildren, true);
                // trigger that the treeview node is opened (and reloaded)
                cl_parent_node.refTreeview.expandNode(cl_parent_node.nodeId);
            }
        }
    }
    i2b2.WORK.ajax.addChild("WORK:Workplace", varInput, scopedCallback);
};


// ======================================================================================
console.timeEnd('execute time');
console.groupEnd();
