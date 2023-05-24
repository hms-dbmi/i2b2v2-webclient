/**
 * @projectDescription	Event controller for general ONT functionality.
 * @inherits 	i2b2.ONT.ctrlr
 * @namespace	i2b2.ONT.ctrlr.gen
 * @version 	2.0
 **/

i2b2.ONT.ctrlr.gen = {};
// signal that is fired when the ONT cell's data model is updated
// ================================================================================================== //
i2b2.ONT.ctrlr.gen.events = {};
i2b2.ONT.ctrlr.gen.events.onDataUpdate = $.Callbacks();


//================================================================================================== //
// TODO: should this be in the view controller?
i2b2.ONT.ctrlr.gen.events.onDataUpdate.add((function(updateInfo) {
    if (updateInfo.DataLocation === "i2b2.ONT.model.Categories") {
        this.view.nav.PopulateCategories();
    }
}).bind(i2b2.ONT));


//================================================================================================== //
i2b2.ONT.ctrlr.gen.generateNodeData = function(xmlData, sdxData) {

    let data = {};
    if (xmlData) {
        data.xmlOrig = xmlData.outerHTML;
        data.name = i2b2.h.getXNodeVal(xmlData, 'name');
        data.hasChildren = i2b2.h.getXNodeVal(xmlData, 'visualattributes').substring(0, 2);
        data.level = i2b2.h.getXNodeVal(xmlData, 'level');
        data.key = i2b2.h.getXNodeVal(xmlData, 'key');
        data.tooltip = i2b2.h.getXNodeVal(xmlData, 'tooltip');
        data.icd9 = '';
        data.synonym_cd = i2b2.h.getXNodeVal(xmlData,'synonym_cd');
        data.table_name = i2b2.h.getXNodeVal(xmlData, 'tablename');
        data.column_name = i2b2.h.getXNodeVal(xmlData, 'columnname');
        data.operator = i2b2.h.getXNodeVal(xmlData, 'operator');
        data.dim_code = i2b2.h.getXNodeVal(xmlData, 'dimcode');
        data.basecode = i2b2.h.getXNodeVal(xmlData, 'basecode');
        data.total_num = i2b2.h.getXNodeVal(xmlData, 'totalnum');

        let protected = i2b2.h.getXNodeVal(xmlData, 'protected_access');
        if (protected === undefined || String(protected).toUpperCase() === "N") {
            data.protected = false;
        } else {
            data.protected = true;
            data.protected_permissions = i2b2.h.getXNodeVal(xmlData, 'ontology_protection');
        }

    } else {
        data = sdxData;
    }

    // generate treeview info
    let sdxDataNode = i2b2.sdx.Master.EncapsulateData('CONCPT', data);
    if (!sdxDataNode) {
        console.error("SDX could not encapsulate CONCPT data!");
        return false;
    }

    let renderOptions = {
        title: data.name,
        icon: i2b2.ONT.model.icons.term
    };
    sdxDataNode.renderData = i2b2.sdx.Master.RenderData(sdxDataNode, renderOptions);
    sdxDataNode.renderData.idDOM = "ONT_TV-" + i2b2.GUID();
    let tvDataNode = {
        title: sdxDataNode.renderData.moreDescriptMinor,
        text: sdxDataNode.renderData.title,
        icon: sdxDataNode.renderData.cssClassMain,
        key: sdxDataNode.sdxInfo.sdxKeyValue,
        iconImg: sdxDataNode.renderData.iconImg,
        color: sdxDataNode.renderData.color,
        iconImgExp: sdxDataNode.renderData.iconImgExp,
        i2b2: sdxDataNode
    };
    tvDataNode.state = sdxDataNode.renderData.tvNodeState;
    if (sdxDataNode.renderData.cssClassMinor !== undefined) {
        tvDataNode.icon += " " + sdxDataNode.renderData.cssClassMinor;
    }
    // add number counts
    let enablePatientCounts = i2b2.ONT.view.nav.params.patientCounts;
    if (enablePatientCounts !== false && sdxDataNode.origData.total_num !== undefined){
        tvDataNode.text += ' - ';
        tvDataNode.tags = [];
        let totalnum = parseInt(sdxDataNode.origData.total_num, 10);
        //parse as integer or leave totalnum as is
        if( !isNaN(totalnum)){
            tvDataNode.tags.push(totalnum.toLocaleString());
        }
        else{
            tvDataNode.tags.push(node.i2b2.origData.total_num);
        }
    }
    return {sdx: sdxDataNode, tv: tvDataNode};
};

