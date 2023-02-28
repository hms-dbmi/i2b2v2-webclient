/**
 * @projectDescription	Ontology Concept SDX data controller object.
 * @inherits 	i2b2.sdx.TypeControllers
 * @namespace	i2b2.sdx.TypeControllers.CONCPT
 * @version 	2.0
 **/

i2b2.sdx.TypeControllers.CONCPT = {};
i2b2.sdx.TypeControllers.CONCPT.model = {};
// *********************************************************************************
//	ENCAPSULATE DATA
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'CONCPT', sdxKeyName: 'key', sdxControlCell:'ONT', sdxDisplayNameKey: 'name'};
};

// ================================================================================================== //
// add icon locations to i2b2.ONT.model for centralized management
if (i2b2.ONT.model === undefined) i2b2.ONT.model = {};
i2b2.ONT.model.icons = {
    term: {
        root: "sdx_ONT_CONCPT_root.png",
        rootExp: "sdx_ONT_CONCPT_root-exp.png",
        branch: "sdx_ONT_CONCPT_branch.png",
        branchExp: "sdx_ONT_CONCPT_branch-exp.png",
        leaf: "sdx_ONT_CONCPT_leaf.png"
    },
    modifier: {
        root: "sdx_ONT_MODIFIER_root.png",
        rootExp: "sdx_ONT_MODIFIER_root-exp.png",
        branch: "sdx_ONT_MODIFIER_branch.png",
        branchExp: "sdx_ONT_MODIFIER_branch-exp.png",
        leaf: "sdx_ONT_MODIFIER_leaf.png"
    }
};
// ================================================================================================== //



