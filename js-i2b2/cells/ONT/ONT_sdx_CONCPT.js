/**
 * @projectDescription	Ontology Concept SDX data controller object.
 * @inherits 	i2b2.sdx.TypeControllers
 * @namespace	i2b2.sdx.TypeControllers.CONCPT
 * @author		Nick Benik, Griffin Weber MD PhD
 * @version 	1.3
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */
console.group('Load & Execute component file: ONT > SDX > CONCPT');
console.time('execute time');


i2b2.sdx.TypeControllers.CONCPT = {};
i2b2.sdx.TypeControllers.CONCPT.model = {};
// *********************************************************************************
//	ENCAPSULATE DATA
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'CONCPT', sdxKeyName: 'key', sdxControlCell:'ONT', sdxDisplayNameKey: 'name'};
}



// *********************************************************************************
//	GENERATE RENDER DATA (DEFAULT HANDLER)
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.RenderData= function(sdxData, options) {
    // this function extracts the datatype from the SDX's original XML object and relies upon it's
    // original SDX type controller to retreve the render data
    if (i2b2.h.isUndefined(options)) { options = {}; }
    // default CONCPT icons
    if (!$.isArray(options.icon)) {
        if (typeof options.icon == 'string') {
            var t = options.icon;
            options.icon = {
                root: t,
                rootExp: t,
                branch: t,
                branchExp: t,
                leaf: t
            };
        } else {
            options.icon = {
                root: 'sdx_ONT_CONCPT_root.gif',
                rootExp: 'sdx_ONT_CONCPT_root-exp.gif',
                branch: 'sdx_ONT_CONCPT_branch.gif',
                branchExp: 'sdx_ONT_CONCPT_branch-exp.gif',
                leaf: 'sdx_ONT_CONCPT_leaf.gif'
            };
        }
    }

    var nodeInfo = {
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


    if (options.title !== undefined) {
        // BUG FIX: Partners uses "zz " to move items to the bottom of lists, java client removes the "zz " prefix.
        if (options.title.substr(0,3) == "zz ") {
            nodeInfo.title = options.title.substr(3);
        } else {
            nodeInfo.title = options.title;
        }
    } else  {
        nodeInfo.title = sdxData.sdxInfo.sdxDisplayName;
    }
    /*
    if ($('ONTNAVshowPatientCounts').checked && sdxData.origData.total_num == 0) {
        retHtml += "[";
    }
    if ($('ONTNAVshowPatientCounts').checked) {
        if (!i2b2.h.isUndefined(sdxData.origData.total_num)) {
            retHtml += " - " + sdxData.origData.total_num;
        }
        if (sdxData.origData.total_num == 0) {
            retHtml += "]";
        }
    }

    if (!i2b2.h.isUndefined(options.title)) {
        retHtml += options.title;
    } else {
        console.warn('[SDX RenderHTML] no title was given in the creation options for an ONT>CONCPT node!');
        retHtml += ' CONCPT '+id;
    }
     */



    // process allowing children to be viewed
    var bCanExp = false;
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
        var icon = 'leaf';
        bCanExp = false;
    }
    // user can override
    if (typeof options.showchildren == "boolean" && !options.showchildren) {
        bCanExp = false;
    }
    if(sdxData.origData.hasOwnProperty('parent') && sdxData.origData.parent !== undefined){ // WEBCLIENT-190
        if (sdxData.origData.parent.origData.hasChildren.substring(2,1) === "I" && sdxData.origData.isModifier){
            sdxData.origData.hasChildren = sdxData.origData.hasChildren.replace("A","I");
        }
    }
    if (sdxData.origData.hasChildren.substring(2,1) === "I")
    {
        bCanExp = true;
        sDD = " style='color: #c0c0c0;' ";
    }
    else if (sdxData.origData.hasChildren.substring(2,1) === "H")
    {
        sDD += " style='color: #c00000;' ";
    }
    else if ((sdxData.origData.synonym_cd !== undefined) && (sdxData.origData.synonym_cd != 'N'))
    {
        sDD += " style='color: #0000ff;' ";
    }

    // see if we can expand
    if (!bCanExp) {
        nodeInfo.tvNodeState.loaded = true;
        nodeInfo.tvNodeState.expanded = true;
    }

    if (icon !== undefined) {
        if (options.icon[icon] !== undefined) {
            nodeInfo.iconImg = i2b2.hive.cfg.urlFramework + 'cells/ONT/assets/'+ options.icon[icon];
        }
        if (options.icon[icon+'Exp'] !== undefined) {
            nodeInfo.iconImgExp = i2b2.hive.cfg.urlFramework + 'cells/ONT/assets/'+ options.icon[icon+'Exp'];
        }
        // in cases of one set icon, copy valid icon to the missing icon
        if (i2b2.h.isUndefined(nodeInfo.iconImg) && (nodeInfo.iconImgExp !== undefined)) {	nodeInfo.iconImg = nodeInfo.iconImgExp; }
        if ((nodeInfo.iconImg !== undefined) && i2b2.h.isUndefined(nodeInfo.iconImgExp)) {	nodeInfo.iconImgExp = nodeInfo.iconImg; }

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
    }

    // cleanup
    if (i2b2.h.isUndefined(nodeInfo.iconImg)) {
        console.warn("[SDX RenderData] no '"+icon+"' icon has been set in the options passed");
        console.dir(options);
        nodeInfo.iconImg = '';
        nodeInfo.iconImgExp = '';
    }

    //Added to provide tooltip information for concepts/terms
    nodeInfo.moreDescriptMinor = "";
    try{
        if (($('ONTNAVshowShortTooltips').checked) || ($('ONTFINDshowShortTooltips').checked) )
        {
            nodeInfo.moreDescriptMinor += sdxData.origData.name;
        } else {
            if (sdxData.origData.tooltip !== undefined) {
                nodeInfo.moreDescriptMinor += sdxData.origData.tooltip;
            }
        }
        if ((($('ONTNAVshowCodeTooltips').checked) || ($('ONTFINDshowCodeTooltips').checked) ) && (sdxData.origData.basecode !== undefined))
        {
            nodeInfo.moreDescriptMinor += " - " + sdxData.origData.basecode;
        }
    }
    catch(e){
        nodeInfo.moreDescriptMinor = "";
    }

    return nodeInfo;

};

