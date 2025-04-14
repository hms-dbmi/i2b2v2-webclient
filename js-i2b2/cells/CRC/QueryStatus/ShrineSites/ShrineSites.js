export default class ShrineSites {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.constructor()");
        }
    }

    update(data) {
        try {

        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.update()");
        }
    }

    redraw(width) {
        try {
            this.config.displayEl.innerHTML = "{" + this.constructor.name + "} is " + width + " pixels wide";
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.redraw()");
        }
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            this.isVisible = true;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.show()");
        }
    }

    hide() {
        try {
            this.isVisible = true;
            return false;
        } catch(e) {
            console.error("Error in QueryStatus:ShrineSites.hide()");
        }
    }
}