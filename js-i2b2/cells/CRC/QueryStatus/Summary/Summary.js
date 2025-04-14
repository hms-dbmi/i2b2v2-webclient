export default class Summary {

    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;
        } catch(e) {
            console.error("Error in QueryStatus:Summary.constructor()");
        }
    }
    update(data) {
        try {

        } catch(e) {
            console.error("Error in QueryStatus:Summary.update()");
        }
    }

    redraw(width) {
        try {
            this.config.displayEl.innerHTML = "{" + this.constructor.name + "} is " + width + " pixels wide";
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