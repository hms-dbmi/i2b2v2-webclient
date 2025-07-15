let mapSettings = {
    "mapLayer": {
        "urlTemplate": "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        "maxZoom": 16
    }
}
const defaultZipAttrib = "ZCTA5CE10";
const defaultZipRegEx = "^(.*)[0-9]{5}";

export default class ZipcodeMap {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;

            this.isVisible = false;
            this.config.displayEl.style.display = "none";
            const self = this;

            // handle the GeoJSON feature property name that we will use
            this.zipAttribName = defaultZipAttrib;
            if (this.config.advancedConfig?.map.zipAttribName) this.zipAttribName = this.config.advancedConfig.map.zipAttribName;
            // regex that extracts the zipcode value from the column name
            this.zipRegEx = defaultZipRegEx;
            if (this.config.advancedConfig?.map.zipRegEx) this.zipRegEx = this.config.advancedConfig.map.zipRegEx;

            // handle override settings in breakdowns.json for map tile info
            if (this.config.advancedConfig?.map.tiles) mapSettings.mapLayer.urlTemplate = this.config.advancedConfig.map.tiles;
            if (this.config.advancedConfig?.map.maxZoom) mapSettings.mapLayer.maxZoom = this.config.advancedConfig.map.maxZoom;

            // generate the valid zipcode list if it does not already exist
            if (typeof i2b2.CRC.QueryStatus.model.GeoJSON.validZips === 'undefined') i2b2.CRC.QueryStatus.model.GeoJSON.validZips = i2b2.CRC.QueryStatus.model.GeoJSON.data.features.map((feature) => feature.properties[this.zipAttribName])


            // make sure that we have some colors defined
            if (typeof this.config?.advancedConfig.map === 'undefined') {
                console.error("ZIPCODEMAP is missing configuration in breakdowns.json!");
                this.errors = true;
                return;
            }
            if (typeof this.config.advancedConfig.map.colors === 'undefined') this.config.advancedConfig.map.colors = [
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

                    if (this.isVisible === true) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";

                    this.update();
                }
            }).call(this);
        } catch(e) {
            console.error("Error in QueryStatus:ZipcodeMap.constructor()");
        }
    }

    update(inputData) {
//        if (this.errors || typeof inputData === 'undefined') return;
        try {

            // get the breakdown data information (if present)
            let resultXML = i2b2.h.XPath(inputData, "//xml_value");
            if (resultXML.length > 0) {
                resultXML = resultXML[0].firstChild.nodeValue;
                // parse the data and put the results into the new data slot
                this.data = func_processData(resultXML, this.config.advancedConfig.map.zipRegEx);
            } else {
                this.data = func_processData("", this.config.advancedConfig.map.zipRegEx);
//                return;
            }

            this.config.displayEl.style.display = "none";

            // get list of valid zip codes that we care about and collect min/max patient counts while at it
            let validData = {};
            let minCount = Infinity;
            let maxCount = -Infinity;
            for (let zip of Object.keys(this.data)) {
                if (i2b2.CRC.QueryStatus.model.GeoJSON.validZips.includes(zip)) {
                    let temp = this.data[zip];
                    validData[zip] = temp;
                    if (typeof temp.error === 'undefined') {
                        minCount = Math.min(temp.count, minCount);
                        maxCount = Math.max(temp.count, maxCount);
                    }
                }
            }

            let rangeCount = maxCount - minCount;
            let rangeSize = rangeCount / this.config.advancedConfig.map.colors.length;
            let colorBucketsAreRanged = false;
            if (this.config.advancedConfig.map.colors[0].min || this.config.advancedConfig.map.colors[0].max) {
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
                const currentZip = feature.properties[this.zipAttribName];
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
                                for (let bucketData of this.config.advancedConfig.map.colors) {
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
                                    if (bucketIdx > this.config.advancedConfig.map.colors.length - 1) bucketIdx = this.config.advancedConfig.map.colors.length - 1;
                                    featureCopy.properties.color = this.config.advancedConfig.map.colors[bucketIdx].color;
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
                for (let attrib in this.config.advancedConfig.map?.styles.norm) {
                    ret[attrib] = this.config.advancedConfig.map?.styles.norm[attrib];
                }
                return ret;
            }).bind(this);
            // ---------------------------
            const func_StylingHighlight = ((e) => {
                let layer = e.target;
                let style = {}
                // override styles if we have those options set
                for (let attrib in this.config.advancedConfig.map?.styles.hover) {
                    style[attrib] = this.config.advancedConfig.map?.styles.hover[attrib];
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
                // delete existing features if they have already been populated
                if (typeof this.geojson !== 'undefined') this.map.removeLayer(this.geojson);

                // add the features to the map
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
        if (this.errors) return;
        try {
            if (this.map) this.map.invalidateSize();
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:ZipcodeMap.redraw()");
        }
    }


    show() {
        if (this.errors) return;
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
        });
    } catch (error) {
        console.error("Failed to initialize ZipcodeMap visualization module: ", error);
    }
})();



