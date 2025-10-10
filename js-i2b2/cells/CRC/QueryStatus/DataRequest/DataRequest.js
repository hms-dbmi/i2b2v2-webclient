export default class DataRequest {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
            const self = this;

            (async function() {
                // retrieve the component frame template
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "DataRequest/DataRequest.html");
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
                this.record = data;
            }
            if (typeof this.dispTemplate !== 'undefined') {
                let resultXML = i2b2.h.XPath(data, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data = parseData(resultXML);

                    const siteData = this.data;//Object.values(this.data);

                    // update the display
                    $(this.config.displayEl).empty();
                    $(this.dispTemplate({dataExport: siteData})).appendTo(this.config.displayEl);
                }
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
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:DataRequest.redraw()");
        }
    }


    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        try {
            this.isVisible = true;
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'block';
            //if (this.config.parentTitleEl) this.config.parentTitleEl.innerHTML = this.record.title;
            this.config.displayEl.style.display = 'block';
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:DataRequest.show()");
        }
    }


    hide() {
        try {
            this.isVisible = false;
            this.config.displayEl.style.display = 'none';
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'none';
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
        if(entryRecord.name === 'RequestEmail') {
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
        }else{
            dataExport.resultTable.push(entryRecord);
        }
    }

    return dataExport;
}