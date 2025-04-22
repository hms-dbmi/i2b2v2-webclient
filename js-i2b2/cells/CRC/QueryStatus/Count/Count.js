export default class Count {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
            let componentRef = this;
            let init = async function() {
                // retrieve the component frame template
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "Count/Count.html");
                if (!response.ok) {
                    console.error(`Failed to retrieve Count component template file: ${response.status}`);
                    componentRef.dispTemplate = "";
                } else {
                    componentRef.dispTemplate = await response.text();
                }
            }
            init();

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
            this.data = data;
            // extract the info from the XML
            const title = i2b2.h.XPath(data, "//query_result_instance/description")[0].firstChild.nodeValue;
            const count = i2b2.h.XPath(data, "//query_result_instance/set_size")[0].firstChild.nodeValue;

            // display the info
            this.config.displayEl.innerHTML = this.dispTemplate;
            this.config.displayEl = this.config.displayEl.parentElement.querySelector('.viztype-COUNT.resulttype-' + this.record.QRS_Type);
            let refContainer = this.config.displayEl;
            const titleEl = refContainer.querySelector('.count-title');
            titleEl.innerHTML = title;
            const countEl = refContainer.querySelector('.count-value');
            countEl.innerHTML = count;
            refContainer.style.height = '0px';
            refContainer.style.display = 'block';
            let countContainer = refContainer.querySelector('.count-container');
            setTimeout(()=>{
                refContainer.style.transitionDuration = '1s';
                refContainer.style.height = countContainer.offsetHeight + 'px';
            }, 10);
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