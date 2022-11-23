/**
 * @projectDescription	The SDX controller library for the QueryMaster data-type.
 * @namespace	i2b2.sdx.TypeControllers.QM
 * @inherits 	i2b2.sdx.TypeControllers
 * @version 	2.0
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 * updated 9-15-08: RC4 launch [Nick Benik] 
 */

i2b2.sdx.TypeControllers.QM = {};
i2b2.sdx.TypeControllers.QM.model = {};


// ==========================================================================
/** 
 * Get the sdxInfo data template for all QueryMaster.
 * @memberOf i2b2.sdx.TypeControllers.QM
 * @method
 * @return {Object} Returns a data object containing sdxType, sdxKeyName, sdxControlCell info for QueryMaster-type objects.
 * @alias i2b2.sdx.Master.EncapsulateData
 */
i2b2.sdx.TypeControllers.QM.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'QM', sdxKeyName: 'id', sdxControlCell:'CRC', sdxDisplayNameKey:'name'};
};


// ==========================================================================
i2b2.sdx.TypeControllers.QM.RenderData = function(sdxData, options) {
    // function returns following data that is used for rendering (at a minimum)
    // === title
    // === iconImg (url)
    // === cssClassMain
    // === cssClassMinor
    // === moreDescriptMain
    // === moreDescriptMinor
    // === tvNodeState
    let t;
    if (options === undefined) { options = {}; }
    // default QM icons
    if (!$.isPlainObject(options.icon)) {
        if (typeof options.icon === 'string') {
            t = options.icon;
        } else {
            t = 'sdx_CRC_QM.gif';
        }
        options.icon = {
            root: t,
            rootExp: t,
            branch: t,
            branchExp: t,
            leaf: t
        };
    }

    let nodeInfo = {
        title: undefined,
        iconImg: undefined,
        iconImgExp: undefined,
        cssClassMain: "sdxStyleCRC-QM",
        cssClassMinor: undefined,
        moreDescriptMain: undefined,
        moreDescriptMinor: undefined,
        annotation: undefined,
        tvNodeState: {}
    };

    if (options.cssClass !== undefined) nodeInfo.cssClassMain = options.cssClass;
    if (options.title !== undefined) {
        nodeInfo.title = options.title;
    } else  {
        nodeInfo.title = sdxData.sdxInfo.sdxDisplayName;
    }


    if (options.showchildren === false) {
        // cannot expand node
        nodeInfo.tvNodeState.loaded = true;
        nodeInfo.tvNodeState.expanded = true;
    }

    let icon = 'branch';
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
    if (options.icon[icon] !== undefined) {
        nodeInfo.iconImg = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon[icon];
    }
    if (options.icon[icon+'Exp'] !== undefined) {
        nodeInfo.iconImgExp = i2b2.hive.cfg.urlFramework + 'cells/CRC/assets/'+ options.icon[icon+'Exp'];
    }
    // in cases of one set icon, copy valid icon to the missing icon
    if ((nodeInfo.iconImg === undefined) && (nodeInfo.iconImgExp !== undefined)) {	nodeInfo.iconImg = nodeInfo.iconImgExp; }
    if ((nodeInfo.iconImg !== undefined) && (nodeInfo.iconImgExp === undefined)) {	nodeInfo.iconImgExp = nodeInfo.iconImg; }

    // provide tooltip information if given
    if (typeof options.tooltip === 'string') nodeInfo.moreDescriptMinor = options.tooltip;

    return nodeInfo;
};


// ==========================================================================
/**
 * Get the child QueryInstance records for the given QueryMaster.
 * @param {Object} sdxParentNode	The parent node we want to find the children of.
 * @param {ScopedCallback} onCompleteCallback A scoped-callback function to be executed using the results array.
 * @return {Boolean} Returns true to the calling function.
 * @return {Array} Returns an array of QueryInstance data represented as SDX Objects (without render data) to the callback function passed.
 * @memberOf i2b2.sdx.TypeControllers.QM
 * @method
 * @alias i2b2.sdx.Master.getChildRecords
 */
i2b2.sdx.TypeControllers.QM.getChildRecords = function(sdxParentNode, onCompleteCallback) {
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = sdxParentNode;
    scopedCallback.callback = function(results) {
        let cl_node = sdxParentNode;
        let cl_onCompleteCB = onCompleteCallback;
        // THIS function is used to process the AJAX results of the getChild call
        //		results data object contains the following attributes:
        //			refXML: xmlDomObject <--- for data processing
        //			msgRequest: xml (string)
        //			msgResponse: xml (string)
        //			error: boolean
        //			errorStatus: string [only with error=true]
        //			errorMsg: string [only with error=true]

        let retMsg = {
            error: results.error,
            msgRequest: results.msgRequest,
            msgResponse: results.msgResponse,
            msgUrl: results.msgUrl,
            results: null
        };
        let retChildren = [];

        // extract records from XML msg
        let qi = results.refXML.getElementsByTagName('query_instance');
        for(let i1=0; i1<1*qi.length; i1++) {
            let o = {};
            o.xmlOrig = qi[i1].outerHTML;
            o.query_master_id = i2b2.h.getXNodeVal(qi[i1],'query_master_id');
            o.query_instance_id = i2b2.h.getXNodeVal(qi[i1],'query_instance_id');
            o.id = o.query_instance_id;
            o.batch_mode = i2b2.h.getXNodeVal(qi[i1],'batch_mode');
            o.start_date = i2b2.h.getXNodeVal(qi[i1],'start_date');
            o.end_date = i2b2.h.getXNodeVal(qi[i1],'end_date');
            o.query_status_type = i2b2.h.getXNodeVal(qi[i1],'query_status_type');
            o.title = "Results of " + sdxParentNode.origData.name;
            if(typeof o.batch_mode === "undefined"){ // CRC is below version 1.7.07
                o.title += " - " + i2b2.h.getXNodeVal(qi[i1],'description');
            } else { // CRC is version 1.7.08 or newer
                o.title += " - " + o.batch_mode;
            }
            let sdxDataNode = i2b2.sdx.Master.EncapsulateData('QI',o);
            sdxDataNode.origData.QM_title = sdxParentNode.origData.name;
            // append the data node to our returned results
            retChildren.push(sdxDataNode);
        }
        retMsg.results = retChildren;
        retMsg.parentNode = cl_node;
        if (cl_onCompleteCB instanceof i2b2_scopedCallback) {
            cl_onCompleteCB.callback.call(cl_onCompleteCB.scope, retMsg);
        } else {
            cl_onCompleteCB(retMsg);
        }
    };
    i2b2.CRC.ajax.getQueryInstanceList_fromQueryMasterId("CRC:SDX:QueryMaster", {qm_key_value: sdxParentNode.sdxInfo.sdxKeyValue}, scopedCallback);
};


// ==========================================================================
i2b2.sdx.TypeControllers.QM.DropHandler = function(sdxData) {
    alert('[QueryMaster DROPPED] You need to create your own custom drop event handler.');
};


// ==========================================================================
i2b2.sdx.TypeControllers.QM.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.parent;
    if (i2b2Data.renderData !== undefined) delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};
