const mapSettings = {
    "mapLayer": {
        "urlTemplate": "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        "maxZoom": 16
    }
}
const zipAttrib = "ZCTA5CE10";

export default class ZipcodeMap {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;

            this.isVisible = false;
            this.config.displayEl.style.display = "none";
            const self = this;

            // make sure that we have some colors defined
            if (typeof this.config.advancedConfig === 'undefined') this.config.advancedConfig = {};
            if (typeof this.config.advancedConfig.colors === 'undefined') this.config.advancedConfig.colors = [
                {"color": "#b2182b"},
                {"color": "#d6604d"},
                {"color": "#f4a582"},
                {"color": "#fddbc7"},
                {"color": "#ffffff"},
                {"color": "#e0e0e0"},
                {"color": "#bababa"},
                {"color": "#878787"},
                {"color": "#4d4d4d"}
            ];

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
                    if (Array.isArray(this.config.advancedConfig?.zooms)) {
                        renderdata.zoomList = this.config.advancedConfig?.zooms;
                    }

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
                    for (let idx in renderdata.zoomList) {
                        if (renderdata.zoomList[idx].initial) {
                            $('.zoom-link[data-index="' + idx + '"]', this.config.displayEl).addClass('selected');
                            break;
                        }
                    }


                    this.mapEl = $('.map-target', this.config.displayEl)[0];
                    this.config.displayEl.style.display = "block";
                    //  instantiate leaflet with initial zoom set
                    const zoomInitial = renderdata.zoomList.filter((zoom) => zoom.initial === true);
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

                    // create a hover control if it is configured
                    if (typeof this.config.advancedConfig?.hoverBox.template !== 'undefined') {
                        // create a hoverbox control
                        let options = {};
                        if (typeof this.config.advancedConfig.hoverBox.position !== 'undefined') options.position = this.config.advancedConfig.hoverBox.position;
                        this.hoverbox = L.control(options);
                        this.hoverbox.onAdd = (map) => {
                            let className = "hoverinfo-box";
                            if (typeof self.config.advancedConfig.hoverBox.className !== 'undefined') className = className + ' ' + self.config.advancedConfig.hoverBox.className;
                            self.hoverbox._div = L.DomUtil.create('div', className);
                            self.hoverbox._div.style.display = 'none';
                            self.hoverbox.update();
                            self.hoverbox._div.style.display = '';
                            return self.hoverbox._div;
                        };
                        this.hoverbox.update = (data) => {
                            if (typeof self.hoverbox._div === 'undefined') return; // fixes race condition bug
                            if (data) {
                                self.hoverbox._div.innerHTML = func_processTemplate(self.config.advancedConfig.hoverBox.template, data);
                                self.hoverbox._div.style.opacity = 1;
                            } else {
                                if (typeof self.config.advancedConfig.hoverBox.default !== 'undefined') {
                                    // display default msg
                                    self.hoverbox._div.innerHTML = self.config.advancedConfig.hoverBox.default;
                                    self.hoverbox._div.style.opacity = 1;
                                } else {
                                    // hide the hover box
                                    self.hoverbox._div.style.opacity = 0;
                                }
                            }
                        };
                        this.hoverbox.addTo(this.map);
                    }

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
            let data = func_processData(inputData);

            // get list of valid zip codes that we care about and collect min/max patient counts while at it
            let validData = {};
            let minCount = Infinity;
            let maxCount = -Infinity;
            for (let zip of Object.keys(data)) {
                if (i2b2.CRC.QueryStatus.model.GeoJSON.validZips.includes(zip)) {
                    let temp = data[zip]
                    validData[zip] = temp;
                    if (typeof temp.error === 'undefined') {
                        minCount = Math.min(temp.count, minCount);
                        maxCount = Math.max(temp.count, maxCount);
                    }
                }
            }

            let rangeCount = maxCount - minCount;
            let rangeSize = rangeCount / this.config.advancedConfig.colors.length;
            let colorBucketsAreRanged = false;
            if (this.config.advancedConfig.colors[0].min || this.config.advancedConfig.colors[0].max) {
                // the color buckets have min/max settings, use them
                colorBucketsAreRanged = true;
            }

            // generate list of valid GeoJSON features
            let foundZips = Object.keys(validData);
            let featureZipAttribute = "";
            let geoJSON = {
                type: "FeatureCollection",
                features: []
            }
            i2b2.CRC.QueryStatus.model.GeoJSON.data.features.forEach((feature) => {
                const currentZip = feature.properties[zipAttrib];
                if (typeof validData[currentZip] !== 'undefined') {
                    // only insert feature if we have some data for the zip code
                    let featureCopy = structuredClone(feature);
                    // copy over the data from the server
                    for (let attrib in validData[currentZip]) {
                        let attribValue = validData[currentZip][attrib];
                        featureCopy.properties[attrib] = attribValue;
                        if (attrib === "count") {
                            // special processing for the main count value from the server
                            if (colorBucketsAreRanged) {
                                // the color buckets have min/max settings, use them
                                for (let bucketData of this.config.advancedConfig.colors) {
                                    let matchCriteria = 0;
                                    if (bucketData.min) {
                                        if (attribValue >= bucketData.min) matchCriteria++;
                                    } else {
                                        matchCriteria++;
                                    }
                                    if (bucketData.max) {
                                        if (attribValue <= bucketData.max) matchCriteria++;
                                    } else {
                                        matchCriteria++;
                                    }
                                    if (matchCriteria == 2) {
                                        // value falls within the matching range
                                        featureCopy.properties.color = bucketData.color;
                                        break;
                                    }
                                }
                            } else {
                                // the color buckets have no range setting, base on equal
                                let bucketIdx = Math.floor((attribValue - minCount) / rangeSize);
                                if (isNaN(bucketIdx)) {
                                    featureCopy.properties.color = "none";
                                } else {
                                    if (bucketIdx < 0) bucketIdx = 0;
                                    if (bucketIdx > this.config.advancedConfig.colors.length - 1) bucketIdx = this.config.advancedConfig.colors.length - 1;
                                    featureCopy.properties.color = this.config.advancedConfig.colors[bucketIdx].color;
                                }
                            }
                        }
                    }
                    geoJSON.features.push(featureCopy);
                }
            });

