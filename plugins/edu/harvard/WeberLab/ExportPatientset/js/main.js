"use strict";

i2b2.Exporter = {};

i2b2.Exporter.render = function() {
    if (i2b2.model.Patientset !== undefined) {
        let psDiv = document.getElementById("PatientSet");
        psDiv.innerHTML = i2b2.model.Patientset.renderData.title;
        psDiv.setAttribute("title", psDiv.innerHTML);
        document.getElementById("download").classList.remove("disabled");
    } else {
        document.getElementById("download").classList.add("disabled");
    }
};

i2b2.Exporter.dropEvent = function(sdxData) {
    // save new drop attribute, clear any stale results
    i2b2.model.Patientset = sdxData;
    i2b2.model.result_instance_id = undefined;
    i2b2.state.save();

    // clear stale download link
    let link = document.getElementById("DownloaderLink");
    if (link !== null) link.remove();

    i2b2.Exporter.render();
};


i2b2.Exporter.getResults = function(){
    // this function should only be called when "i2b2.model.result_instance_id" has been set
    if (i2b2.model.result_instance_id === undefined) {
        console.error('ABORT: model.result_instance_id has not been set!');
        return false;
    }
    // now get the results
    i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId({qr_key_value: i2b2.model.result_instance_id}).then((finalData) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(finalData, "application/xml");
        const nsResolver = document.createNSResolver(doc.ownerDocument === null ? doc.documentElement : doc.ownerDocument.documentElement);
        const resultJSON = doc.evaluate(
            'descendant::xml_value/text()/..',
            doc, nsResolver, XPathResult.STRING_TYPE, null
        ).stringValue;

        // parse the JSON from the XML message
        let records = JSON.parse(resultJSON);
        // get attribute list (CSV columns)
        let attrlist = {};
        records.forEach((rec) => { Object.keys(rec).forEach((attrname) => {attrlist[attrname] = 1 })});
        const columns = Object.keys(attrlist);

        let outputLines = [];
        let currentLine = [];
        // create header
        columns.forEach((column) => { currentLine.push('"' + column + '"'); });
        outputLines.push(currentLine.join(','));
        // create CSV lines
        records.forEach((line) => {
            currentLine = [];
            columns.forEach((column) => { currentLine.push( line[column] !== undefined ? '"' + line[column] + '"' : '""'); });
            outputLines.push(currentLine.join(','));
        });
        const finalOutput = outputLines.join('\n');

        // create/reuse the download anchor element in the DOM
        let downloadLink = document.getElementById("DownloaderLink");
        if (downloadLink === null) {
            downloadLink = document.createElement("a");
            downloadLink.id = "DownloaderLink";
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);

        }
        // send the data for download
        downloadLink.setAttribute("href", "data:text/csv," + finalOutput);
        downloadLink.setAttribute("download", "PatientSet-" + i2b2.model.Patientset.sdxInfo.sdxKeyValue + "_(" + i2b2.model.result_instance_id + ").csv");
        downloadLink.click();
    });
};

i2b2.Exporter.startDownload = function() {
    // check to see if the link exists, download from that if present
    let link = document.getElementById("DownloaderLink");
    if (link !== null) {
        // trigger the download from the existing link
        link.click();
        return true;
    }

    // check to see if we have already run an export,
    // if so use its results instance ID and retreve results
    if (i2b2.model.result_instance_id !== undefined) {
        i2b2.Exporter.getResults();
        return true;
    }

    // we must issue a request to export data first...
    let request = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <ns6:request xmlns:ns4="http://www.i2b2.org/xsd/cell/crc/psm/1.1/"
    xmlns:ns7="http://www.i2b2.org/xsd/cell/crc/psm/querydefinition/1.1/"
    xmlns:ns3="http://www.i2b2.org/xsd/cell/crc/pdo/1.1/"
    xmlns:ns5="http://www.i2b2.org/xsd/hive/plugin/"
    xmlns:ns2="http://www.i2b2.org/xsd/hive/pdo/1.1/"
    xmlns:ns6="http://www.i2b2.org/xsd/hive/msg/1.1/"
    xmlns:ns8="http://www.i2b2.org/xsd/cell/crc/psm/analysisdefinition/1.1/">
    <message_header>
        {{{proxy_info}}}
        <sending_application><application_name>i2b2_QueryTool</application_name><application_version>1.6</application_version></sending_application>
        <sending_facility><facility_name>PHS</facility_name></sending_facility>
        <receiving_application><application_name>i2b2_DataRepositoryCell</application_name><application_version>1.6</application_version></receiving_application>
        <receiving_facility><facility_name>PHS</facility_name></receiving_facility>
        <message_type><message_code>Q04</message_code><event_type>EQQ</event_type></message_type>
        <security>
            <domain>{{{sec_domain}}}</domain>
            <username>{{{sec_user}}}</username>
            {{{sec_pass_node}}}
        </security>
        <message_control_id><message_num>{{{header_msg_id}}}</message_num><instance_num>0</instance_num></message_control_id>
        <processing_id><processing_id>P</processing_id><processing_mode>I</processing_mode></processing_id>
        <accept_acknowledgement_type>messageId</accept_acknowledgement_type>
        <project_id>{{{sec_project}}}</project_id>
    </message_header>
    <request_header><result_waittime_ms>{{{result_wait_time}}}000</result_waittime_ms></request_header>
    <message_body>
        <ns4:psmheader>
            <user login="{{{sec_user}}}">{{{sec_user}}}</user>
            <patient_set_limit>0</patient_set_limit><estimated_time>0</estimated_time>
            <request_type>CRC_QRY_runQueryInstance_fromAnalysisDefinition</request_type>
        </ns4:psmheader>
        <ns4:request xsi:type="ns4:analysis_definition_requestType" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <analysis_definition><analysis_plugin_name>Export_Data</analysis_plugin_name><version>1.0</version>
                <crc_analysis_input_param name="ONT request"><param type="int" column="resultInstanceID1">{{{PatientSetId}}}</param></crc_analysis_input_param>
                <crc_analysis_result_list><result_output full_name="XML" priority_index="1" name="XML"/></crc_analysis_result_list>
            </analysis_definition>
        </ns4:request>
    </message_body>
    </ns6:request>`;

    request = request.replace(new RegExp("{{{PatientSetId}}}", 'g'), i2b2.model.Patientset.sdxInfo.sdxKeyValue);

    i2b2.ajax.CRC._RawSent('request', request).then((data)=> {
        // load the string into XML document and use XPath to extract the result instance ID
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, "application/xml");
        const nsResolver = document.createNSResolver(doc.ownerDocument === null ? doc.documentElement : doc.ownerDocument.documentElement);

        // save the result instance ID to the model
        i2b2.model.result_instance_id = doc.evaluate(
            'descendant::query_result_instance/result_instance_id/text()/..',
            doc, nsResolver, XPathResult.STRING_TYPE, null
        ).stringValue;
        i2b2.state.save();

        // now get the results and save to a file...
        i2b2.Exporter.getResults();
    })
};


// ============================================================================== //
window.addEventListener("I2B2_SDX_READY", (event) => {
    // attach drag drop functionality
    i2b2.sdx.AttachType("PatientSet", "PRS");
    i2b2.sdx.setHandlerCustom("PatientSet", "PRS", "DropHandler", i2b2.Exporter.dropEvent);
});
// ============================================================================== //
window.addEventListener("I2B2_READY", ()=> {
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    i2b2.Exporter.render();
});
// ============================================================================== //