// *********************************************************************************
//	GENERATE RENDER DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.RenderData= function(sdxData, options) {
    // this function extracts the datatype from the SDX's original XML object and relies upon it's
    // original SDX type controller to retreve the render data
    if (options === undefined) { options = {}; }
    // default CONCPT icons
    if (typeof options.icon !== "object") {
        if (typeof options.icon === 'string') {
            let t = options.icon;
            options.icon = {
                root: t,
                rootExp: t,
                branch: t,
                branchExp: t,
                leaf: t
            };
        } else {
            // TODO: determine if we use term or modifier icons based on sdxData
            if (sdxData.origData.hasChildren.substring(1,0) === "R") {
                options.icon = i2b2.ONT.model.icons.modifier;
            } else {
                options.icon = i2b2.ONT.model.icons.term;
            }
        }
    }
    let nodeInfo = {
            title: undefined,
            iconImg: undefined,
            iconImgExp: undefined,
            cssClassMain: "sdxStyleONT-CONCPT",
            cssClassMinor: undefined,
            moreDescriptMain: undefined,
            moreDescriptMinor: undefined,
            annotation: undefined,
            tvNodeState: {}
    };
    // Modifier or Term
    if (sdxData.origData.hasChildren.substring(1,0) === "R") {
        nodeInfo.cssClassMain = "sdxStyleONT-MODIFIER";
    }

    if (options.title !== undefined) {
        // BUG FIX: Partners uses "zz " to move items to the bottom of lists, java client removes the "zz " prefix.
        if (options.title.substr(0,3) === "zz ") {
            nodeInfo.title = options.title.substr(3);
        } else {
            nodeInfo.title = options.title;
        }
    } else  {
        nodeInfo.title = sdxData.sdxInfo.sdxDisplayName;
    }

    // process allowing children to be viewed
    let bCanExp = false;
    let icon;
    if (sdxData.origData.hasChildren.substring(1,0) === "C"){
        // render as category
        icon = 'root';
        sIG = ' isGroup="Y"';
        bCanExp = true;
    } else if (sdxData.origData.hasChildren.substring(1,0) === "F")  {
        // render as possibly having children
        icon = 'branch';
        bCanExp = true;
    } else if (sdxData.origData.hasChildren.substring(1,0) === "O")  {
        // render as possibly having children
        icon = 'root';
        bCanExp = true;
    } else if (sdxData.origData.hasChildren.substring(1,0) === "D") {
        // render as possibly having children
        icon = 'branch';
        bCanExp = true;
    } else {
        // render as not having children
        icon = 'leaf';
        bCanExp = false;
    }
    // user can override
    if (typeof options.showchildren === "boolean" && !options.showchildren) {
        bCanExp = false;
    }
    if (sdxData.origData.hasOwnProperty('parent') && sdxData.origData.parent !== undefined) { // WEBCLIENT-190
        if (sdxData.origData.parent.origData.hasChildren.substring(2,1) === "I" && sdxData.origData.isModifier) {
            sdxData.origData.hasChildren = sdxData.origData.hasChildren.replace("A","I");
        }
    }

    if (sdxData.origData.hasChildren.substring(2,1) === "I") {
        bCanExp = true;
    } else if (i2b2.ONT.view.nav.params.hiddens !== false && sdxData.origData.hasChildren.substring(2,1) === "H") {
        nodeInfo.color = "#c00000;";
    } else if ((sdxData.origData.synonym_cd !== undefined) && (sdxData.origData.synonym_cd !== 'N')) {
    }

    // see if we can expand
    if (!bCanExp) {
        nodeInfo.tvNodeState.loaded = true;
        nodeInfo.tvNodeState.expanded = true;
    } else {
        nodeInfo.tvNodeState.loaded = false;
        nodeInfo.tvNodeState.expanded = false;
    }

    if (options.icon[icon] !== undefined) {
        nodeInfo.iconImg = i2b2.hive.cfg.urlFramework + 'cells/ONT/assets/'+ options.icon[icon];
    }
    if (options.icon[icon+'Exp'] !== undefined) {
        nodeInfo.iconImgExp = i2b2.hive.cfg.urlFramework + 'cells/ONT/assets/'+ options.icon[icon+'Exp'];
    }
    // in cases of one set icon, copy valid icon to the missing icon
    if ((nodeInfo.iconImg === undefined) && (nodeInfo.iconImgExp !== undefined)) nodeInfo.iconImg = nodeInfo.iconImgExp;
    if ((nodeInfo.iconImg !== undefined) && (nodeInfo.iconImgExp === undefined)) nodeInfo.iconImgExp = nodeInfo.iconImg;

    switch(icon) {
        case "root":
            nodeInfo.cssClassMinor = "tvRoot";
            break;
        case "branch":
            nodeInfo.cssClassMinor = "tvBranch";
            break;
        case "leaf":
            nodeInfo.cssClassMinor = "tvLeaf";
            break;
    }

    // cleanup
    if (nodeInfo.iconImg === undefined) {
        console.warn("[SDX RenderData] no '"+icon+"' icon has been set in the options passed");
        nodeInfo.iconImg = '';
        nodeInfo.iconImgExp = '';
    }

    //Added to provide tooltip information for concepts/terms
    nodeInfo.moreDescriptMinor = "";
    try {
        if ($('ONTNAVshowShortTooltips').checked || $('ONTFINDshowShortTooltips').checked) {
            nodeInfo.moreDescriptMinor += sdxData.origData.name;
        } else {
            if (sdxData.origData.tooltip !== undefined) {
                nodeInfo.moreDescriptMinor += sdxData.origData.tooltip;
            }
        }
        if ($("#ONTNAVshowCodeTooltips").is(":checked") && sdxData.origData.basecode !== undefined) {
            nodeInfo.moreDescriptMinor += " - " + sdxData.origData.basecode;
        }
    }
    catch(e){
        nodeInfo.moreDescriptMinor = "";
    }

    return nodeInfo;
};

// *********************************************************************************
//	GET CHILD RECORDS (DEFAULT HANDELER)
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.LoadChildrenFromTreeview = function(node, onCompleteCallback) {

    if( i2b2.ONT.view.nav.params.modifiers === true){
        i2b2.sdx.TypeControllers.CONCPT.LoadConcepts(node, onCompleteCallback, false);
    } else {
        let cb_concepts = (function (modifierNodes, modifiersParents) {
            let cl_node = node;
            let cb_final = (function (conceptNodes, conceptParents) {
                let allNodes = modifierNodes.concat(conceptNodes);
                let allParents = Array.from(new Set(modifiersParents.concat(conceptParents))); // send only unique values
                onCompleteCallback(allNodes, allParents);
            });
            i2b2.sdx.TypeControllers.CONCPT.LoadConcepts(cl_node, cb_final, false);
        });

        i2b2.sdx.TypeControllers.CONCPT.LoadModifiers(node, cb_concepts, true);
    }
};


// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.LoadConcepts = function(node, onCompleteCallback, modifier) {
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = node;
    scopedCallback.callback = function(results){
        let cl_node = node;
        let cl_options = options;
        let cl_onCompleteCB = onCompleteCallback;
        // handle any errors in the message
        if (results.error) {
            let t;
            // process the specific error
            switch (cl_node.tree) {
                case "ontNavResults":
                    t = i2b2.ONT.view.nav.params;
                    break;
                case "ontSearchCodesResults":
                    t = i2b2.ONT.view.find.params;
                    break;
                case "ontSearchModifiersResults":
                    t = i2b2.ONT.view.find.params;
                    break;
                case "ontSearchNamesResults":
                    t = i2b2.ONT.view.find.params;
                    break;
                default:
                    t = i2b2.ONT.params;
            }
            var errorCode = results.refXML.getElementsByTagName('status')[0].firstChild.nodeValue;
            var eaction = false;
            if (errorCode === "MAX_EXCEEDED") {
                var eaction = confirm("The number of terms that were returned exceeds the maximum number currently set as " + t.max + ". Would you like to increase it to " + (t.max * 5) + " so you can try again?");
                if (eaction === true) i2b2.ONT.view.find.params.max = t.max * 5;
            } else {
                alert("The following error has occurred:\n" + errorCode);
            }
            // re-fire the call with no max limit if the user requested so
            if (eaction) {
                // TODO: Implement param routing from node's container
                t.max = t.max * 5;
                // TODO: code rerun of last action
                //var mod_options = Object.clone(cl_options);
                //delete mod_options.ont_max_records;
                //i2b2.ONT.ajax.GetChildConcepts("ONT:SDX:Concept", mod_options, scopedCallback );
                //   return true;
            }
            // ROLLBACK the tree changes
            cl_onCompleteCB();
            return false;
        }
        let c, renderOptions;
        if (modifier) {
            c = results.refXML.getElementsByTagName('modifier');
            renderOptions = { icon: i2b2.ONT.model.icons.modifier };
        } else {
            c = results.refXML.getElementsByTagName('concept');
            renderOptions = { icon: i2b2.ONT.model.icons.term };
        }
        let retList = [];
        let retParents = [];
        for (let i=0; i<1*c.length; i++) {
            let sdxDataNode = i2b2.sdx.TypeControllers.CONCPT.MakeObject(c[i], modifier, cl_options, this.i2b2);

            renderOptions.title = i2b2.h.getXNodeVal(c[i],'name');
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
            sdxDataNode.renderData.idDOM = "ONT_TV-" + i2b2.GUID();
            sdxDataNode.origData.parent = this.i2b2;
            let temp = {
                title: sdxDataNode.renderData.moreDescriptMinor,
                text: sdxDataNode.renderData.title,
                icon: sdxDataNode.renderData.cssClassMain,
                key: sdxDataNode.sdxInfo.sdxKeyValue,
                iconImg: sdxDataNode.renderData.iconImg,
                iconImgExp: sdxDataNode.renderData.iconImgExp,
                color: sdxDataNode.renderData.color,
                i2b2: sdxDataNode
            };

            if(sdxDataNode.origData.synonym_cd !== undefined && sdxDataNode.origData.synonym_cd !== 'N'){
                temp.color = "#0000ff";
            }
            temp.state = sdxDataNode.renderData.tvNodeState;
            if (sdxDataNode.renderData.cssClassMinor !== undefined) temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
            if (typeof cl_node === 'undefined' || (typeof cl_node === 'string' && String(cl_node).trim() === '')) {
                temp.parentKey = undefined;
            } else if(typeof cl_node === 'object') {
                temp.parentKey = cl_node.i2b2.sdxInfo.sdxKeyValue;
                retParents.push(temp.parentKey);
            } else {
                temp.parentKey = cl_node;
                retParents.push(cl_node.i2b2.sdxInfo.sdxKeyValue);
            }
            retList.push(temp);
        }

        // make the parents array contain only unique values
        retParents = Array.from(new Set(retParents));

        // Send the data back to the calling app
        cl_onCompleteCB(retList, retParents);
    };
    // TODO: Implement param routing from node's container
    let options = {};
    let t;
    switch (node.refTreeview.elementId) {
        case "i2b2TreeviewOntNav":
        case "i2b2TreeviewOntSearch":
            t = i2b2.ONT.view.nav.params;
            break;
        default:
            t = i2b2.ONT.params;
    }
    if (t === undefined) t = {};
    if (t.hiddens !== undefined) {
        options.ont_hidden_records = t.hiddens;
    } else {
        options.ont_hidden_records = "N";
    }
    if (t.max !== undefined) {
        options.ont_max_records = "max='"+t.max+"' ";
    } else {
        options.ont_max_records = "";
    }
    if (t.synonyms !== undefined) {
        options.ont_synonym_records = t.synonyms;
    } else {
        options.ont_synonym_records = "N";
    }
    if (t.patientCount !== undefined) {
        options.ont_patient_count = t.patientCount;
    }
    if (t.shortTooltip !== undefined) {
        options.ont_short_tooltip = t.shortTooltip;
    }
    if (t.showConceptCode !== undefined) {
        options.ont_show_concept_code = t.showConceptCode;
    }
    if (t.modifiers === undefined || t.modifiers === false) {
        options.version = i2b2.ClientVersion;
    } else {
        options.version = "1.5";
    }

    switch (typeof node) {
        case 'string':
            options.concept_key_value = node;
            break;
        case 'object':
            options.concept_key_value = node.i2b2.sdxInfo.sdxKeyValue;
            break;
        default:
            options.concept_key_value = '';
            break;
    }
    if (options.version === undefined) options.version = "1.5";
    i2b2.ONT.ajax.GetChildConcepts("ONT:SDX:Concept", options, scopedCallback );
};

// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.MakeObject = function(c, modifier, cl_options, origData, objectType) {
            let o = {};
            o.xmlOrig = c.outerHTML;
            o.parent = origData;
            if (modifier) {
                o.isModifier = true;
                o.applied_path = i2b2.h.getXNodeVal(c,'applied_path');
            } else {
                o.isModifier = false;
            }
            o.name = i2b2.h.getXNodeVal(c,'name');
            if (objectType !== undefined && objectType === "QM") {
                o.id = i2b2.h.getXNodeVal(c,'query_master_id');
                o.title = "(PrevQuery)" + o.name;
            } else if (objectType !== undefined && (objectType === "PRS" || objectType === "ENS")) {
                o.result_instance_id = i2b2.h.getXNodeVal(c,'result_instance_id');
                o.title = i2b2.h.getXNodeVal(c,'description');
            }
            //o.hasChildren = i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,2);
            if (i2b2.h.getXNodeVal(c,'visualattributes') !== undefined) {
                o.hasChildren = String(i2b2.h.getXNodeVal(c,'visualattributes').substring(0,3)).trim();
            }
            o.level = i2b2.h.getXNodeVal(c,'level');
            o.key = i2b2.h.getXNodeVal(c,'key');
            if (cl_options !== undefined && cl_options.ont_short_tooltip) {
                o.tooltip = o.name;
            } else {
                o.tooltip = i2b2.h.getXNodeVal(c,'tooltip');
            }
            o.icd9 = '';
            o.table_name = i2b2.h.getXNodeVal(c,'tablename');
            o.column_name = i2b2.h.getXNodeVal(c,'columnname');
            o.operator = i2b2.h.getXNodeVal(c,'operator');
            o.total_num = i2b2.h.getXNodeVal(c,'totalnum');
            o.synonym_cd = i2b2.h.getXNodeVal(c,'synonym_cd');
            o.dim_code = i2b2.h.getXNodeVal(c,'dimcode');
            o.basecode = i2b2.h.getXNodeVal(c,'basecode');
            if (cl_options !== undefined && cl_options.ont_show_concept_code && o.basecode !== undefined) {
                o.tooltip  += "(" + o.basecode + ")";
            }
            // append the data node
            if (objectType !== undefined) {
                return i2b2.sdx.Master.EncapsulateData(objectType, o);
            } else {
                return i2b2.sdx.Master.EncapsulateData("CONCPT", o);
            }
};

// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.LoadModifiers = function(node, onCompleteCallback, modifier) {
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = node;
    scopedCallback.callback = function(results){
        let cl_node = node;
        let cl_onCompleteCB = onCompleteCallback;
        let cl_options = options;
        let retNodes = [];
        let retParents = new Set();
        // handle any errors in the message
        if (results.error) {
            // process the specific error
            cl_onCompleteCB([],[]);
            return false;
        }
        let renderOptions = { icon: i2b2.ONT.model.icons.modifier };
        let c = results.refXML.getElementsByTagName('modifier');
        for (let i=0; i<1*c.length; i++) {
            renderOptions.title = i2b2.h.getXNodeVal(c[i],'name');
            let sdxDataNode = i2b2.sdx.TypeControllers.CONCPT.MakeObject(c[i], modifier, cl_options, cl_node.i2b2);
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
            sdxDataNode.renderData.cssClassMain = "sdxStyleONT-MODIFIER";
            sdxDataNode.renderData.idDOM = "ONT_TV-" + i2b2.GUID();
            sdxDataNode.origData.conceptModified = cl_node.i2b2;
            delete sdxDataNode.origData.conceptModified.origData.parent;
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
            if (sdxDataNode.renderData.cssClassMinor !== undefined) temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
            if (typeof cl_node === 'undefined' || (typeof cl_node === 'string' && String(cl_node).trim() === '')) {
                temp.parentKey = undefined;
            } else if(typeof cl_node === 'object') {
                temp.parentKey = cl_node.i2b2.sdxInfo.sdxKeyValue;
                retParents.add(temp.parentKey);
            } else {
                temp.parentKey = cl_node;
                retParents.add(cl_node.i2b2.sdxInfo.sdxKeyValue);
            }
            // get full details of the modifier
            i2b2.ONT.ctrlr.gen.getModifierDetails(temp.i2b2);
            retNodes.push(temp);
        }
        cl_onCompleteCB(retNodes, Array.from(retParents));
    };
    // TODO: Implement param routing from node's container
    let options = {};
    let t = i2b2.ONT.params;
    if (t !== undefined) {
        if (t.hiddens !== undefined) options.ont_hidden_records = t.hiddens;
        if (t.max !== undefined) options.ont_max_records = "max='"+t.max+"' ";
        if (t.synonyms !== undefined) options.ont_synonym_records = t.synonyms;
        if (t.patientCount !== undefined) options.ont_patient_count = t.patientCount;
        if (t.shortTooltip !== undefined) options.ont_short_tooltip = t.shortTooltip;
        if (t.showConceptCode !== undefined) options.ont_show_concept_code = t.showConceptCode;
    }
    options.concept_key_value = node.i2b2.sdxInfo.sdxKeyValue;

    switch (node.i2b2.origData.hasChildren) {
        case "DA":
        case "DAE":
        case "OA":
        case "OAE":
            options.modifier_key_value = node.i2b2.origData.key;
            options.modifier_applied_path = node.i2b2.origData.applied_path;

            let realdata = node.i2b2.origData;
            while ((realdata.hasChildren !== "FA") &&
            (realdata.hasChildren !== "CA") &&
            (realdata.hasChildren !== "FAE") &&
            (realdata.hasChildren !== "CAE")) {
                realdata  = realdata.parent;
            }
            options.modifier_applied_concept = realdata.key; //node.data.i2b2_SDX.origData.parent.key;
            i2b2.ONT.ajax.GetChildModifiers("ONT:SDX:Modifiers", options, scopedCallback );
            break;
        default:
            i2b2.ONT.ajax.GetModifiers("ONT:SDX:Concepts", options, scopedCallback );
            break;
    }
};


// *********************************************************************************
//	<BLANK> DROP HANDLER 
//	!!!! DO NOT EDIT - ATTACH YOUR OWN CUSTOM ROUTINE USING
//	!!!! THE i2b2.sdx.Master.setHandlerCustom() FUNCTION
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.DropHandler = function(sdxData) {alert('[Concept DROPPED] You need to create your own custom drop event handler.'); };


// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.parent;
    if (i2b2Data.renderData !== undefined) delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};
