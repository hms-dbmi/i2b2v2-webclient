export default class Summary {

    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;

            let thisClassInstance = this;
            $.ajax("js-i2b2/cells/CRC/QueryStatus/Summary/QueryStatus.html", {
                success: (template, status, req) => {
                    // don't pollute the global Handlebars space
                    thisClassInstance.template = Handlebars.compile(req.responseText);

                    // display the initial info that was passed
                    $(thisClassInstance.template(this.record)).appendTo(thisClassInstance.config.displayEl);
                },
                error: (error) => { console.error("Error (retrieval or structure) with template: CRC/QueryStatus/Summary/QueryStatus.html"); }
            });


        } catch(e) {
            console.error("Error in QueryStatus:Summary.constructor()");
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
            if (typeof this.template !== 'undefined') {
                // update the display
                $(this.config.displayEl).empty();
                $(this.template(this.record)).appendTo(this.config.displayEl);
            }
        } catch(e) {
            console.error("Error in QueryStatus:Summary.update()");
        }
    }

    redraw(width) {
        try {
            this.config.displayEl.offsetWidth
        } catch(e) {
            console.error("Error in QueryStatus:Summary.redraw()");
        }
    }
    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        try {
            this.config.displayEl.style.display = 'block';
            this.isVisible = true;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Summary.show()");
            return false;
        }
    }

    hide() {
        this.isVisible = true;
        return false;
    }

}