// *********************************************************************************
//	GENERATE HTML (For Backwards compatibility)
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.RenderHTML= function(sdxData, options, targetDiv) {
    console.warn("[i2b2.sdx.TypeControllers.CONCPT.RenderHTML] is deprecated!");
    // OPTIONS:
    //	title: string
    //	showchildren: true | false
    //	cssClass: string
    //	icon: [data object]
    //		root: 		(filename of img, appended to i2b2_root+cellDir + '/assets')
    //		rootExp: 	(filename of img, appended to i2b2_root+cellDir + '/assets')
    //		branch:	(filename of img, appended to i2b2_root+cellDir + '/assets')
    //		branchExp:	(filename of img, appended to i2b2_root+cellDir + '/assets')
    //		leaf:		(filename of img, appended to i2b2_root+cellDir + '/assets')
    //		leafExp:	(filename of img, appended to i2b2_root+cellDir + '/assets')
    //	dragdrop: string (function name)
    //	context: string
    //	click: string
    //	dblclick: string

    if (i2b2.h.isUndefined(options)) { options = {}; }
    var render = {html: retHtml, htmlID: id};
    var conceptId = sdxData.name;
    var id = "ONT_TID-" + i2b2.GUID();

    // process drag drop controllers
    if (options.dragdrop !== undefined) {
// NOTE TO SELF: should attachment of node dragdrop controller be handled by the SDX system as well? 
// This would ensure removal of the onmouseover call in a cross-browser way
        var sDD = '  onmouseover="' + options.dragdrop + '(\''+ targetDiv.id +'\',\'' + id + '\')" ';
    } else {
        var sDD = '';
    }

    // process allowing children to be viewed
    var bCanExp = false;
    if (sdxData.origData.hasChildren.substring(1,0) === "C"){
        // render as category
        icon = 'root';
        sDD = '';
        sIG = ' isGroup="Y"';
        bCanExp = true;
    } else if (sdxData.origData.hasChildren.substring(1,0) === "F")  {
        // render as possibly having children
        icon = 'branch';
        bCanExp = true;
        //var sCanExpand = ' canExpand="Y"';
    } else if (sdxData.origData.hasChildren.substring(1,0) === "O")  {
        // render as possibly having children
        icon = 'root';
        bCanExp = true;
        //var sCanExpand = ' canExpand="Y"';
    } else if (sdxData.origData.hasChildren.substring(1,0) === "D") {
        // render as possibly having children
        icon = 'branch';
        bCanExp = true;
        //var sCanExpand = ' canExpand="Y"';

    } else {
        // render as not having children
        var icon = 'leaf';
        bCanExp = false;
    }
    // user can override
    if (typeof options.showchildren == "boolean") {
        if (!options.showchildren) bCanExp = false;
    }
    if(sdxData.origData.hasOwnProperty('parent') && typeof sdxData.origData.parent !== "undefined"){ // WEBCLIENT-190
        if (sdxData.origData.parent.hasChildren.substring(2,1) === "I" && sdxData.origData.isModifier){
            sdxData.origData.hasChildren = sdxData.origData.hasChildren.replace("A","I");
        }
    }
    if (sdxData.origData.hasChildren.substring(2,1) === "I")
    {
        bCanExp = true;
        sDD = " style='color: #c0c0c0;' ";
    }
    else if (sdxData.origData.hasChildren.substring(2,1) === "H")
    {
        sDD += " style='color: #c00000;' ";
    }
    else if ((sdxData.origData.synonym_cd !== undefined) && (sdxData.origData.synonym_cd != 'N'))
    {
        sDD += " style='color: #0000ff;' ";
    }
    render.canExpand = bCanExp;
    render.iconType = 'CONCPT_'+icon;
    if (icon !== undefined) {
        var icn = (eval('options.icon.'+icon));
        if (icn !== undefined) { render.icon = i2b2.hive.cfg.urlFramework + 'cells/ONT/assets/'+ icn }
        var icn = (eval('options.icon.'+icon+'Exp'));
        if (icn !== undefined) { render.iconExp = i2b2.hive.cfg.urlFramework + 'cells/ONT/assets/'+ icn }
        // in cases of one set icon, copy valid icon to the missing icon
        if (i2b2.h.isUndefined(render.icon) && (render.iconExp !== undefined)) {	sdxData.icon = render.iconExp; }
        if ((render.icon !== undefined) && i2b2.h.isUndefined(render.iconExp)) {	sdxData.iconExp = render.icon; }
    }
    // cleanup
    if (i2b2.h.isUndefined(render.icon)) {
        console.warn("[SDX RenderHTML] no '"+icon+"' icon has been set in the options passed");
        console.dir(options);
        render.icon = '';
        render.iconExp = '';
    }

    // handle the event controllers
    var sMainEvents = sDD;
    var sImgEvents = sDD;
    switch(icon) {
        case "root":
            if (options.click) {sMainEvents += ' onclick="'+ options.click +'" '; }
            if (options.dblclick) {sMainEvents += ' ondblclick="'+ options.dblclick +'" '; }
            if (options.context) {sMainEvents += ' oncontext="'+ options.context +'" '; } else {retHtml += ' oncontextmenu="return false" '; }
            break;
        case "branch":
            if (options.click) { sMainEvents += ' onclick="'+ options.click +'" '; }
            if (options.dblclick) { sMainEvents += ' ondblclick="'+ options.dblclick +'" '; }
            if (options.context) { sMainEvents += ' oncontext="'+ options.context +'" '; } else {retHtml += ' oncontextmenu="return false" '; }
            break;
        default:
            sMainEvents += ' oncontextmenu="return false" ';
    }

    //Added to provide tooltip information for concepts/terms
    var v_tooltip = '';

    try{
        if (($('ONTNAVshowShortTooltips').checked) || ($('ONTFINDshowShortTooltips').checked) )
        {
            v_tooltip += 'title="'+ sdxData.origData.name;
        } else
        {
            v_tooltip += 'title="'+ sdxData.origData.tooltip;
        }

        if ((($('ONTNAVshowCodeTooltips').checked) || ($('ONTFINDshowCodeTooltips').checked) ) && (sdxData.origData.basecode !== undefined))
        {
            v_tooltip += " - " + sdxData.origData.basecode;
        }

        v_tooltip += '" ';
    }
    catch(e){
        v_tooltip = '';
    }

    // **** Render the HTML ***
    var retHtml = '<DIV id="' + id + '" '+ v_tooltip + sMainEvents + ' style="cursor:pointer;">';
    retHtml += '<DIV ';
    if (Object.isString(options.cssClass)) {
        retHtml += ' class="'+options.cssClass+'" ';
    } else {
        retHtml += ' class= "sdxDefaultCONCPT" ';
    }
    retHtml += sImgEvents;
    retHtml += '>';
    retHtml += '<IMG src="'+render.icon+'" draggable="false"/>';
    if ($('ONTNAVshowPatientCounts').checked && sdxData.origData.total_num == 0)
    {
        retHtml += "[";
    }
    if (options.title !== undefined) {
        // BUG FIX: Partners uses "zz " to move items to the bottom of lists, java client removes the "zz " prefix.
        if (options.title.substr(0,3) == "zz ") { options.title = options.title.substr(3); }
        retHtml += options.title;
    } else {
        console.warn('[SDX RenderHTML] no title was given in the creation options for an ONT>CONCPT node!');
        retHtml += ' CONCPT '+id;
    }
    if ($('ONTNAVshowPatientCounts').checked)
    {
        if (sdxData.origData.total_num !== undefined) {
            retHtml += " - " + sdxData.origData.total_num;
        }
        if (sdxData.origData.total_num == 0)
        {
            retHtml += "]";
        }
    }
    retHtml += '</DIV></DIV>';
    render.html = retHtml;
    render.htmlID =  id;
    return { renderData: render, origData: sdxData.origData, sdxInfo: sdxData.sdxInfo };
}

