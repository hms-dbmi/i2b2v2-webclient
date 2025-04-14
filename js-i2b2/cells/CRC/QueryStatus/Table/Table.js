export default class Table {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;
            this.isVisible = false;

            // create the base table

            this.config.displayEl

        } catch(e) {
            console.error("Error in QueryStatus:Table.constructor()");
        }
    }
    update(data) {
        try {



        } catch(e) {
            console.error("Error in QueryStatus:Table.update()");
        }
    }

    redraw(width) {
        try {
//            this.config.displayEl.innerHTML = "{" + this.constructor.name + "} is " + width + " pixels wide";
            this.update();
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Table.redraw()");
        }
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        try {
            this.isVisible = true;
            this.config.displayEl.style.display = 'block';
            this.config.dropdownEl.style.display = 'block';
            this.config.parentTitleEl.innerHTML = this.record.title;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Table.show()");
        }
    }

    hide() {
        try {
            this.config.displayEl.style.display = 'none';
            this.config.dropdownEl.style.display = 'none';
            this.isVisible = false;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:Table.hide()");
        }
    }

}