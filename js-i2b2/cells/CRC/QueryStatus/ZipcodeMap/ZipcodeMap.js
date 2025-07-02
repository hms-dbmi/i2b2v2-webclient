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
                    });


                    this.mapEl = $('.map-target', this.config.displayEl)[0];
                    this.config.displayEl.style.display = "block";
                    //  instantiate leaflet with initial zoom set
                    const zoomInitial = i2b2.CRC.QueryStatus.model.GeoJSON.zooms.filter((zoom) => zoom.initial === true);
                    if (zoomInitial.length > 0) {
                        this.map = L.map(this.mapEl).setView([zoomInitial[0].lat, zoomInitial[0].long], zoomInitial[0].zoom);
                    } else {
                        this.map = L.map(this.mapEl).setView([5.00339434502215, 21.26953125], 3);
                    }

                    // add OpenStreetMap
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

        // // load breakdowns.json
        // response = await fetch(i2b2.CRC.QueryStatus.baseURL + "breakdowns.json");
        // if (!response.ok) throw new Error(`Failed to retreve QueryStatus breakdowns.json file: ${response.status}`);
        // i2b2.CRC.QueryStatus.breakdownConfig = await response.json();
        //
        // // save component keys into component objects
        // for (const compCode of Object.keys(i2b2.CRC.QueryStatus.displayComponents)) i2b2.CRC.QueryStatus.displayComponents[compCode].componentCode = compCode;
        //
        // // retrieve the component frame template
        // response = await fetch(i2b2.CRC.QueryStatus.baseURL + "componentFrameTemplate.html");
        // if (!response.ok) {
        //     console.error(`Failed to retrieve component frame template file: ${response.status}`);
        //     i2b2.CRC.QueryStatus.componentFrameTemplate = "<div class='QueryStatusComponent'></div><div class='viz-window'></div><div>";
        // } else {
        //     i2b2.CRC.QueryStatus.componentFrameTemplate = await response.text();
        // }
        //
        // // load the component implementations and CSS
        // let CSSAccumulator = "";
        // for (let code in i2b2.CRC.QueryStatus.displayComponents) {
        //     const componentInfo = i2b2.CRC.QueryStatus.displayComponents[code];
        //     try {
        //         const component = await import("./" + componentInfo.source);
        //         componentInfo.implementation = component.default;
        //     } catch(e) {
        //         console.error("QueryStatus " + code + " Component load error: " + e.message);
        //     }
        //
        //     if (componentInfo.CSS) {
        //         const response = await fetch(i2b2.CRC.QueryStatus.baseURL + componentInfo.CSS);
        //         if (!response.ok) console.error(`QueryStatus ` + code + ` CSS loading error: ${response.status}`);
        //         let cssDefinitions = await response.text();
        //         cssDefinitions = cssDefinitions.trim();
        //         if (cssDefinitions.length > 0) CSSAccumulator = CSSAccumulator + "\n\n\n\n" + cssDefinitions;
        //     }
        // }
        //
        // // append the component style definitions
        // if (CSSAccumulator.trim().length > 0) {
        //     const componentStyleDefEl = document.createElement('style');
        //     componentStyleDefEl.innerHTML = CSSAccumulator + "\n";
        //     document.head.append(componentStyleDefEl);
        // }

    } catch (error) {
        console.error("Failed to initialize ZipcodeMap visualization module: ", error);
    }
})();