// *********************************************************************************
//	GET CHILD RECORDS (DEFAULT HANDELER)
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.LoadChildrenFromTreeview = function(node, onCompleteCallback) {
    console.error("[i2b2.sdx.TypeControlers.CONCPT.LoadChildrenFromTreeview] is depricated!");
//    return false;
    var cb_concepts = (function() {
        var cl_node = node;
        var cb_final = onCompleteCallback;
        i2b2.sdx.TypeControllers.CONCPT.LoadConcepts(cl_node, cb_final, false);
    })


    i2b2.sdx.TypeControllers.CONCPT.LoadModifiers(node, cb_concepts, true);


//    if ((node.tree_id == 'ontSearchModifiersResults') || (!$('ONTNAVdisableModifiers').checked && node.tree_id == 'ontNavResults')) {
//        // the node that was expanded is attached to the ontNavResults treeview
//        i2b2.sdx.TypeControllers.CONCPT.LoadModifiers(node, onCompleteCallback, true);
//    } else {
//       i2b2.sdx.TypeControllers.CONCPT.LoadConcepts(node, onCompleteCallback, false);
//    }
}


i2b2.sdx.TypeControllers.CONCPT.LoadConcepts = function(node, onCompleteCallback, modifier) {
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = node;
    scopedCallback.callback = function(results){
        var cl_node = node;
        var cl_options = options;
        var cl_onCompleteCB = onCompleteCallback;
        // THIS function is used to process the AJAX results of the getChild call
        //		results data object contains the following attributes:
        //			refXML: xmlDomObject <--- for data processing
        //			msgRequest: xml (string)
        //			msgResponse: xml (string)
        //			error: boolean
        //			errorStatus: string [only with error=true]
        //			errorMsg: string [only with error=true]

        // handle any errors in the message
        if (results.error) {
            // process the specific error
            switch (cl_node.tree) {
                case "ontNavResults":
                    var t = i2b2.ONT.view.nav.params;
                    break;
                case "ontSearchCodesResults":
                    var t = i2b2.ONT.view.find.params;
                    break;
                case "ontSearchModifiersResults":
                    var t = i2b2.ONT.view.find.params;
                    break;
                case "ontSearchNamesResults":
                    var t = i2b2.ONT.view.find.params;
                    break;
                default:
                    var t = i2b2.ONT.params;
            }
            var errorCode = results.refXML.getElementsByTagName('status')[0].firstChild.nodeValue;
            var eaction = false;
            if (errorCode == "MAX_EXCEEDED") {
                var eaction = confirm("The number of terms that were returned exceeds the maximum number currently set as " + t.max + ". Would you like to increase it to " + (t.max * 5) + " so you can try again?");
            }
            else {
                alert("The following error has occurred:\n" + errorCode);
            }
            // re-fire the call with no max limit if the user requested so
            if (eaction) {
                // TODO: Implement param routing from node's container
                //var mod_options = Object.clone(cl_options);
                //delete mod_options.ont_max_records;
                //i2b2.ONT.ajax.GetChildConcepts("ONT:SDX:Concept", mod_options, scopedCallback );
                //   return true;
                t.max = t.max * 5;
            }
            // ROLLBACK the tree changes
            cl_onCompleteCB();
            return false;
        }
        if (modifier) {
            var c = results.refXML.getElementsByTagName('modifier');
            var renderOptions = {
                icon: {
                    root: "sdx_ONT_MODIFIER_root.gif",
                    rootExp: "sdx_ONT_MODIFIER_root-exp.gif",
                    branch: "sdx_ONT_MODIFIER_branch.gif",
                    branchExp: "sdx_ONT_MODIFIER_branch-exp.gif",
                    leaf: "sdx_ONT_MODIFIER_leaf.gif"
                }
            };
        } else {
            var c = results.refXML.getElementsByTagName('concept');
            var renderOptions = {
                icon: {
                    root: "sdx_ONT_CONCPT_root.gif",
                    rootExp: "sdx_ONT_CONCPT_root-exp.gif",
                    branch: "sdx_ONT_CONCPT_branch.gif",
                    branchExp: "sdx_ONT_CONCPT_branch-exp.gif",
                    leaf: "sdx_ONT_CONCPT_leaf.gif"
                }
            };
        }
        var retList = [];
        for(var i=0; i<1*c.length; i++) {
            /*
            var o = new Object;
            o.xmlOrig = c[i];
            o.parent = this.origData;
            if (modifier) {
                o.isModifier = true;
                o.applied_path = i2b2.h.getXNodeVal(c[i],'applied_path');
            } else {
                o.isModifier = false;
            }
            o.name = i2b2.h.getXNodeVal(c[i],'name');
            //o.hasChildren = i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,2);
            o.hasChildren = YAHOO.lang.trim(i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,3));
            o.level = i2b2.h.getXNodeVal(c[i],'level');
            o.key = i2b2.h.getXNodeVal(c[i],'key');
            if (cl_options.ont_short_tooltip) {
                o.tooltip = o.name;
            } else {
                o.tooltip = i2b2.h.getXNodeVal(c[i],'tooltip');
            }
            o.icd9 = '';
            o.table_name = i2b2.h.getXNodeVal(c[i],'tablename');
            o.column_name = i2b2.h.getXNodeVal(c[i],'columnname');
            o.operator = i2b2.h.getXNodeVal(c[i],'operator');
            o.total_num = i2b2.h.getXNodeVal(c[i],'totalnum');
            o.dim_code = i2b2.h.getXNodeVal(c[i],'dimcode');
            o.basecode = i2b2.h.getXNodeVal(c[i],'basecode');
            if (cl_options.ont_show_concept_code && o.basecode != undefined) {
                o.tooltip  += "(" + o.basecode + ")";
            }
            // append the data node
            var sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT',o);
            */
            var sdxDataNode = i2b2.sdx.TypeControllers.CONCPT.MakeObject(c[i], modifier, cl_options, this.i2b2);

            renderOptions.title = i2b2.h.getXNodeVal(c[i],'name');
            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
            sdxDataNode.renderData.idDOM = "ONT_TV-" + i2b2.GUID();
            sdxDataNode.origData.parent = this.i2b2;
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
            if(sdxDataNode.renderData.cssClassMinor !== undefined) {
                temp.icon += " " + sdxDataNode.renderData.cssClassMinor;
            }
            if (typeof cl_node == 'undefined' || (typeof cl_node == 'string' && String(cl_node).trim() == '')) {
                temp.parentKey = undefined;
            } else if(typeof cl_node == 'object') {
                temp.parentKey = cl_node.i2b2.sdxInfo.sdxKeyValue;
            } else {
                temp.parentKey = cl_node;
            }
            retList.push(temp);
        }

        // create a unique list of parentKeys gathered from the children
        var retParents = $.unique(retList.map(function(v) { return v.parentKey }));
        // add the originally passed parent to the array (incase no children are returned)
        switch (typeof node) {
            case 'string':
                retParents.push(cl_node);
                break;
            case 'object':
                retParents.push(cl_node.i2b2.sdxInfo.sdxKeyValue);
                break;
            default:
                break;
        }

        // Send the data back to the calling app
        cl_onCompleteCB(retList, retParents);
    }
    // TODO: Implement param routing from node's container
    var options = {};
    /*
    switch (node.tree) {
        case "ontNavResults":
            var t = i2b2.ONT.view.nav.params;
            break;
        case "ontSearchCodesResults":
            var t = i2b2.ONT.view.find.params;
            break;
        case "ontSearchModifiersResults":
            var t = i2b2.ONT.view.find.params;
            break;
        case "ontSearchNamesResults":
            var t = i2b2.ONT.view.find.params;
            break;
        default:
            var t = i2b2.ONT.params;
    }
    */
    var t = i2b2.ONT.params;
    if (i2b2.h.isUndefined(t)) t = {};
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
    if (i2b2.h.isUndefined(t.modifiers) || t.modifiers == false) {
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
    if (i2b2.h.isUndefined(options.version)) options.version = "1.5";
    i2b2.ONT.ajax.GetChildConcepts("ONT:SDX:Concept", options, scopedCallback );
}

i2b2.sdx.TypeControllers.CONCPT.MakeObject = function(c, modifier, cl_options, origData, objectType) {
            var o = {};
            o.xmlOrig = c;
            o.parent = origData;
            if (modifier) {
                o.isModifier = true;
                o.applied_path = i2b2.h.getXNodeVal(c,'applied_path');
            } else {
                o.isModifier = false;
            }
            o.name = i2b2.h.getXNodeVal(c,'name');
            if (objectType != undefined && objectType == "QM") {
                o.id = i2b2.h.getXNodeVal(c,'query_master_id');
                o.title = "(PrevQuery)" + o.name;
            } else 			if (objectType != undefined && (objectType == "PRS" || objectType == "ENS")) {
                o.result_instance_id = i2b2.h.getXNodeVal(c,'result_instance_id');
                o.title = i2b2.h.getXNodeVal(c,'description');
            }
            //o.hasChildren = i2b2.h.getXNodeVal(c[i],'visualattributes').substring(0,2);
            if (i2b2.h.getXNodeVal(c,'visualattributes') != undefined) {
                o.hasChildren = String(i2b2.h.getXNodeVal(c,'visualattributes').substring(0,3)).trim();
            }
            o.level = i2b2.h.getXNodeVal(c,'level');
            o.key = i2b2.h.getXNodeVal(c,'key');
            if (cl_options != undefined && cl_options.ont_short_tooltip) {
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
            if (cl_options != undefined && cl_options.ont_show_concept_code && o.basecode != undefined) {
                o.tooltip  += "(" + o.basecode + ")";
            }
            // append the data node
            if (objectType !== undefined) {
                return i2b2.sdx.Master.EncapsulateData(objectType, o);
            } else {
                return i2b2.sdx.Master.EncapsulateData("CONCPT", o);
            }
}

i2b2.sdx.TypeControllers.CONCPT.LoadModifiers = function(node, onCompleteCallback, modifier) {
    var scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = node;
    scopedCallback.callback = function(results){
        var cl_node = node;
        var cl_onCompleteCB = onCompleteCallback;
        var cl_options = options;
        // THIS function is used to process the AJAX results of the getChild call
        //		results data object contains the following attributes:
        //			refXML: xmlDomObject <--- for data processing
        //			msgRequest: xml (string)
        //			msgResponse: xml (string)
        //			error: boolean
        //			errorStatus: string [only with error=true]
        //			errorMsg: string [only with error=true]

        // handle any errors in the message
        if (results.error) {
            // process the specific error
            cl_onCompleteCB();
            i2b2.sdx.TypeControllers.CONCPT.LoadConcepts(node, onCompleteCallback, false);
            return false;
        }
        var c = results.refXML.getElementsByTagName('modifier');
        for(var i=0; i<1*c.length; i++) {
            var sdxDataNode = i2b2.sdx.TypeControllers.CONCPT.MakeObject(c[i], modifier, cl_options, cl_node.i2b2);
            if (modifier) {
                var renderOptions = {
                    title: i2b2.h.getXNodeVal(c[i],'name'),
                    icon: {
                        root: "sdx_ONT_MODIFIER_root.gif",
                        rootExp: "sdx_ONT_MODIFIER_root-exp.gif",
                        branch: "sdx_ONT_MODIFIER_branch.gif",
                        branchExp: "sdx_ONT_MODIFIER_branch-exp.gif",
                        leaf: "sdx_ONT_MODIFIER_leaf.gif"
                    }
                };
            } else {
                var renderOptions = {
                    title: i2b2.h.getXNodeVal(c[i],'name'),
                    icon: {
                        root: "sdx_ONT_CONCPT_root.gif",
                        rootExp: "sdx_ONT_CONCPT_root-exp.gif",
                        branch: "sdx_ONT_CONCPT_branch.gif",
                        branchExp: "sdx_ONT_CONCPT_branch-exp.gif",
                        leaf: "sdx_ONT_CONCPT_leaf.gif"
                    }
                };
            }

            sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
            sdxDataNode.renderData.idDOM = "ONT_TV-" + i2b2.GUID();

        }
        // handle the YUI treeview
        //mm 10-7 cl_onCompleteCB();
        if ((node.i2b2.origData.hasChildren != "DA") && (node.i2b2.origData.hasChildren != "OAE") &&
        (node.i2b2.origData.hasChildren != "DAE") && (node.i2b2.origData.hasChildren != "OA") ){
            i2b2.sdx.TypeControllers.CONCPT.LoadConcepts(node, onCompleteCallback, false);
        } else {
            cl_onCompleteCB();
        }
    }
    // TODO: Implement param routing from node's container
    var options = {};
    /*
     switch (node.tree.id) {
     case "ontNavResults":
     var t = i2b2.ONT.view.nav.params;
     break;
     case "ontSearchModifiersResults":
     var t = i2b2.ONT.view.find.params;
     break;
     case "ontSearchCodesResults":
     var t = i2b2.ONT.view.find.params;
     break;
     case "ontSearchNamesResults":
     //		case "ontSearchCodesResults", "ontSearchNamesResults", "ontSearchModifiersResults":
     var t = i2b2.ONT.view.find.params;
     break;
     default:
     var t = i2b2.ONT.params;
     }
     */
    var t = i2b2.ONT.params;
    if (t !== undefined) {
        if (t.hiddens !== undefined) options.ont_hidden_records = t.hiddens;
        if (t.max !== undefined) options.ont_max_records = "max='"+t.max+"' ";
        if (t.synonyms !== undefined) options.ont_synonym_records = t.synonyms;
        if (t.patientCount !== undefined) options.ont_patient_count = t.patientCount;
        if (t.shortTooltip !== undefined) options.ont_short_tooltip = t.shortTooltip;
        if (t.showConceptCode !== undefined) options.ont_show_concept_code = t.showConceptCode;
    }
    options.concept_key_value = node.i2b2.sdxInfo.sdxKeyValue;;

    switch (node.i2b2.origData.hasChildren) {
        case "DA":
        case "DAE":
        case "OA":
        case "OAE":
            options.modifier_key_value = node.i2b2.origData.key;
            options.modifier_applied_path = node.i2b2.origData.applied_path;

            var realdata = node.i2b2.origData;
            while ((realdata.hasChildren != "FA") &&
            (realdata.hasChildren != "CA") &&
            (realdata.hasChildren != "FAE") &&
            (realdata.hasChildren != "CAE")) {
                realdata  = realdata.parent;
            }
            options.modifier_applied_concept = realdata.key;//node.data.i2b2_SDX.origData.parent.key;
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
//	!!!! THE i2b2.sdx.Master.setHandlerCustom FUNCTION
// *********************************************************************************
i2b2.sdx.TypeControllers.CONCPT.DropHandler = function(sdxData) {
    alert('[Concept DROPPED] You need to create your own custom drop event handler.');
};
// ==========================================================================
i2b2.sdx.TypeControllers.CONCPT.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.xmlOrig;
    delete i2b2Data.origData.parent;
    delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};

// *********************************************************************************
//	DEPRECATED FUNCTIONS
// *********************************************************************************
/*
i2b2.sdx.TypeControllers.CONCPT.AppendTreeNode = function() { console.error("[i2b2.sdx.TypeControllers.CONCPT.AppendTreeNode] is deprecated!"); }
i2b2.sdx.TypeControllers.CONCPT.SaveToDataModel = function() { console.error("[i2b2.sdx.TypeControllers.CONCPT.SaveToDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.CONCPT.LoadFromDataModel = function() { console.error("[i2b2.sdx.TypeControllers.CONCPT.LoadFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.CONCPT.ClearAllFromDataModel= function() { console.error("[i2b2.sdx.TypeControllers.CONCPT.ClearAllFromDataModel] is deprecated!"); }
i2b2.sdx.TypeControllers.CONCPT.onHoverOver = function() { console.error("[i2b2.sdx.TypeControllers.CONCPT.onHoverOver] is deprecated!"); }
i2b2.sdx.TypeControllers.CONCPT.onHoverOut = function() { console.error("[i2b2.sdx.TypeControllers.CONCPT.onHoverOut] is deprecated!"); }
i2b2.sdx.TypeControllers.CONCPT.AttachDrag2Data = function() { console.error("[i2b2.sdx.TypeControllers.CONCPT.AttachDrag2Data] is deprecated!"); }
*/
console.timeEnd('execute time');
console.groupEnd();