const func_processData = (xmlData, zipRegEx) => {
/*
   <xml_value>&lt;?xml version="1.0" encoding="UTF-8" standalone="yes"?>&lt;ns10:i2b2_result_envelope>&lt;body>&lt;ns10:result name="PATIENT_ZIP_COUNT_SHRINE_XML">
    &lt;data column="01001 - AGAWAM" floorThresholdNumber="20" obfuscatedDisplayNumber="6">270&lt;/data>
    &lt;data column="01002 - AMHERST" floorThresholdNumber="20" obfuscatedDisplayNumber="6">280&lt;/data>
    &lt;data column="01003 - AMHERST" floorThresholdNumber="20" obfuscatedDisplayNumber="6">300&lt;/data>
    &lt;data column="01004 - AMHERST" floorThresholdNumber="20" obfuscatedDisplayNumber="6">280&lt;/data>
    &lt;data column="01005 - BARRE" floorThresholdNumber="20" obfuscatedDisplayNumber="6">315&lt;/data>
    &lt;data column="01007 - BELCHERTOWN" floorThresholdNumber="20" obfuscatedDisplayNumber="6">315&lt;/data>
    &lt;data column="01008 - BLANDFORD" floorThresholdNumber="20" obfuscatedDisplayNumber="6">305&lt;/data>
    &lt;data column="01009 - BONDSVILLE" floorThresholdNumber="20" obfuscatedDisplayNumber="6">305&lt;/data>
    &lt;data column="01010 - BRIMFIELD" floorThresholdNumber="20" obfuscatedDisplayNumber="6">270&lt;/data>
    &lt;data column="01011 - CHESTER" floorThresholdNumber="20" obfuscatedDisplayNumber="6">270&lt;/data>
    &lt;data column="01012 - CHESTERFIELD" floorThresholdNumber="20" obfuscatedDisplayNumber="6">295&lt;/data>
    &lt;data column="01013 - CHICOPEE" floorThresholdNumber="20" obfuscatedDisplayNumber="6">265&lt;/data>
    &lt;data column="01014 - CHICOPEE" floorThresholdNumber="20" obfuscatedDisplayNumber="6">290&lt;/data>
    &lt;data column="01020 - CHICOPEE" floorThresholdNumber="20" obfuscatedDisplayNumber="6">270&lt;/data>
    &lt;data column="01021 - CHICOPEE" floorThresholdNumber="20" obfuscatedDisplayNumber="6">305&lt;/data>
    &lt;data column="01022 - CHICOPEE" floorThresholdNumber="20" obfuscatedDisplayNumber="6">330&lt;/data>
    &lt;data column="01026 - CUMMINGTON" floorThresholdNumber="20" obfuscatedDisplayNumber="6">260&lt;/data>
    &lt;data column="01027 - EASTHAMPTON" floorThresholdNumber="20" obfuscatedDisplayNumber="6">285&lt;/data>
    &lt;data column="01028 - EAST LONGMEADOW" floorThresholdNumber="20" obfuscatedDisplayNumber="6">270&lt;/data>
    &lt;data column="01029 - EAST OTIS" floorThresholdNumber="20" obfuscatedDisplayNumber="6">325&lt;/data>
    &lt;data column="01030 - FEEDING HILLS" floorThresholdNumber="20" obfuscatedDisplayNumber="6">295&lt;/data>
    &lt;/ns10:result>
    &lt;SHRINE sites="2" complete="2" error="0">
        &lt;site name="Site 1" status="Completed" binsize="5" stdDev="6.500000000000000e+000" obfuscatedDisplayNumber="10" floorThresholdNumber="10">
            &lt;siteresult column="02738 - MARION" type="int">120&lt;/siteresult>
            &lt;siteresult column="01845 - NORTH ANDOVER" type="int">150&lt;/siteresult>
            &lt;siteresult column="01115 - SPRINGFIELD" type="int">130&lt;/siteresult>
            &lt;siteresult column="02361 - PLYMOUTH" type="int">130&lt;/siteresult>
            &lt;siteresult column="02043 - HINGHAM" type="int">155&lt;/siteresult>
            &lt;siteresult column="01864 - NORTH READING" type="int">155&lt;/siteresult>
            &lt;siteresult column="02559 - POCASSET" type="int">155&lt;/siteresult>
            &lt;siteresult column="02347 - LAKEVILLE" type="int">165&lt;/siteresult>
            &lt;siteresult column="01748 - HOPKINTON" type="int">140&lt;/siteresult>
            &lt;siteresult column="01843 - LAWRENCE" type="int">140&lt;/siteresult>
            &lt;siteresult column="02027 - DEDHAM" type="int">135&lt;/siteresult>
        &lt;/site>
        &lt;site name="Site 2" status="Completed" binsize="5" stdDev="6.500000000000000e+000" obfuscatedDisplayNumber="10" floorThresholdNumber="10">
            &lt;siteresult column="02738 - MARION" type="int">125&lt;/siteresult>
            &lt;siteresult column="01566 - STURBRIDGE" type="int">155&lt;/siteresult>
            &lt;siteresult column="02138 - CAMBRIDGE" type="int">150&lt;/siteresult>
            &lt;siteresult column="01740 - BOLTON" type="int">150&lt;/siteresult>
            &lt;siteresult column="02637 - CUMMAQUID" type="int">125&lt;/siteresult>
            &lt;siteresult column="02537 - EAST SANDWICH" type="int">130&lt;/siteresult>
            &lt;siteresult column="02140 - CAMBRIDGE" type="int">185&lt;/siteresult>
            &lt;siteresult column="02141 - CAMBRIDGE" type="int">160&lt;/siteresult>
            &lt;siteresult column="02133 - BOSTON" type="int">120&lt;/siteresult>
            &lt;siteresult column="02302 - BROCKTON" type="int">160&lt;/siteresult>
            &lt;siteresult column="01237 - LANESBOROUGH" type="int">155&lt;/siteresult>
            &lt;siteresult column="02641 - EAST DENNIS" type="int">150&lt;/siteresult>
            &lt;siteresult column="02477 - WATERTOWN" type="int">135&lt;/siteresult>
            &lt;/site>
        &lt;/SHRINE>&lt;/body>
        &lt;/ns10:i2b2_result_envelope>
            </xml_value>
*/


    let ret = {};
    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    // short circuit exit because there is no data
    if (params.length === 0)
        return {
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

    for (let i = 0; i < params.length; i++) {
        const zipData = params[i].getAttribute("column");
        let zipSearch = zipData.match(zipRegEx);
        if (zipSearch.length > 0) {
            const zipCode = zipSearch[0].trim();
            ret[zipCode] = {
                count: params[i].firstChild.nodeValue,
                text: zipData
            };
        }
    }

    return ret;
};