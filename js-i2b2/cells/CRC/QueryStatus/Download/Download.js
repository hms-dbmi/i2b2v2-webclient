export default class Download {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
        } catch(e) {
            console.error("Error in QueryStatus:Download.constructor()");
        }
    }

    update(data) {
        try {

        } catch(e) {
            console.error("Error in QueryStatus:Download.update()");
        }
    }

    redraw(width) {
        // this vizComponent does not have a visual representation
        return true;
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            alert("start download for " + this.record.title);

            this.isVisible = false;
            return false;
        } catch(e) {
            console.error("Error in QueryStatus:Download.show()");
        }
    }

    hide() {
        try {
            this.isVisible = false;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Download.hide()");
        }
    }
}