// ================================================================================================== //
i2b2.ONT.ctrlr.gen.loadCategories = function() {
    i2b2.ONT.model.Categories = undefined;
    // create a scoped callback message to pass the XML to our function defined above
    let scopeCB = new i2b2_scopedCallback(function(i2b2CellMsg) {
        i2b2.ONT.model.Categories = [];
        if (!i2b2CellMsg.error) {
            let c = i2b2CellMsg.refXML.getElementsByTagName('concept');
            for (let i=0; i<1*c.length; i++) {
                let {sdx, tv} = i2b2.ONT.ctrlr.gen.generateNodeData(c[i]);
                // save the node to the ONT data model
                i2b2.ONT.model.Categories.push(sdx.origData);
            }
        } else {
            alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
        }
        // Broadcast an update event letting interested view controllers know that the Categories data model has been updated
        let DataUpdateSignal = {
            DataLocation: "i2b2.ONT.model.Categories",
            DataRef: i2b2.ONT.model.Categories
        };
        console.info("EVENT FIRE i2b2.ONT.ctrlr.gen.events.onDataUpdate; Msg:",DataUpdateSignal);
        i2b2.ONT.ctrlr.gen.events.onDataUpdate.fire(DataUpdateSignal);
    },i2b2.ONT.model.Categories);
    // fire the AJAX call
    let options = {};
    options.ont_hidden_records = i2b2.ONT.view.nav.params.hiddens;
    options.ont_synonym_records = i2b2.ONT.view.nav.params.synonyms;
    i2b2.ONT.ajax.GetCategories("ONT:generalView", options, scopeCB);
};

// ================================================================================================== //
i2b2.ONT.ctrlr.gen.loadSchemes = function() {
    i2b2.ONT.model.Schemes = undefined;
    // create a scoped callback message to pass the XML to our function defined above
    let scopeCB = new i2b2_scopedCallback(function(i2b2CellMsg) {
        i2b2.ONT.model.Schemes = [];
        if (!i2b2CellMsg.error) {
            let c = i2b2CellMsg.refXML.getElementsByTagName('concept');
            for (let i=0; i<1*c.length; i++) {
                let o = {};
                o.name = i2b2.h.getXNodeVal(c[i],'name');
                o.key = i2b2.h.getXNodeVal(c[i],'key');
                // save the node to the ONT data model
                i2b2.ONT.model.Schemes.push(o);
            }
        } else {
            alert("An error has occurred in the Cell's AJAX library.\n Press F12 for more information");
        }
        // Broadcast an update event letting interested view controllers know that the Categories data model has been updated
        let DataUpdateSignal = {
            DataLocation: "i2b2.ONT.model.Schemes",
            DataRef: i2b2.ONT.model.Schemes
        };
        console.info("EVENT FIRED i2b2.ONT.ctrlr.gen.events.onDataUpdate");
        i2b2.ONT.ctrlr.gen.events.onDataUpdate.fire(DataUpdateSignal);
    },i2b2.ONT.model.Schemes);
    // fire the AJAX call
    i2b2.ONT.ajax.GetSchemes("ONT:generalView", {}, scopeCB);
};

// ================================================================================================== //
i2b2.ONT.model.cacheModifiers = {};
i2b2.ONT.ctrlr.gen.getModifierDetails = function(sdxConcept) {
    let cacheRecord = i2b2.ONT.model.cacheModifiers[sdxConcept.sdxInfo.sdxKeyValue];
    if (cacheRecord) {
        sdxConcept.origData.xmlOrig = cacheRecord.xml;
        sdxConcept.origData.hasMetadata = cacheRecord.hasMetadata;
    } else {
        i2b2.ONT.ajax.GetModifierInfo("CRC:QueryTool", {
            modifier_applied_path:sdxConcept.origData.applied_path,
            modifier_key_value:sdxConcept.origData.key,
            ont_max_records: 'max="1"',
            ont_synonym_records: true,
            ont_hidden_records: true
        }, (response) => {
            let c = i2b2.h.XPath(response.refXML, 'descendant::modifier');
            if (c.length > 0) {
                cacheRecord = {};
                cacheRecord.xml = c[0].outerHTML;
                const valueMetaDataArr = i2b2.h.XPath(cacheRecord.xml, "metadataxml/ValueMetadata[string-length(Version)>0]");
                if (valueMetaDataArr.length > 0) {
                    cacheRecord.hasMetadata = true;
                } else {
                    cacheRecord.hasMetadata = false;
                }
                sdxConcept.origData.xmlOrig = cacheRecord.xml;
                sdxConcept.origData.hasMetadata = cacheRecord.hasMetadata;
                i2b2.ONT.model.cacheModifiers[sdxConcept.sdxInfo.sdxKeyValue] = cacheRecord;
            }
        });
    }
}






// ================================================================================================== //

i2b2.ONT.ctrlr.gen.events.onDataUpdate.add((function(updateInfo) {
    // initialize the search bar dropdowns when the data model is fully populated
    if (i2b2.ONT.model.Categories !== undefined && i2b2.ONT.model.Schemes !== undefined) {
        i2b2.ONT.view.search.initSearchOptions();
    }
}).bind(i2b2.ONT));