            // interaction/helper functions
            // ---------------------------
            const func_StylingNorm = ((feature) => {
                let ret = {
                    fillColor: feature.properties.color
                };
                // override styles if we have those options set
                for (let attrib in this.config.advancedConfig?.styles.norm) {
                    ret[attrib] = this.config.advancedConfig?.styles.norm[attrib];
                }
                return ret;
            }).bind(this);
            // ---------------------------
            const func_StylingHighlight = ((e) => {
                let layer = e.target;
                let style = {}
                // override styles if we have those options set
                for (let attrib in this.config.advancedConfig?.styles.hover) {
                    style[attrib] = this.config.advancedConfig?.styles.hover[attrib];
                }
                layer.setStyle(style);
                layer.bringToFront();
                // handle hoverover box
                if (typeof this.hoverbox !== 'undefined') {
                    this.hoverbox.update(layer.feature.properties);
                }
            }).bind(this);
            // ---------------------------
            const func_StylingReset = ((e) => {
                // reset area styles
                this.geojson.resetStyle(e.target);
                // reset the hoverover box or hide it
                if (typeof this.hoverbox !== 'undefined') {
                    this.hoverbox.update();
                }
            }).bind(this);
            // ---------------------------
            const func_onClick = ((e) => {
                if (typeof this.config.advancedConfig?.clickBox.template === 'undefined') return;

                let data = e.target.feature.properties;

                let options = {
                    content: func_processTemplate(this.config.advancedConfig.clickBox.template, data)
                };
                if (typeof this.config.advancedConfig?.clickBox.options !== 'undefined') options = {...options, ...this.config.advancedConfig.clickBox.options};
                let popup = L.popup(e.latlng, options).openOn(this.map);
            }).bind(this);
            // ---------------------------
            const func_onEachFeature = ((feature, layer) => {
                layer.on({
                    mouseover: func_StylingHighlight,
                    mouseout: func_StylingReset,
                    click: func_onClick
                });
            }).bind(this);


            // render the geoJSON data
            if (geoJSON.features.length > 0) {
                this.geojson = L.geoJson(geoJSON, {
                    style: func_StylingNorm,
                    onEachFeature: func_onEachFeature
                }).addTo(this.map);
            }

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
            if (this.map) this.map.invalidateSize();
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
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
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'block';
            this.config.displayEl.style.display = 'block';
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:ZipcodeMap.show()");
        }
    }


    hide() {
        try {
            this.isVisible = false;
            this.config.displayEl.style.display = 'none';
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'none';
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:ZipcodeMap.hide()");
        }
    }

}

const func_processTemplate = (template, data) => {
    // processes templates
    // "this is template variable number {{~count}} out of {{total}}" is a template string
    // template vars will be replaced with data["count"] and data["total"] values
    // template var {{~count}} will be converted to a number and will have commas added to it
    let ret = template;
    // find the template variables
    let templateVars = template.match(/(\{\{[\s]*.*?[\s]*\}\})/g);
    for (let templateVar of templateVars) {
        let varname = templateVar.replaceAll('{{','').replaceAll('}}','');
        let prettyNum = false;
        if (varname.substring(0,1) === '~') {
            varname = varname.substring(1);
            prettyNum = true;
        }
        if (typeof data[varname] !== 'undefined') {
            let dataString = data[varname];
            if (prettyNum) {
                // pretty up potential numbers
                dataString = Number(dataString).toLocaleString();
            }
            ret = ret.replaceAll(templateVar, dataString);
        }
    }
    return ret;
};

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
            // build list of valid zip codes
            i2b2.CRC.QueryStatus.model.GeoJSON.validZips = i2b2.CRC.QueryStatus.model.GeoJSON.data.features.map((feature) => feature.properties[zipAttrib])
        });

    } catch (error) {
        console.error("Failed to initialize ZipcodeMap visualization module: ", error);
    }
})();



const func_processData = (data) => {

    let ret = {
        "99999":{"count": 99000},
        "02114":{"count": 24160},
        "02113":{"count": 19173},
        "02203":{"count": 19173},
        "02109":{"count": 19173},
        "02108":{"count": 19173},
        "02110":{"count": 19173},
        "02116":{"count": 19173},
        "02111":{"count": 19173},
        "02118":{"count": 19173},
        "02199":{"count": 18208},
        "02210":{"count": 4262},
        "02127":{"count": 4262},
        "02119":{"count": 4262},
        "02120":{"count": 3597},
        "02115":{"count": 3597},
        "02215":{"count": 2334},
        "02134":{"count": 2334},
        "02163":{"count": 2255},
        "02135":{"count": 2226},
        "02129":{"count": 2084},
        "02128":{"count": 2084},
        "02151":{"count": 1670},
        "02125":{"count": 940},
        "02130":{"count": 699},
        "02122":{"count": 642}
    };

    return ret;
};