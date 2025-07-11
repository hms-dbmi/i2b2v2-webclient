const mapSettings = {
    "mapLayer": {
        "urlTemplate": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "attribution": '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        "maxZoom": 16
    }
}
export default class PatientCountMap {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;

            this.isVisible = false;
            this.config.displayEl.style.display = "none";
            const self = this;

            /* code here */

            // retrieve and inject the template
            (async function() {
                // retrieve the component frame template
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "PatientCountMap/PatientCountMap.html");

                if (!response.ok) {
                    console.error(`Failed to retrieve PatientCountMap component template file: ${response.status}`);
                } else {
                    // render the layout template
                    const templateText = await response.text();
                    this.config.template = Handlebars.compile(templateText);
                    let renderdata = {
                        "zoomList": i2b2.CRC.QueryStatus.model.MapJSON.zooms.filter(z => z.createShortcut)
                    };
                    $(this.config.template(renderdata)).appendTo(this.config.displayEl);

                    // connect the zoom link click events
                    $('.zoom-link', self.config.displayEl).on('click', (e)=>{
                        let data = e.currentTarget.dataset;
                        self.map.setView([data.lat, data.long], data.zoom);
                        // delay by 50ms because we are going to lose the link as we just started a viewport change
                        const closureEl = e.currentTarget;
                        setTimeout(()=>{
                            $(closureEl).addClass('selected');
                        }, 50);
                    });
                    // set the initial zoom state as selected
                    for (let idx in i2b2.CRC.QueryStatus.model.MapJSON.zooms) {
                        if (i2b2.CRC.QueryStatus.model.MapJSON.zooms[idx].initial) {
                            $('.zoom-link[data-index="' + idx + '"]', this.config.displayEl).addClass('selected');
                            break;
                        }
                    }

                    this.mapEl = $('.patient-map', this.config.displayEl)[0];
                    this.config.displayEl.style.display = "block";
                    //  instantiate leaflet with initial zoom set
                    const zoomInitial = i2b2.CRC.QueryStatus.model.MapJSON.zooms.filter((zoom) => zoom.initial === true);
                    if (zoomInitial.length > 0) {
                        this.map = L.map(this.mapEl).setView([zoomInitial[0].lat, zoomInitial[0].long], zoomInitial[0].zoom);
                    } else {
                        this.map = L.map(this.mapEl).setView([5.00339434502215, 21.26953125], 3);
                    }

                    // capture zoom and move events
                    const clearSelectedZoom = (e) => {
                        $('.zoom-link', self.config.displayEl).removeClass('selected');
                    };
                    this.map.on('zoomstart', clearSelectedZoom);
                    this.map.on('movestart', clearSelectedZoom);

                    // add Map image layer
                    let options = {maxZoom: mapSettings.mapLayer.maxZoom}
                    if (typeof mapSettings.mapLayer.attribution !== 'undefined') options.attribution = mapSettings.mapLayer.attribution;
                    L.tileLayer(mapSettings.mapLayer.urlTemplate, options).addTo(this.map);

                    if (this.isVisible === true) {
                        this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
                    }

                    self.update();
                }
            }).call(this);

        } catch(e) {
            console.error("Error in QueryStatus:PatientCountMap.constructor(). " + e);
        }
    }

    destroy() {
        delete this.config.displayEl;
        delete this.config;
        delete this.record;
        delete this.data;
    }

    update(inputData) {
        this.config.displayEl.style.display = "none";
        try {

            if (typeof inputData === 'undefined') {
                // no data has been set... exit
                if (this.data === null || Object.keys(this.data).length === 0) return;
            } else {
                // get the breakdown data information (if present)
                let resultXML = i2b2.h.XPath(inputData, "//xml_value");
                if (resultXML.length > 0) {
                    resultXML = resultXML[0].firstChild.nodeValue;
                    // parse the data and put the results into the new data slot
                    this.data = parseData(resultXML);
                }

                const siteData = Object.values(this.data);

                let min = -1;
                let max = -1;
                siteData.forEach((res) => {
                    let count = res.count;
                    if (min === -1) {
                        min = count;
                    } else {
                        min = Math.min(min, count);
                    }
                    max = Math.max(max, count);
                });

                let scaleRadiusFunc = d3.scaleLinear([min, max], [15, 30]);

                siteData.forEach(siteResult => {
                    let patientCount = siteResult.count;
                    let scalePatientCount = scaleRadiusFunc(patientCount);

                    let siteZoomData = i2b2.CRC.QueryStatus.model.MapJSON.zooms.filter(s => s.title === siteResult.site);
                    if (siteZoomData.length !== 0){
                        let circle = L.circleMarker([siteZoomData[0].lat, siteZoomData[0].long], {
                            fillOpacity: 0.5,
                            radius: scalePatientCount
                        }).addTo(this.map);

                        let toolTip = '';
                        if (siteResult.count <= siteResult.floorThresholdNumber) {
                            toolTip = "<" + parseInt(siteResult.floorThresholdNumber).toLocaleString() + " Patients at " + siteResult.site;
                        }else{
                            toolTip = parseInt(siteResult.count).toLocaleString() + "±" + parseInt(siteResult.obfuscatedDisplayNumber).toLocaleString() + " Patients at " + siteResult.site;
                        }
                        circle.bindPopup(toolTip);
                    }
                })
            }

        } catch (e) {
            console.error("Error in QueryStatus:PatientCountMap.update()", e);
        }

        if (this.isVisible) {
            this.config.displayEl.style.display = "block";
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        }
    }

    redraw(width) {
        try {
            this.map.invalidateSize();
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:PatientCountMap.redraw()");
        }
    }

    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            this.isVisible = true;
            if (typeof this.config.parentTitleEl !== 'undefined') this.config.parentTitleEl.innerHTML = this.record.title;
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'block';
            this.config.displayEl.style.display = 'block';
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:PatientCountMap.show()");
        }
    }

    hide() {
        try {
            this.isVisible = false;
            this.config.displayEl.style.display = 'none';
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'none';
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:PatientCountMap.hide()", e);
        }
    }
}


// =======================================================================================================================


// load the MapJSON data
(async function() {
    try {
        let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "PatientCountMap/map_config.json");
        if (!response.ok) throw new Error(`Failed to retrieve PatientCountMap/map_config.json file: ${response.status}`);
        const zoomLinks = await response.json();

        i2b2.CRC.QueryStatus.model.MapJSON = {
            "data": false,
            "zooms": zoomLinks
        };

    } catch (error) {
        console.error("Failed to initialize PatientCountMap visualization module: ", error);
    }
})();

const parseData = (xmlData) => {
    let data = {};
    let records = i2b2.h.XPath(xmlData, "//data[@column]");
    for (let rec of records) {
        let key = rec.getAttribute("column");
        data[key] = {};
        data[key].site = key;
        data[key].count = parseInt(rec.textContent);
        if (isNaN(data[key].count)) {
            data[key].count = rec.textContent;
        }
    }
    // SHRINE site details
    let attribs = ["status", "floorThresholdNumber","obfuscatedDisplayNumber","binSize","stdDev"];
    records = i2b2.h.XPath(xmlData, "//SHRINE/site[@name]");
    for (let rec of records) {
        let key = rec.getAttribute("name");
        if (typeof data[key] === "undefined") data[key] = {};
        data[key].site = key;
        data[key].text = rec.textContent;
        for (let attrib of attribs) {
            data[key][attrib] = rec.getAttribute(attrib);
        }
        if (data[key].status.toUpperCase().indexOf("ERROR") !== -1) data[key].error = true;
    }
    return data;
};

