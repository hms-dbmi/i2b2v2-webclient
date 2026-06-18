export default class DataRequestSuper {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
            const self = this;

            (async function() {
                // retrieve the component frame template
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "DataRequestSuper/DataRequestSuper.html");
                if (!response.ok) {
                    console.error(`Failed to retrieve DataRequest component template file: ${response.status}`);
                    this.dispTemplate = "";
                } else {
                    const templateText = await response.text();
                    this.dispTemplate = Handlebars.compile(templateText);
                    self.update();
                }
            }).call(this);

        } catch(e) {
            console.error("Error in QueryStatus:DataRequest.constructor()");
        }
    }


    destroy() {
        delete this.config.displayEl;
        delete this.config;
        delete this.record;
        delete this.data;
    }


    update(data) {
        try {
            if (typeof data !== 'undefined') {
                // bail out if the results are an error
                const status = i2b2.h.XPath(data,"//query_result_instance/query_status_type/name");
                if (status.length > 0 && i2b2.CRC.QueryStatus.hideVisualizationsOn.includes(status[0].firstChild.nodeValue)) return false;

                let resultXML = i2b2.h.XPath(data, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // get the record code
                    const QriCode = i2b2.h.XPath(resultXML, "//body/*")[0].getAttribute("name");

                    // parse the data and put the results into the new data slot
                    const parsedData = parseData(resultXML);
                    const QriName = i2b2.h.XPath(data, "//query_result_type/description/text()")[0].nodeValue;

                    // save the data into our model
                    if (typeof this.data !== "object" || this.data === null) this.data = {};
                    this.data[QriCode] = {
                        name: QriName,
                        code: QriCode,
                        rawData: resultXML,
                        parsedData: parsedData
                    }
                } else {
                    return false;
                }
            }

            if (typeof this.dispTemplate !== 'undefined' && this.data !== null) {
                // TODO: Change this to deal with all the data, not just one record

                // BUG FIX: find a record that has the "extra" data to display (like email)
                let FirstRecord;
                let populatedRecords = Object.values(this.data).filter((v) => v.parsedData?.requestInfo.email);
                if (populatedRecords.length > 0) {
                    FirstRecord = populatedRecords[0];
                } else {
                    FirstRecord = Object.values(this.data)[0];
                }

                let templateData = {
                    requesterEmail: FirstRecord.parsedData.requestInfo.email,
                    requestMsg: FirstRecord.parsedData.requestInfo.emailMsg,
                    requestStatus: []
                }

                const func_formatDate = function(value) {
                    let date = value.substring(0,8);
                    return date.substring(0,4) + "/" + date.substring(4,6) + "/" + date.substring(6,8);
                }

                Object.values(this.data).forEach((rec) => {
                    let recToSave = {
                        code: rec.code,
                        name: rec.name
                    };

                    const submitted = rec.parsedData.resultTable.filter((t) => t.name === "SUBMITTED");
                    if (submitted.length) recToSave.submitted = func_formatDate(submitted[0].value);

                    templateData.requestStatus.push(recToSave);
                });

                console.dir(templateData);

                // update the display
                $(this.config.displayEl).empty();
                $(this.dispTemplate(templateData)).appendTo(this.config.displayEl);
                // make sure we are visible
                this.show();
            }
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:DataRequest.update()", e);
            return false;
        }
    }


    redraw(width) {
        try {
            // update the viewport element to the height of the visualization
            if (this.isVisible) this.config.displayEl.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:DataRequest.redraw()");
        }
    }


    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        try {
            this.isVisible = true;
            this.config.displayEl.style.display = 'block';
            this.config.displayEl.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:DataRequest.show()");
        }
    }


    hide() {
        try {
            this.isVisible = false;
            this.config.displayEl.style.display = 'none';
            this.config.displayEl.style.height = "0px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:DataRequest.hide()");
        }
    }
}



let parseData = function(xmlData) {
    let dataExport = {
        requestInfo: {},
        resultTable: []
    };

    // process "normal" data
    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    // short circuit exit because there is no data
    if (params.length === 0) return;
    for (let i2 = 0; i2 < params.length; i2++) {
        let entryRecord = {}
        entryRecord.name = $('<div>').html(params[i2].getAttribute("column")).text();
        entryRecord.value = params[i2].firstChild.nodeValue.toLocaleString();

        // Override the display value if specified by server setting the "display" attribute
        if (typeof params[i2].attributes.display !== 'undefined') {
            entryRecord.value = i2b2.h.Unescape(entryRecord.value);
            entryRecord.display = params[i2].attributes.display.textContent;
        }
        if (entryRecord.name === 'RequestEmail') {
            dataExport.requestInfo.emailMsg = {
                name: "Request Email",
                value: entryRecord.value
            };
        }
        else if(entryRecord.name === 'EMAIL') {
            dataExport.requestInfo.email = {
                name: "Requested By Email",
                value: entryRecord.value
            };
        } else {
            dataExport.resultTable.push(entryRecord);
        }
    }

    return dataExport;
}