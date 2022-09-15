/**
 * @projectDescription	The SDX controller library for the PatientRecordSet data-type.
 * @namespace	i2b2.sdx.TypeControllers.ENS
 * @inherits 	i2b2.sdx.TypeControllers
 * @author		Mike Mendis
 * @version 	1.6
 * @see 		i2b2.sdx
 * ----------------------------------------------------------------------------------------
 */
console.group('Load & Execute component file: CRC > SDX > Encounter Record Set');
console.time('execute time');


i2b2.sdx.TypeControllers.ENS = {};
i2b2.sdx.TypeControllers.ENS.model = {};


// ==========================================================================
i2b2.sdx.TypeControllers.ENS.getEncapsulateInfo = function() {
    // this function returns the encapsulation head information
    return {sdxType: 'ENS', sdxKeyName: 'result_instance_id', sdxControlCell:'CRC', sdxDisplayNameKey: 'title'};
};


// ==========================================================================
i2b2.sdx.TypeControllers.ENS.RenderData = function(sdxData, options) {
    // function returns following data that is used for rendering (at a minimum)
    // === title
    // === iconImg (url)
    // === cssClassMain
    // === cssClassMinor
    // === moreDescriptMain
    // === moreDescriptMinor
    // === tvNodeState
    if (options === undefined) { options = {}; }
    // default ENS icons
    if (!$.isArray(options.icon)) {
        let t = 'sdx_CRC_PRS.jpg';
        if (typeof options.icon === 'string') t = options.icon;
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
        cssClassMain: "sdxStyleCRC-PRS",
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


/**
 * Get the child records for the given PatientRecordSet.
 * @param {Object} sdxParentNode	The parent node we want to find the children of.
 * @param {ScopedCallback} onCompleteCallback A scoped-callback function to be executed using the results array.
 * @return {Boolean} Returns true to the calling function.
 * @return {Array} Returns an array of PatientRecord data represented as SDX Objects (without render data) to the callback function passed.
 * @memberOf i2b2.sdx.TypeControllers.QI
 * @method
 * @version 2.0
 * @alias i2b2.sdx.Master.getChildRecords
 */
// ==========================================================================
i2b2.sdx.TypeControllers.ENS.getChildRecords = function(sdxParentNode, onCompleteCallback, options) {
    console.warn('i2b2.sdx.TypeControllers.ENS.getChildRecords() called');
    // TODO: Make sure this function works
    let scopedCallback = new i2b2_scopedCallback();
    scopedCallback.scope = sdxParentNode;
    scopedCallback.callback = function(results) {
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
        let ps = results.refXML.getElementsByTagName('event');
        let dm = i2b2.CRC.model.QueryMasters;
        for(let i1=0; i1<ps.length; i1++) {
            let o = {};
            o.xmlOrig = ps[i1].outerHTML;
            o.patient_id = i2b2.h.getXNodeVal(ps[i1],'patient_id');
            o.event_id = i2b2.h.getXNodeVal(ps[i1],'event_id');
            //o.vital_status = i2b2.h.XPath(ps[i1],'param[@name="vital_status_cd"]/text()')[0].nodeValue;
            //o.age = i2b2.h.XPath(ps[i1],'param[@name="age_in_years_num"]/text()')[0].nodeValue;
            //o.sex = i2b2.h.XPath(ps[i1],'param[@name="sex_cd"]/text()')[0].nodeValue;
            //o.race = i2b2.h.XPath(ps[i1],'param[@name="race_cd"]/text()')[0].nodeValue;
            //o.title = o.patient_id+" ["+o.age+" y/o "+ o.sex+" "+o.race+"]";
            let sdxDataNode = i2b2.sdx.Master.EncapsulateData('PR',o);
            // append the data node to our returned results
            retChildren.push(sdxDataNode);
        }
        cl_node.children.loaded = true;
        // TODO: broadcast a data update event of the CRC data model
        retMsg.results = retChildren;
        if (i2b2.h.getObjectClass(onCompleteCallback)==='i2b2_scopedCallback') {
            onCompleteCallback.callback.call(onCompleteCallback.scope, retMsg);
        } else {
            onCompleteCallback(retMsg);
        }
    };


    let msg_filter = '<input_list>\n' +
    '	<event_list max="1000000" min="0">\n'+
    '		<patient_event_coll_id>'+sdxParentNode.sdxInfo.sdxKeyValue+'</patient_event_coll_id>\n'+
    '	</event_list>\n'+
    '</input_list>\n'+
    '<filter_list/>\n'+
    '<output_option>\n'+
    '	<event_set select="using_input_list" onlykeys="true"/>\n'+
    '</output_option>\n';

    // AJAX CALL
    options  = {
        patient_limit: 0,
        PDO_Request: msg_filter
    };
    i2b2.CRC.ajax.getPDO_fromInputList("CRC:SDX:PatientRecordSet", options, scopedCallback);
};


// ==========================================================================
i2b2.sdx.TypeControllers.ENS.DropHandler = function(sdxData) {
    alert('[PatientRecordSet DROPPED] You need to create your own custom drop event handler.');
};


// ==========================================================================
i2b2.sdx.TypeControllers.ENS.dragStartHandler = function(i2b2Data) {
    delete i2b2Data.origData.parent;
    if (i2b2Data.renderData !== undefined) delete i2b2Data.renderData.idDOM;
    return i2b2Data;
};


// ==========================================================================
console.timeEnd('execute time');
console.groupEnd();