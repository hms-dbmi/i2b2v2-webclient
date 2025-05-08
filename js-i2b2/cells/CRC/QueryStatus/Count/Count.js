export default class Count {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
            let componentRef = this;

            // see if we are SHRINE count
            if (this.record.QRS_Type.indexOf("_SHRINE_") === -1) {
                this.isShrine = false;
            } else {
                this.isShrine = true;
            }

            let init = async function() {
                // retrieve the component frame template
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "Count/Count.html");
                if (!response.ok) {
                    console.error(`Failed to retrieve Count component template file: ${response.status}`);
                    this.dispTemplate = "";
                } else {
                    this.dispTemplate = await response.text();
                }
            }
            init.call(this);

        } catch(e) {
            console.error("Error in QueryStatus:Count.constructor()");
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
            if (typeof data === 'undefined') {
                if (typeof this.data === 'undefined') return;
                data = this.data;
            } else {
                this.data = data;
            }
            this.data = data;
            // extract the info from the XML
            let title = i2b2.h.XPath(data, "//query_result_instance/description");
            if (title.length === 0) {
                // deal with PATIENT_COUNT_SHRINE_XML which is different
                title = i2b2.h.XPath(data, "//query_result_instance/query_result_type/description")
            }
            title = title[0].firstChild.nodeValue;

            const count = i2b2.h.XPath(data, "//query_result_instance/set_size")[0].firstChild.nodeValue;


            // display the info
            this.config.displayEl.innerHTML = this.dispTemplate;
            this.config.displayEl = this.config.displayEl.parentElement.querySelector('.viztype-COUNT.resulttype-' + this.record.QRS_Type);
            let refContainer = this.config.displayEl;
            const titleEl = refContainer.querySelector('.count-title');
            titleEl.innerHTML = title;
            const countEl = refContainer.querySelector('.count-value');
            let rawCount = parseInt(count).toLocaleString();
            if (this.isShrine) {
                // get the extra site information
                const xmlSHRINE = i2b2.h.Unescape(i2b2.h.XPath(data, "//xml_value")[0].innerHTML);
                const sitesTotal = parseInt(i2b2.h.XPath(xmlSHRINE, "//SHRINE/@sites")[0].nodeValue).toLocaleString();
                const sitesDone = parseInt(i2b2.h.XPath(xmlSHRINE, "//SHRINE/@complete")[0].nodeValue).toLocaleString();
                const obfuscateFloor = parseInt(i2b2.h.XPath(xmlSHRINE, "//SHRINE/@floorThresholdNumber")[0].nodeValue).toLocaleString();
                const obfuscateDisplay = parseInt(i2b2.h.XPath(xmlSHRINE, "//SHRINE/@obfuscatedDisplayNumber")[0].nodeValue).toLocaleString();

                // count
                if (parseInt(count) <= obfuscateFloor) {
                    countEl.innerHTML = "&lt;" + rawCount;
                } else {
                    countEl.innerHTML = rawCount + "  &#177;" + obfuscateDisplay;
                }
                // sites reporting
                let sitesContainer = refContainer.querySelector('.count-sites');
                sitesContainer.innerHTML = "With " + sitesDone + " out of " + sitesTotal + " sites reporting";
                sitesContainer.style.display = "block";
            } else {
                // count
                countEl.innerHTML = rawCount;
            }
            // show everything
             refContainer.style.display = 'block';
        } catch(e) {
            console.error("Error in QueryStatus:Count.update()");
        }
    }

    redraw(width) {
        try {
///            this.config.displayEl.innerHTML = "{" + this.constructor.name + "} is " + width + " pixels wide";
        } catch(e) {
            console.error("Error in QueryStatus:Count.redraw()");
        }
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        try {
            // we only display when we get data
            this.isVisible = true;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Count.show()");
        }

    }

    hide() {
        try {
            this.isVisible = true;
            return false;
        } catch(e) {
            console.error("Error in QueryStatus:Count.hide()");
        }
    }
}