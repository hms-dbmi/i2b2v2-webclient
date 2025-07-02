const mapSettings = {
    "mapLayer": {
        "urlTemplate": "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        "maxZoom": 19
    }
}

export default class ZipcodeMap {
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
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "ZipcodeMap/ZipcodeMap.html");
                if (!response.ok) {
                    console.error(`Failed to retrieve ZipcodeMap component template file: ${response.status}`);
                } else {
                    // render the layout template
                    const templateText = await response.text();
                    this.config.template = Handlebars.compile(templateText);
                    let renderdata = {
                        "zoomList": i2b2.CRC.QueryStatus.model.GeoJSON.zooms
                    };
                    $(this.config.template(renderdata)).appendTo(this.config.displayEl);

                    // connect the zoom link click events
                    $('.zoom-link').on('click', (e)=>{
                        let data = e.currentTarget.dataset;
                        self.map.setView([data.lat, data.long], data.zoom);
                        // delay by 50ms because we are going to lose the link as we just started a viewport change
                        const closureEl = e.currentTarget;
                        setTimeout(()=>{
                            $(closureEl).addClass('selected');
                        }, 50);
                    });
                    // set the initial zoom state as selected
                    for (let idx in i2b2.CRC.QueryStatus.model.GeoJSON.zooms) {
                        if (i2b2.CRC.QueryStatus.model.GeoJSON.zooms[idx].initial) {
                            $('.zoom-link[data-index="' + idx + '"]', this.config.displayEl).addClass('selected');
                            break;
                        }
                    }


                    this.mapEl = $('.map-target', this.config.displayEl)[0];
                    this.config.displayEl.style.display = "block";
                    //  instantiate leaflet with initial zoom set
                    const zoomInitial = i2b2.CRC.QueryStatus.model.GeoJSON.zooms.filter((zoom) => zoom.initial === true);
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

                    this.update();
                }
            }).call(this);
        } catch(e) {
            console.error("Error in QueryStatus:ZipcodeMap.constructor()");
        }
    }

    update(inputData) {
        this.config.displayEl.style.display = "none";
        try {

        } catch (e) {
            console.error("Error in QueryStatus:ZipcodeMap.update()");
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
            console.error("Error in QueryStatus:ZipcodeMap.redraw()");
        }
    }


    show() {
        // this is executed before a render and/or displaying of this visualization.
        // returning false will cancel the selection and (re)displaying of this visualization
        // USED PRIMARLY BY THE "Download" MODULE
        try {
            this.isVisible = true;

            if (typeof this.config.parentTitleEl !== 'undefined') this.config.parentTitleEl.innerHTML = this.record.title;
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:ZipcodeMap.show()");
        }
    }


    hide() {
        try {
            this.isVisible = false;
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:ZipcodeMap.hide()");
        }
    }

}


// load the GeoJSON data
(async function() {
    try {
        // load GeoJSON data
        let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "ZipcodeMap/GeoJSON/load_list.json");
        if (!response.ok) throw new Error(`Failed to retreve ZipcodeMap/GeoJSON/load_list.json file: ${response.status}`);
        const geojsonFiles = await response.json();

        response = await fetch(i2b2.CRC.QueryStatus.baseURL + "ZipcodeMap/zoom_list.json");
        if (!response.ok) throw new Error(`Failed to retreve ZipcodeMap/zoom_list.json file: ${response.status}`);
        const zoomLinks = await response.json();

        i2b2.CRC.QueryStatus.model.GeoJSON = {
            "loadList": geojsonFiles,
            "data": false,
            "zooms": zoomLinks
        };

        let geojsonFetches = geojsonFiles.map((url) => {
            let request = new Request(i2b2.CRC.QueryStatus.baseURL + "ZipcodeMap/GeoJSON/" + url,{
                headers: new Headers({
                    'Content-Type': 'text/json'
                }),
                method: 'GET'
            });
            return fetch(request).then((response) => {
                if (!response.ok) {
                    return Promise((resolve, reject) => {
                        reject(response);
                    });
                } else {
                    return response.json();
                }
            })
        })

        Promise.allSettled(geojsonFetches).then((results) => {
            for (let idx in results) {
                const entry = results[idx];
                if (entry.status !== 'fulfilled') {
                    console.error("Error while retreving GeoJSON/" + i2b2.CRC.QueryStatus.model.GeoJSON.loadList[idx]);
                    console.dir(entry);
                } else {
                    if (i2b2.CRC.QueryStatus.model.GeoJSON.data === false) {
                        i2b2.CRC.QueryStatus.model.GeoJSON.data = entry.value;
                    } else {
                        entry.value.features.forEach((feature) => {
                            i2b2.CRC.QueryStatus.model.GeoJSON.data.features.push(feature);
                        });
                    }
                    delete entry.value;
                }
            }
            console.dir(i2b2.CRC.QueryStatus.model.GeoJSON);
        });

    } catch (error) {
        console.error("Failed to initialize ZipcodeMap visualization module: ", error);
    }
})();
