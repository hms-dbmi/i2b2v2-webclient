let mapSettings = {
    "mapLayer": {
        "urlTemplate": "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        "maxZoom": 16
    }
}

import aggModule from './aggregations.mjs';

const defaultAggKey = "aggKey";

export default class MultiZipcodeMap {
    constructor(componentConfig, qrsRecordInfo, qrsData) {
        try {
            this.config = componentConfig;
            this.record = qrsRecordInfo;
            this.data = qrsData;


            this.isVisible = false;
            this.config.displayEl.style.display = "none";
            const self = this;

            // handle the GeoJSON feature property name that we will use
            this.aggKeyName = defaultAggKey;
            if (this.config.advancedConfig?.map.aggKeyName) this.aggKeyName = this.config.advancedConfig.map.aggKeyName;

            // handle override settings in breakdowns.json for map tile info
            if (this.config.advancedConfig?.map.tiles) mapSettings.mapLayer.urlTemplate = this.config.advancedConfig.map.tiles;
            if (this.config.advancedConfig?.map.labelTiles) mapSettings.mapLayer.urlLabelsTemplate = this.config.advancedConfig.map.labelTiles;
            if (this.config.advancedConfig?.map.maxZoom) mapSettings.mapLayer.maxZoom = this.config.advancedConfig.map.maxZoom;

            // generate the valid zipcode list if it does not already exist
            if (typeof i2b2.CRC.QueryStatus.model.MultiGeoJSON.validZips === 'undefined') i2b2.CRC.QueryStatus.model.MultiGeoJSON.validZips = i2b2.CRC.QueryStatus.model.MultiGeoJSON.data.features.map((feature) => feature.properties[this.aggKeyName])


            // make sure that we have some colors defined
            if (typeof this.config?.advancedConfig.map === 'undefined') {
                console.error("MULTIZIPCODEMAP is missing configuration in breakdowns.json!");
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
                let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "MultiZipcodeMap/MultiZipcodeMap.html");
                if (!response.ok) {
                    console.error(`Failed to retrieve MultiZipcodeMap component template file: ${response.status}`);
                } else {
                    // render the layout template
                    const templateText = await response.text();
                    this.config.template = Handlebars.compile(templateText);

                    // deal with the zoom list
                    let zoomList = i2b2.CRC.QueryStatus.model.MultiGeoJSON.zooms;
                    if (Array.isArray(this.config.advancedConfig?.zooms)) {
                        zoomList = this.config.advancedConfig?.zooms;
                    }
                    this.config.zoomList = zoomList;

                    // deal with the aggregation levels
                    if (typeof aggModule !== 'undefined') {
                        this.config.aggregations = {
                            list: []
                        };
                        let aggregations = [];
                        for (const aggKey of Object.keys(aggModule)) {
                            let entry = {
                                title: aggModule[aggKey].title,
                                key: aggKey
                            };
                            if (aggModule[aggKey].default) {
                                entry.selected = true;
                                this.config.aggregations.current = aggKey;
                            }
                            if (aggModule[aggKey].tooltip) entry.tooltip = aggModule[aggKey].tooltip;
                            aggregations.push(entry);
                        }
                        aggregations.sort((a,b) => aggModule[a.key].order - aggModule[b.key].order);
                        this.config.aggregations.list = aggregations;
                    }

                    $(`<div class="map-header"></div><div class="map-target"></div>`).appendTo(this.config.displayEl);

                    this.rerender();

                    this.mapEl = $('.map-target', this.config.displayEl)[0];
                    this.config.displayEl.style.display = "block";
                    //  instantiate leaflet with initial zoom set

                    // set the initial zoom state as selected
                    for (let idx in zoomList) {
                        if (zoomList[idx].initial) {
                            $('.map-nav-link.zoom[data-index="' + idx + '"]', this.config.displayEl).addClass('selected');
                            this.config.currentZoomLink = idx;
                            this.map = L.map(this.mapEl).setView([zoomList[idx].lat, zoomList[idx].long], zoomList[idx].zoom);
                            break;
                        }
                    }
                    if (typeof this.map === 'undefined') {
                        this.map = L.map(this.mapEl).setView([5.00339434502215, 21.26953125], 3);
                    }

                    // capture zoom and move events
                    const clearSelectedZoom = (e) => {
                        $('.map-nav-link.zoom', self.config.displayEl).removeClass('selected');
                        delete this.config.currentZoomLink;
                    };
                    this.map.on('zoomstart', clearSelectedZoom);
                    this.map.on('movestart', clearSelectedZoom);

                    // add Map image layer
                    let options = {maxZoom: mapSettings.mapLayer.maxZoom}
                    if (typeof mapSettings.mapLayer.attribution !== 'undefined') options.attribution = mapSettings.mapLayer.attribution;
                    L.tileLayer(mapSettings.mapLayer.urlTemplate, options).addTo(this.map);

                    // see if we create a labels pane
                    if (typeof mapSettings.mapLayer.urlLabelsTemplate !== 'undefined') {
                        this.map.createPane('labels');
                        let labelsPane = this.map.getPane('labels');
                        labelsPane.style.zIndex = 650;
                        labelsPane.style.pointerEvents = 'none';
                        L.tileLayer(mapSettings.mapLayer.urlLabelsTemplate, {
                            pane: 'labels'
                        }).addTo(this.map);
                    }


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


                    // create a legend control if it is configured
                    if (typeof this.config.advancedConfig?.legendBox.templates !== 'undefined') {
                        // create a hoverbox control
                        const legendConfig = self.config.advancedConfig.legendBox;
                        let options = {};
                        if (typeof legendConfig.position !== 'undefined') options.position = legendConfig.position;
                        this.legendbox = L.control(options);
                        this.legendbox.onAdd = (map) => {
                            let className = "legend-box";
                            if (typeof legendConfig.className !== 'undefined') className = className + ' ' + legendConfig.className;
                            self.legendbox._div = L.DomUtil.create('div', className);
                            self.legendbox._div.style.display = 'none';
                            self.legendbox.update();
                            self.legendbox._div.style.display = '';
                            return self.legendbox._div;
                        };
                        this.legendbox.update = (data) => {
                            if (typeof self.legendbox._div === 'undefined') return; // fixes race condition bug
                            const colorsConfig = self.config.advancedConfig.map.colors;
                            let entriesHtml = [];
                            if (data) {
                                for (let i=0; i < data.length; i++) {
                                    let entryData = {
                                        color: colorsConfig[i].color,
                                        min: data[i].min,
                                        max: data[i].max
                                    };
                                    // figure out our default template to use
                                    let templateName;
                                    if (typeof legendConfig.templates["auto"] !== 'undefined') {
                                        templateName = "auto";
                                    } else if (typeof legendConfig.templates["min-max"] !== 'undefined') {
                                        templateName = "min-max";
                                    }
                                    // see if we override based on min or max being set on the map's color config entry
                                    if (typeof colorsConfig[i].min === 'undefined' && typeof colorsConfig[i].max === 'undefined') {
                                        // switch to auto template if it exists
                                        if (typeof legendConfig.templates["auto"] !== 'undefined') templateName = "auto";
                                    } else if (typeof colorsConfig[i].min === 'undefined') {
                                        // switch to no-min
                                        if (typeof legendConfig.templates["no-min"] !== 'undefined') templateName = "no-min";
                                        entryData.max = colorsConfig[i].max;
                                    } else if (typeof colorsConfig[i].max === 'undefined') {
                                        // switch to no-max
                                        if (typeof legendConfig.templates["no-max"] !== 'undefined') templateName = "no-max";
                                        entryData.min = colorsConfig[i].min;
                                    } else {
                                        // min and max are both defined
                                        entryData.min = colorsConfig[i].min;
                                        entryData.max = colorsConfig[i].max;
                                        // switch to min-max template if it exists
                                        if (typeof legendConfig.templates["min-max"] !== 'undefined') templateName = "min-max";
                                    }
                                    // generate the templated output
                                    entriesHtml.push(func_processTemplate(legendConfig.templates[templateName], entryData));
                                }
                            } else {
                                for (let i = 0; i < colorsConfig.length; i++) {
                                    let entryData = {color: colorsConfig[i].color};
                                    // figure out our default template to use
                                    let templateName;
                                    if (typeof legendConfig.templates["auto"] !== 'undefined') {
                                        templateName = "auto";
                                    } else if (typeof legendConfig.templates["min-max"] !== 'undefined') {
                                        templateName = "min-max";
                                    }
                                    // see if we override based on min or max being set on the map's color config entry
                                    if (typeof colorsConfig[i].min === 'undefined' && typeof colorsConfig[i].max === 'undefined') {
                                        // switch to auto template if it exists
                                        if (typeof legendConfig.templates["auto"] !== 'undefined') templateName = "auto";
                                    } else if (typeof colorsConfig[i].min === 'undefined') {
                                        // switch to no-min
                                        if (typeof legendConfig.templates["no-min"] !== 'undefined') templateName = "no-min";
                                        entryData.max = colorsConfig[i].max;
                                    } else if (typeof colorsConfig[i].max === 'undefined') {
                                        // switch to no-max
                                        if (typeof legendConfig.templates["no-max"] !== 'undefined') templateName = "no-max";
                                        entryData.min = colorsConfig[i].min;
                                    } else {
                                        // min and max are both defined
                                        entryData.min = colorsConfig[i].min;
                                        entryData.max = colorsConfig[i].max;
                                        // switch to min-max template if it exists
                                        if (typeof legendConfig.templates["min-max"] !== 'undefined') templateName = "min-max";
                                    }
                                    // generate the templated output
                                    entriesHtml.push(func_processTemplate(legendConfig.templates[templateName], entryData));
                                }
                            }
                            if (entriesHtml.length > 0) {
                                let entries = entriesHtml.join("\n");
                                // we have info to display
                                if (legendConfig.templates.root) {
                                    // insert the entries into the root template (if it exists)
                                    self.legendbox._div.innerHTML = func_processTemplate(legendConfig.templates.root, {entries: entries});
                                } else {
                                    self.legendbox._div.innerHTML = entries;
                                }
                                self.legendbox._div.style.opacity = 1;
                            } else {
                                // hide the legend box until we have data
                                self.hoverbox._div.style.opacity = 0;
                            }
                        };
                        this.legendbox.addTo(this.map);
                    }

                    if (this.isVisible === true) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";

                    this.update();
                }
            }).call(this);
        } catch(e) {
            console.error("Error in QueryStatus:MultiZipcodeMap.constructor()");
        }
    }

    rerender() {
        if (typeof this.mapEl === 'undefined') return;
        // get list of valid zip codes that we care about and collect min/max patient counts while at it
        let validData = {};
        let validNormalizers = new Set();
        for (let aggKey of Object.keys(this.data)) {
            if (this.data[aggKey].$aggLevel === this.config.aggregations.current && i2b2.CRC.QueryStatus.model.MultiGeoJSON.validZips.includes(aggKey)) {
                let temp = this.data[aggKey];
                if (this.config.currentNormalizer) {
                    if (Object.keys(temp.normalizers).includes(this.config.currentNormalizer)) {
                        const normalizeWith = temp.normalizers[this.config.currentNormalizer].count;
                        if (typeof normalizeWith !== 'undefined') {
                            validData[aggKey] = temp;
                        } else {
                            console.warn(`Missing normalizer "${this.config.currentNormalizer}" for aggKey:"${aggKey}"`);
                        }
                    }
                } else {
                    validData[aggKey] = temp;
                }
                // we want to get list of all normalizers in the selected aggregation level
                for (const foundNormalizer of Object.keys(temp.normalizers)) validNormalizers.add(foundNormalizer);
            }
        }

        // recalculate legend buckets
        let currentDataRange;
        if (this.config.currentNormalizer) {
            currentDataRange = this.config.dataRanges[this.config.aggregations.current].normalizers[this.config.currentNormalizer];
        } else {
            currentDataRange = this.config.dataRanges[this.config.aggregations.current];
        }
        let rangeCount = currentDataRange.max - currentDataRange.min;
        let rangeSize = rangeCount / this.config.advancedConfig.map.colors.length;
        // handle legendbox update
        if (typeof this.legendbox !== 'undefined') {
            let ranges = [];
            for (let i=0; i < this.config.advancedConfig.map.colors.length; i++) {
                ranges.push({
                    min: rangeSize * i + currentDataRange.min,
                    max: rangeSize * (i + 1) + currentDataRange.min
                });
            }
            this.legendbox.update(ranges);
        }

        let renderdata = {};
        // deal with normalizers
        let renderNormalizers = [...validNormalizers];
        if (renderNormalizers.length > 0) {
            renderNormalizers.sort();
            let tempData = [];
            for (const normName of renderNormalizers) {
                let tempEntry = {name: normName};
                if (typeof this.config.currentNormalizer !== 'undefined' && normName === this.config.currentNormalizer) tempEntry.selected = true;
                tempData.push(tempEntry);
            }
            renderdata.normalizerList = tempData;
            if (this.config.currentNormalizer) renderdata.currentNormalizer = this.config.currentNormalizer;
        }
        // deal with the zoom list
        renderdata.zoomList = i2b2.CRC.QueryStatus.model.MultiGeoJSON.zooms;
        if (Array.isArray(this.config.advancedConfig?.zooms)) {
            renderdata.zoomList = this.config.advancedConfig?.zooms;
        }
        // deal with the aggregation levels
        if (typeof aggModule !== 'undefined') {
            renderdata.aggregationList = this.config.aggregations.list;
        }

        $('.map-header',this.config.displayEl).html(this.config.template(renderdata));

        // TODO: Rehighlight the selected links

        // set the zoom state as selected
        if (this.config.currentZoomLink) {
            $(`.map-nav-link.zoom[data-index="${this.config.currentZoomLink}"]`, this.config.displayEl).addClass('selected');
        }
        if (this.config.aggregations.current) {
            $(`.map-nav-link.agg`, this.config.displayEl).removeClass('selected');
            $(`.map-nav-link.agg[data-agg-key="${this.config.aggregations.current}"]`, this.config.displayEl).addClass('selected');
        }

        // connect the zoom link click events
        $('.map-nav-link.zoom', this.config.displayEl).on('click', (e)=>{
            let data = e.currentTarget.dataset;
            this.config.currentZoomLink = data.index;
            this.map.setView([data.lat, data.long], data.zoom);
            // delay by 50ms because we are going to lose the link as we just started a viewport change
            const closureEl = e.currentTarget;
            setTimeout(()=>{
                $(closureEl).addClass('selected');
            }, 50);
        });
        // connect the aggregation links
        if (typeof aggModule !== 'undefined') {
            $('.map-nav-link.agg', this.config.displayEl).on('click', ((e)=> {
                let aggKey = e.currentTarget.dataset.aggKey;
                if (this.config.aggregations.current !== aggKey) {
                    this.config.aggregations.current = aggKey;
                    // change styles
                    $('.map-nav-link.agg.selected', this.config.displayEl).removeClass('selected');
                    $(e.currentTarget).addClass('selected');
                    // rerender
                    this.rerender();
                }
            }).bind(this));
        }
        // connect the normalizer links
        $('.map-nav-link.normzr', this.config.displayEl).on('click', ((e)=> {
            let normKey = e.currentTarget.dataset.normKey;
            if (this.config.currentNormalizer !== normKey) {
                this.config.currentNormalizer = normKey;
                // change styles
                $('.map-nav-link.normzr.selected', this.config.displayEl).removeClass('selected');
                $(e.currentTarget).addClass('selected');
                // rerender
                this.rerender();
                $('.clear-normalizer').removeClass('selected');
            }
        }).bind(this));
        $('.clear-normalizer', this.config.displayEl).on('click', (e)=> {
            delete this.config.currentNormalizer;
            $(e.currentTarget).addClass('selected');
            $('.map-nav-link.normzr.selected', this.config.displayEl).removeClass('selected');
            this.rerender();
        });


        // generate list of valid GeoJSON features
        let foundZips = Object.keys(validData);
        let featureZipAttribute = "";
        let geoJSON = {
            type: "FeatureCollection",
            features: []
        }
        i2b2.CRC.QueryStatus.model.MultiGeoJSON.data.features.forEach((feature) => {
            const currentZip = feature.properties[this.aggKeyName];
            if (typeof validData[currentZip] !== 'undefined') {
                // only insert feature if we have some data for the zip code
                let featureCopy = structuredClone(feature);
                // copy over the data from the server
                featureCopy.properties = {...validData[currentZip]};
                geoJSON.features.push(featureCopy);
            }
        });


        // interaction/helper functions
        // ---------------------------
        const func_StylingNorm = ((feature) => {
            let ret = {};
            if (this.config.currentNormalizer) {
                ret.fillColor = feature.properties.normalizers[this.config.currentNormalizer].color;
            } else {
                ret.fillColor = feature.properties.color;
            }
            // override styles if we have those options set
            for (let attrib in this.config.advancedConfig.map?.styles.norm) {
                ret[attrib] = this.config.advancedConfig.map?.styles.norm[attrib];
            }
            // remove highlighting in legendbox if it is active
            if (typeof this.legendbox !== 'undefined') $("*.selected", this.legendbox._div).removeClass("selected");
            return ret;
        }).bind(this);
        // ---------------------------
        const func_StylingHighlight = ((e) => {
            let layer = e.target;
            let style = {};
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
            // add highlighting in legendbox if it is active
            if (typeof this.legendbox !== 'undefined') {
                let color;
                if (this.config.currentNormalizer) {
                    color = layer.feature.properties.normalizers[this.config.currentNormalizer].color;
                } else {
                    color = layer.feature.properties.color;
                }
                if (typeof color !== 'undefined') $('*[data-color="' + color + '"]', this.legendbox._div).addClass('selected');
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

    }

    update(inputData) {
        if (this.errors || typeof inputData === 'undefined') return false; // don't display (no data yet)
        try {

            // get the breakdown data information (if present)
            let resultXML = i2b2.h.XPath(inputData, "//xml_value");
            if (resultXML.length === 0) return false; // don't display (no data yet)
            resultXML = resultXML[0].firstChild.nodeValue;
            // parse the data and put the results into the new data slot
            this.data = func_processData(resultXML);
            if (Object.keys(this.data).length === 0) return false; // don't display (no data yet)


            this.config.displayEl.style.display = "none";

            // get list of valid zip codes that we care about and collect min/max patient counts while at it
            let dataRanges = {};
            let validData = {};
            let minCount = Infinity;
            let maxCount = -Infinity;
            for (let zip of Object.keys(this.data)) {
                if (i2b2.CRC.QueryStatus.model.MultiGeoJSON.validZips.includes(zip)) {
                    let temp = this.data[zip];
                    if (temp.$aggLevel && typeof temp.error === 'undefined') {
                        if (!dataRanges[temp.$aggLevel]) {
                            dataRanges[temp.$aggLevel] = {
                                min: Infinity,
                                max: -Infinity,
                                normalizers: {}
                            }
                        }
                        // update the range data
                        if (typeof temp.count !== 'undefined') {
                            dataRanges[temp.$aggLevel].min = Math.min(temp.count, dataRanges[temp.$aggLevel].min);
                            dataRanges[temp.$aggLevel].max = Math.max(temp.count, dataRanges[temp.$aggLevel].max);
                            // update the normalizer ranges
                            for (const normalizerName of Object.keys(temp.normalizers)) {
                                if (!dataRanges[temp.$aggLevel].normalizers[normalizerName]) {
                                    dataRanges[temp.$aggLevel].normalizers[normalizerName] = {
                                        min: Infinity,
                                        max: -Infinity
                                    };
                                }
                                if (temp.normalizers[normalizerName].count) {
                                    let normTemp = dataRanges[temp.$aggLevel].normalizers[normalizerName];
                                    normTemp.min = Math.min(temp.count / temp.normalizers[normalizerName].count, normTemp.min);
                                    normTemp.max = Math.max(temp.count / temp.normalizers[normalizerName].count, normTemp.max);
                                } else {
                                    let normTemp = dataRanges[temp.$aggLevel].normalizers[normalizerName];
                                    normTemp.min = Math.min(0, normTemp.min);
                                    normTemp.max = Math.max(0, normTemp.max);
                                }
                            }
                        }
                        // save the record as valid data
                        validData[zip] = temp;
                    }
                }
            }
            this.config.dataRanges = dataRanges;

            // go through the data again and calculate which color bucket it falls into
            const rangeBucketCount = this.config.advancedConfig.map.colors.length;
            for (const aggKey of Object.keys(validData)) {
                const entryRoot = validData[aggKey];
                const rootRanges = dataRanges[entryRoot.$aggLevel];
                // set the color bucket for the main count value
                let rangeSize = (rootRanges.max - rootRanges.min) / rangeBucketCount;
                let bucketIdx = Math.floor((entryRoot.count - rootRanges.min) / rangeSize);
                if (isNaN(bucketIdx)) {
                    validData[aggKey].color = "none";
                } else {
                    if (bucketIdx < 0) bucketIdx = 0;
                    if (bucketIdx > rangeBucketCount - 1) bucketIdx = rangeBucketCount - 1;
                    validData[aggKey].color = this.config.advancedConfig.map.colors[bucketIdx].color;
                }
                // set the color bucket for each of the normalizations
                for (const normalizationKey of Object.keys(entryRoot.normalizers)) {
                    const normEntry = entryRoot.normalizers[normalizationKey];
                    const normRange = rootRanges.normalizers[normalizationKey];
                    if (normRange && normEntry.count) {
                        rangeSize = (normRange.max - normRange.min) / rangeBucketCount;
                        try {
                            bucketIdx = Math.floor(((entryRoot.count / normEntry.count) - normRange.min) / rangeSize);
                        } catch (e) {
                            bucketIdx = NaN;
                        }
                        if (isNaN(bucketIdx)) {
                            normEntry.
                                color = "none";
                        } else {
                            if (bucketIdx < 0) bucketIdx = 0;
                            if (bucketIdx > rangeBucketCount - 1) bucketIdx = rangeBucketCount - 1;
                            normEntry.color = this.config.advancedConfig.map.colors[bucketIdx].color;
                        }
                    } else {
                        normEntry.color = "none";
                    }
                }
            }

            this.rerender();

        } catch (e) {
            console.error("Error in QueryStatus:MultiZipcodeMap.update()");
            return false;
        }
        if (this.isVisible) {
            this.config.displayEl.style.display = "block";
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        }
        return true;
    }


    redraw(width) {
        if (this.errors) return;
        try {
            if (this.map) this.map.invalidateSize();
            if (this.isVisible) this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
        } catch(e) {
            console.error("Error in QueryStatus:MultiZipcodeMap.redraw()");
        }
    }


    show() {
        if (this.errors) return false;
        try {
            this.isVisible = true;
            if (typeof this.config.parentTitleEl !== 'undefined') this.config.parentTitleEl.innerHTML = this.record.title;
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'block';
            this.config.displayEl.style.display = 'block';
            this.config.displayEl.parentElement.style.height = this.config.displayEl.scrollHeight + "px";
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:MultiZipcodeMap.show()");
        }
    }


    hide() {
        try {
            this.isVisible = false;
            this.config.displayEl.style.display = 'none';
            if (this.config.dropdownEl) this.config.dropdownEl.style.display = 'none';
            return true;
        } catch(e) {
            console.error("Error in QueryStatus:MultiZipcodeMap.hide()");
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
        let options = {};
        let prettyNum = false;
        if (varname.substring(0,1) === '~') {
            varname = varname.substring(1);
            prettyNum = true;
            // by default round to integer
            options.minimumFractionDigits = 0;
            options.maximumFractionDigits = 0;
        }
        let decIdx = varname.lastIndexOf('.');
        if (decIdx > 0) {
            let decVal = parseInt(varname.substring(decIdx + 1));
            varname = varname.substring(0,decIdx);
            // defined fractional precision
            options.minimumFractionDigits = decVal;
            options.maximumFractionDigits = decVal;
        }
        let significantIdx = varname.lastIndexOf('|');
        if (significantIdx > 0) {
            let significantVal = parseInt(varname.substring(significantIdx + 1));
            varname = varname.substring(0, significantIdx);
            // defined significance precision
            options.maximumSignificantDigits = significantVal;
        }

        if (typeof data[varname] !== 'undefined') {
            let dataString = data[varname];
            if (prettyNum) dataString = new Intl.NumberFormat(navigator.language, options).format(Number(dataString));
            ret = ret.replaceAll(templateVar, dataString);
        } else {
            ret = ret.replaceAll(templateVar, '');
        }
    }
    return ret;
};

// load the GeoJSON data
(async function() {
    try {
        // load GeoJSON data
        let response = await fetch(i2b2.CRC.QueryStatus.baseURL + "MultiZipcodeMap/GeoJSON/load_list.json");
        if (!response.ok) throw new Error(`Failed to retreve MultiZipcodeMap/GeoJSON/load_list.json file: ${response.status}`);
        const geojsonFiles = await response.json();

        response = await fetch(i2b2.CRC.QueryStatus.baseURL + "MultiZipcodeMap/zoom_list.json");
        if (!response.ok) throw new Error(`Failed to retreve MultiZipcodeMap/zoom_list.json file: ${response.status}`);
        const zoomLinks = await response.json();

        i2b2.CRC.QueryStatus.model.MultiGeoJSON = {
            "loadList": geojsonFiles,
            "data": false,
            "zooms": zoomLinks
        };

        let geojsonFetches = geojsonFiles.map((url) => {
            let request = new Request(i2b2.CRC.QueryStatus.baseURL + "MultiZipcodeMap/GeoJSON/" + url,{
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
                    console.error("Error while retreving GeoJSON/" + i2b2.CRC.QueryStatus.model.MultiGeoJSON.loadList[idx]);
                    console.dir(entry);
                } else {
                    if (i2b2.CRC.QueryStatus.model.MultiGeoJSON.data === false) {
                        i2b2.CRC.QueryStatus.model.MultiGeoJSON.data = entry.value;
                    } else {
                        entry.value.features.forEach((feature) => {
                            i2b2.CRC.QueryStatus.model.MultiGeoJSON.data.features.push(feature);
                        });
                    }
                    delete entry.value;
                }
            }
        });
    } catch (error) {
        console.error("Failed to initialize MultiZipcodeMap visualization module: ", error);
    }
})();



const func_processData = (xmlData) => {

    let ret = {};
    let params = i2b2.h.XPath(xmlData, 'descendant::data[@column]/text()/..');
    // short circuit exit because there is no data
    if (params.length === 0) return {};

    let extractorConfigs = [];
    for (const entry of Object.entries(aggModule)) {
        for (const finder of entry[1].extract) {
            extractorConfigs.push({
                "aggLevel": entry[0],
                "regex": finder.regex,
                "attribs": finder.attribs
            });
        }
    }

    for (let i = 0; i < params.length; i++) {
        const zipData = params[i].getAttribute("column");
        const floorThreshold = params[i].getAttribute("floorThresholdNumber");
        const obfuscatedNum = params[i].getAttribute("obfuscatedDisplayNumber");

        let extractedData = {};
        for (const tryExtract of extractorConfigs) {
            let extractResults = zipData.match(tryExtract.regex);
            if (extractResults) {
                // found! now extract data groups
                extractedData.$aggLevel = tryExtract.aggLevel;
                let extractIndex = 0;
                for (let attribName of tryExtract.attribs) {
                    extractIndex++;
                    let value = extractResults[extractIndex];
                    if (attribName instanceof Array) {
                        for (let name of attribName) {
                            extractedData[name] = value;
                        }
                    } else {
                        extractedData[attribName] = value;
                    }
                }
                break;
            }
        }

        if (Object.keys(extractedData).length > 0) {
            if (typeof ret[extractedData.$aggKey] === 'undefined') {
                ret[extractedData.$aggKey] = {
                    "normalizers": {}
                };
            }
            const zipCount = parseInt(params[i].firstChild.nodeValue);
            const displayCount = i2b2.CRC.QueryStatus.obfuscateFloorDisplayNumber(zipCount, floorThreshold, obfuscatedNum);
            let target = ret[extractedData.$aggKey];
            if (typeof extractedData.$normalizer !== 'undefined') {
                ret[extractedData.$aggKey].normalizers[extractedData.$normalizer] = {};
                target = {};
            }
            target = {
                count: zipCount,
                display: displayCount
            };
            for (let entry of Object.entries(extractedData)) {
                target[entry[0]] = entry[1];
            }
            if (typeof extractedData.$normalizer !== 'undefined') {
                ret[extractedData.$aggKey].normalizers[extractedData.$normalizer] = target;
            } else {
                ret[extractedData.$aggKey] = {...ret[extractedData.$aggKey], ...target};
            }
        }
    }

    // calculate the normalized values
    // ret[extractedData.$aggKey].normalizers[extractedData.$normalizer].$aggCount = ret[extractedData.$aggKey].count;
    // let calcValue;
    // try {
    //     calcValue = ret[extractedData.$aggKey].count /
    // } catch (e) {
    //     calcValue = 0;
    // }
    // let calc = ret[extractedData.$aggKey].count;
    // ret[extractedData.$aggKey].normalizers[extractedData.$normalizer].$nomalizedCalc = calcValue;


    return ret;
};