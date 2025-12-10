
// ---------------------------------------------------------------------------------------
// Color matrix selected according to Nowosad, Jakub. 2020. “How to Choose a Bivariate Color Palette?” August 25, 2020. [https://jakubnowosad.com/posts/2020-08-25-cbc-bp2/]
i2b2.Plugin = {
    colorMatrixDb: {
        "test": [
            ['#000000', '#ffffff', '#000000'],
            ['#ffffff', '#000000', '#ffffff'],
            ['#000000', '#ffffff', '#000000']
        ],
        "divseq": [
            ['#240d5e','#7f7f7f','#b30000'],
            ['#7b67ab','#bfbfbf','#f35926'],
            ['#c3b3d8','#e6e6e6','#ffcc80']
        ],
        "seqseq2": [
            ['#f3b300','#b36600','#000000'],
            ['#f3e6b3','#b3b3b3','#376387'],
            ['#f3f3f3','#b4d3e1','#509dc2']
        ],
        "greenblue": [
            ['#73ae80','#5a9178','#2a5a5b'],
            ['#b8d6be','#90b2b3','#567994'],
            ['#e8e8e8','#b5c0da','#6c83b5']
        ],
        "purplegold": [
            ['#9972af','#976b82','#804d36'],
            ['#cbb8d7','#c8ada0','#af8e53'],
            ['#e8e8e8','#e4d9ac','#c8b35a']
        ]
    },
    dataIds: ["dataset1", "dataset2"],
    hover: {
        "template": ""
    }
};
// ---------------------------------------------------------------------------------------
i2b2.Plugin.itemDropped = function(sdxData, e) {
    const targetId = e.target.id;

    // analyze the data and make sure that it is the proper type "PATIENT_ZIP_COUNT*"
    const regExPatientZip = /patient_zip_count/i;
    if (!regExPatientZip.test(sdxData.origData.result_type)) {
        // this is the wrong breakdown type
        indicateBadDrop(targetId);
        delete i2b2.model[targetId];
        return;
    }

    // mark target as now being set
    indicateGoodDrop(targetId);

    // get our target ID and save it in our state
    if (i2b2.model[targetId]) {
        // see if it is a different entry from what is currently specified (short circuit out of function if the same)
        if (sdxData.sdxInfo.sdxKeyValue === i2b2.model[targetId].sdx.sdxInfo.sdxKeyValue) return;
        // save the new information
        i2b2.model[targetId].sdx = sdxData;
        delete i2b2.model[targetId].dataXML;
        i2b2.model[targetId].dirty = true;
        // delete existing features if they have already been populated
        if (typeof i2b2.Plugin.geojson !== 'undefined') i2b2.Plugin.map.removeLayer(i2b2.Plugin.geojson);
    } else {
        i2b2.model[targetId] = {
            sdx: sdxData,
            buckets: 5,
            dirty: true
        }
    }
    i2b2.model.dirtyData = true;

    // get the query name from the query master
    const reqVars = {qm_key_value: sdxData.origData["QM_id"]};
    i2b2.ajax.CRC.getRequestXml_fromQueryMasterId(reqVars).then((result) => {
        i2b2.model[targetId].queryDefinition = result;

        // extract the data from the XML string
        const xmlDoc = (new DOMParser()).parseFromString(result, "application/xml");
        let xpathResult = xmlDoc.evaluate("//query_name", xmlDoc, null, XPathResult.STRING_TYPE, null);
        i2b2.model[targetId].title = xpathResult.stringValue;

        // save the retrieved info
        i2b2.state.save();

        // display our entry's data
        i2b2.Plugin.renderDatasetInfo(targetId);

        // DEBUG: WHAT IS THIS FOR? WHY WOULD I NEED THIS HERE?
        // const reqVars = { "qr_key_value": sdxData.sdxInfo.sdxKeyValue };
        // i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId(reqVars).then((breakdownXML) => {
        //     console.log(breakdownXML);
        // });


    }).catch((e) => {
        indicateBadDrop(targetId);
        delete i2b2.model[targetId];
        i2b2.state.save();
    });

    // process if 2 datasets have been set
    let setDatasets = document.querySelectorAll(".dataset.isSet");
    if (setDatasets.length == 2) {
        // unlock menu if both datasets have been set
        document.getElementById("header").classList.remove("locked");
    }
};


// ---------------------------------------------------------------------------------------
i2b2.Plugin.renderDatasetInfo = function(datasetId) {
    const targetDatasetEl = document.getElementById(datasetId);
    if (!targetDatasetEl) return;

    targetDatasetEl.textContent = i2b2.model[datasetId].title;
};


// ---------------------------------------------------------------------------------------
i2b2.Plugin.recalculateColors = function() {
    // copy/generate the color matrix
    if (!i2b2.model.settings.colorSet || !i2b2.Plugin.colorMatrixDb[i2b2.model.settings.colorSet]) {
        i2b2.model.settings.colorSet = Object.keys(i2b2.Plugin.colorMatrixDb)[0];
    }

    const dataIdX = i2b2.Plugin.dataIds[0];
    const dataIdY = i2b2.Plugin.dataIds[1];

    let targetColorMatrix = i2b2.Plugin.colorMatrixDb[i2b2.model.settings.colorSet];
    i2b2.model.activeColors = [];
    let lastCopyPosY = -1;
    for (let posY=0; posY < i2b2.model[dataIdY].buckets; posY++) {
        let tempRow = [];
        let mappingPosY = Math.floor((targetColorMatrix.length / i2b2.model[dataIdY].buckets) * posY);
        if (mappingPosY !== lastCopyPosY) {
            lastCopyPosY = mappingPosY;
            // we should map over this row
            let sourceRow = targetColorMatrix[mappingPosY];
            let lastCopyPosX = -1;
            for (let posX=0; posX < i2b2.model[dataIdX].buckets; posX++) {
                let mappingPosX = Math.floor((sourceRow.length / i2b2.model[dataIdX].buckets) * posX)
                if (mappingPosX !== lastCopyPosX) {
                    tempRow.push(sourceRow[mappingPosX]);
                    lastCopyPosX = mappingPosX;
                } else {
                    tempRow.push(false);
                }
            }
        } else {
            // row to be interpolated later
            for (let posX=0; posX < i2b2.model[dataIdX].buckets; posX++) {
                tempRow.push(false);
            }
        }
        // save the row
        i2b2.model.activeColors.push(tempRow);
    }

    const func_interpolateColorRange = (startColor, endColor, size) => {
        let start = RGBvalues.toColor(startColor);
        let end = RGBvalues.toColor(endColor);
        let step = {
            r: Math.round((end.r - start.r) / (size + 1)),
            g: Math.round((end.g - start.g) / (size + 1)),
            b: Math.round((end.b - start.b) / (size + 1))
        };
        let ret = [];
        for (let idx = 1; idx <= size; idx++) {
            const newColor = RGBvalues.toHTML(
                (start.r + (step.r * idx)),
                (start.g + (step.g * idx)),
                (start.b + (step.b * idx))
            );
            ret.push(newColor);
        }
        return ret;
    };

    // Interpolate the colors via rows
    for (let posY = 0; posY < i2b2.model[dataIdY].buckets; posY++) {
        let targetRow = i2b2.model.activeColors[posY];
        if (targetRow[0] !== false) {
            // the first bucket in the row is set so that means we can interpolate this row
            let trailingPos = 0;
            for (let leadingPos = 1; leadingPos < targetRow.length; leadingPos++) {
                if (targetRow[leadingPos] !== false) {
                    // interpolate the color range we found
                    const fillerColors = func_interpolateColorRange(targetRow[trailingPos],targetRow[leadingPos], leadingPos - trailingPos - 1);
                    // save the color range to the main color array
                    for (let copyIdx = 0; copyIdx < fillerColors.length; copyIdx++) {
                        i2b2.model.activeColors[posY][trailingPos + copyIdx + 1] = fillerColors[copyIdx];
                    }
                    // prepare to find the next empty range
                    trailingPos = leadingPos;
                }
            }
        }
    }

    // Interpolate the colors via columns now that all entries in the key rows are filled
    for (let posX = 0; posX < i2b2.model[dataIdX].buckets; posX++) {
        let trailingPos = 0;
        for (let leadingPos = 1; leadingPos < i2b2.model[dataIdY].buckets; leadingPos++) {
            if (i2b2.model.activeColors[leadingPos][posX] !== false) {
                // interpolate the color range we found
                const fillerColors = func_interpolateColorRange(i2b2.model.activeColors[trailingPos][posX], i2b2.model.activeColors[leadingPos][posX], leadingPos - trailingPos - 1);
                // save the color range to the main color array
                for (let copyIdx = 0; copyIdx < fillerColors.length; copyIdx++) {
                    i2b2.model.activeColors[trailingPos + copyIdx + 1][posX] = fillerColors[copyIdx];
                }
                // prepare to find the next empty range
                trailingPos = leadingPos;
            }
        }
    }

    i2b2.state.save();
};


// ---------------------------------------------------------------------------------------
i2b2.Plugin.toBucket = function(datasetName, value) {
    if (typeof i2b2.model[datasetName] !== 'object') return NaN;
    // bucketing function for the map variable
    const bucketSize = (i2b2.model[datasetName].max - i2b2.model[datasetName].min) / i2b2.model[datasetName].buckets;
    const calulated = Math.floor((value - i2b2.model[datasetName].min) / bucketSize);
    return Math.min((i2b2.model[datasetName].buckets - 1), Math.max(0, calulated));
};


// ---------------------------------------------------------------------------------------
i2b2.Plugin.renderMap = function() {
    if (!i2b2.model.dirtyData) return;

    // show that we are processing
    document.body.classList.add("working");

    // recalculate the map variables
    i2b2.Plugin.recalculateColors();

    // redisplay the legend
    i2b2.Plugin.legend.update();

    // get data for the zipcode maps if needed
    let promiseList = [];
    for (const targetId of i2b2.Plugin.dataIds) {
        if (typeof i2b2.model[targetId].dataXML === 'undefined')
            promiseList.push(
                i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId({"qr_key_value": i2b2.model[targetId].sdx.sdxInfo.sdxKeyValue})
            );
    }
    Promise.all(promiseList).then((resultsList) => {
        i2b2.model.mainData = {};
        // save the data's raw XML string
        for (const targetId of i2b2.Plugin.dataIds) {
            if (typeof i2b2.model[targetId].dataXML === 'undefined') {
                // save the XML
                i2b2.model[targetId].dataXML = resultsList.pop();
            }
        }

        // rebuild the main data structure using our (re)loaded XML data
        for (const targetId of i2b2.Plugin.dataIds) {
            let resultXML = getXPath(i2b2.model[targetId].dataXML, "//xml_value");
            if (resultXML.length === 0) {
                // XML does not contain the breakdown info
                indicateBadDrop(targetId);
                delete i2b2.model[targetId].dataXML;
            } else {
                resultXML = resultXML[0].firstChild.nodeValue;
                let minCount = Infinity;
                let maxCount = -Infinity;
                // parse the data and put the results into the new data slot
                let params = getXPath(resultXML, 'descendant::data[@column]/text()/..');
                for (let i = 0; i < params.length; i++) {
                    const zipData = params[i].getAttribute("column");
                    let zipSearch = zipData.match(i2b2.model.settings.zipRegEx);
                    if (zipSearch.length > 0) {
                        const zipCode = zipSearch[0].trim();
                        if (typeof i2b2.model.mainData[zipCode] === 'undefined') {
                            // initial creation the ZIP Code record
                            i2b2.model.mainData[zipCode] = {
                                text: zipData
                            };
                        }
                        // save the count value of the ZIP Code for the dataset
                        let count = params[i].firstChild.nodeValue;
                        i2b2.model.mainData[zipCode][targetId] = count;
                        // update the dataset's min/max values
                        minCount = Math.min(count, minCount);
                        maxCount = Math.max(count, maxCount);
                    }
                }
                // save the data's min/max values
                i2b2.model[targetId].min = minCount;
                i2b2.model[targetId].max = maxCount;
            }
        }

        // copy the data onto the mapping info
        let workingGeoJSON = {
            type: "FeatureCollection",
            features: []
        }
        i2b2.Plugin.GeoJSON.data.features.forEach((feature) => {
            const dataIdX = i2b2.Plugin.dataIds[0];
            const dataIdY = i2b2.Plugin.dataIds[1];
            const currentZip = feature.properties[i2b2.model.settings.zipAttribName];
            const mainDataLookup = i2b2.model.mainData[currentZip];
            if (typeof mainDataLookup !== 'undefined') {
                // only insert feature if we have some data for the zip code
                let featureCopy = structuredClone(feature);
                // copy over the data from the server
                for (let attrib in mainDataLookup) {
                    let attribValue = mainDataLookup[attrib];
                    featureCopy.properties[attrib] = attribValue;
                }
                // lookup the color from the color matrix
                const bucketX = i2b2.Plugin.toBucket(dataIdX, mainDataLookup[dataIdX]);
                const bucketY = i2b2.Plugin.toBucket(dataIdY, mainDataLookup[dataIdY]);
                if (isNaN(bucketX) || isNaN(bucketY)) {
                    featureCopy.properties.color = "none";
                } else {
                    featureCopy.properties.color = i2b2.model.activeColors[bucketY][bucketX];
                    featureCopy.properties.buckets = [bucketY, bucketX];
                }
                workingGeoJSON.features.push(featureCopy);
            }
        });



        // interaction/helper functions
        // ---------------------------
        const func_StylingNorm = (feat) => {
            const confStyles = i2b2.model.settings.styles;
            let ret = {
                fillColor: feat.properties.color
            };
            // override styles if we have those options set
            for (let attrib in confStyles?.norm) {
                ret[attrib] = confStyles.norm[attrib];
            }
            // // remove highlighting in legendbox if it is active
            // if (typeof this.legendbox !== 'undefined') $("*.selected", this.legendbox._div).removeClass("selected");
            return ret;
        };
        // ---------------------------
        const func_StylingHighlight = (e) => {
            const confStyles = i2b2.model.settings.styles;
            let layer = e.target;
            let style = {};
            // override styles if we have those options set
            for (let attrib in confStyles?.hover) {
                style[attrib] = confStyles?.hover[attrib];
            }
            layer.setStyle(style);
            layer.bringToFront();
            // handle hoverover box
            if (typeof i2b2.Plugin.hoverbox !== 'undefined') {
                i2b2.Plugin.hoverbox.update(layer.feature.properties);
            }
            // add selection to legend
            const buckets = layer.feature.properties.buckets;
            i2b2.Plugin.legend.hover(buckets[0],buckets[1]);
        };
        // ---------------------------
        const func_StylingReset = (e) => {
            // reset area styles
            i2b2.Plugin.geojson.resetStyle(e.target);
            // reset the hoverover box or hide it
            if (typeof i2b2.Plugin.hoverbox !== 'undefined') {
                i2b2.Plugin.hoverbox.update();
            }
            // remove selection in legend
            i2b2.Plugin.legend.hover();
        };
        // ---------------------------
        const func_onEachFeature = ((feature, layer) => {
            layer.on({
                mouseover: func_StylingHighlight,
                mouseout: func_StylingReset
            });
        }).bind(this);
        // ---------------------------



        // render the geoJSON data
        if (workingGeoJSON.features.length > 0) {
            // delete existing features if they have already been populated
            if (typeof i2b2.Plugin.geojson !== 'undefined') i2b2.Plugin.map.removeLayer(i2b2.Plugin.geojson);

            // add the features to the map
            i2b2.Plugin.geojson = L.geoJson(workingGeoJSON, {
                style: func_StylingNorm,
                onEachFeature: func_onEachFeature
            }).addTo(i2b2.Plugin.map);
        }

        // show that we are no longer processing
        document.body.classList.remove("working");
    });

    // reset dirty data flag
    i2b2.model.dirtyData = false;
    i2b2.state.save();
};



// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", ()=> {
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)

    // configure i2b2 drop targets
    for (const targEl of i2b2.Plugin.dataIds) {
        // drop event handlers used by this plugin
        i2b2.sdx.AttachType(targEl, "PRC");
        i2b2.sdx.setHandlerCustom(targEl, "PRC", "DropHandler", i2b2.Plugin.itemDropped);
    }

    // attach UI event handlers
    document.getElementsByClassName("hide-show")[0].addEventListener('click', (e) => {
        const header = document.getElementById("header");
        if (header.classList.contains("locked")) return;
        if (header.classList.contains("dropped")) {
            // we are hiding the menu
            header.classList.remove("dropped");
            // see if we need to rerender the map
            if (i2b2.model.dirtyData) {
                i2b2.Plugin.renderMap();
            }
        } else {
            header.classList.add("dropped");
        }
    });

    document.getElementsByClassName("instructions-icon")[0].addEventListener('click', (e) => {
        alert("display instructions modal window");
    });



    // get the zoom settings from the main UI's QueryStatus model
    i2b2.model.dirtyData = true;
    i2b2.authorizedTunnel.variable["i2b2.CRC.QueryStatus.model.GeoJSON"].then((data) => {
        // save all the data
        i2b2.Plugin.GeoJSON = data;

        // TODO: extract and process the zooms data
        if (data.zooms) {
            if (data.zooms.length > 0) {
                const ulZoomList = document.getElementById("zoom-list");
                data.zooms.forEach((item, index) => {
                    const li = document.createElement('li');
                    const span = document.createElement('span');
                    span.className = 'zoom-link';
                    span.dataset.index = index;
                    span.dataset.lat = item.lat;
                    span.dataset.long = item.long;
                    span.dataset.zoom = item.zoom;
                    span.title = item.tooltip;
                    span.textContent = item.title;
                    li.appendChild(span);
                    ulZoomList.appendChild(li);
                });

                // connect the zoom link click events
                document.querySelectorAll('.zoom-link').forEach((el) => {
                    el.addEventListener('click', (e) => {
                        let data = e.currentTarget.dataset;
                        i2b2.Plugin.map.setView([data.lat, data.long], data.zoom);
                        // delay by 50ms because we are going to lose the link as we just started a viewport change
                        const closureEl = e.currentTarget;
                        setTimeout(()=>{
                            document.querySelectorAll('.zoom-link').forEach((li) => li.classList.remove('selected'));
                            closureEl.classList.add('selected');
                        }, 50);
                    });
                });

                // set the initial zoom state as selected
                for (let idx in data.zooms) {
                    if (data.zooms[idx].initial) {
                        const initialZoomEl = document.querySelector('.zoom-link[data-index="' + idx + '"]');
                        const data = initialZoomEl.dataset;
                        initialZoomEl.classList.add('selected');
                        setTimeout(()=> i2b2.Plugin.map.setView([data.lat, data.long], data.zoom), 500);
                        break;
                    }
                    }
                    }
                    }
    });

    // instantiate Leaflet map
    i2b2.Plugin.mapEl = document.getElementById('map-target');
    const map = L.map(i2b2.Plugin.mapEl).setView([5.00339434502215, 21.26953125], 3);
    const settings = i2b2.model.settings;
    i2b2.Plugin.map = map;
    if (settings.initialView) {
        map.setView([settings.initialView.lat, settings.initialView.lng], settings.initialView.zoom);
    }
    // tile layer
    L.tileLayer(
        settings.tiles,
        {maxZoom: settings.maxZoom}
    ).addTo(map);

    // labels layer
    map.createPane('labels');
    let labelsPane = map.getPane('labels');
    labelsPane.style.zIndex = 650;
    labelsPane.style.pointerEvents = 'none';
    L.tileLayer(
        settings.labelTiles,
        {pane: 'labels'}
    ).addTo(map);

    // capture zoom and move events and unselect zoom level link if selected
    const clearSelectedZoom = (e) => {
        document.querySelectorAll('.zoom-link').forEach((el) => el.classList.remove('selected'));
    };
    map.on('zoomstart', clearSelectedZoom);
    map.on('movestart', clearSelectedZoom);
    

    // create a hoverbox control
    let hoverOptions = {};
    if (typeof settings.hoverBox.position !== 'undefined') hoverOptions.position = settings.hoverBox.position;
    let hoverbox = L.control(hoverOptions);
    i2b2.Plugin.hoverbox = hoverbox;
    hoverbox.onAdd = (map) => {
        const self = i2b2.Plugin.hoverbox;
        let className = "hoverinfo-box";
        self._div = L.DomUtil.create('div', className);
        self._div.style.display = 'none';
        self.update();
        self._div.style.display = '';
        return self._div;
    };
    hoverbox.update = (data) => {
        const self = i2b2.Plugin.hoverbox;
        if (typeof self._div === 'undefined') return; // fixes race condition bug
        if (data) {
            // lookup the data for the ZIP Code
            const lookupData = {
                "dataY-text": i2b2.model[i2b2.Plugin.dataIds[0]].title,
                "dataX-text": i2b2.model[i2b2.Plugin.dataIds[1]].title,
                "dataY-count": data[i2b2.Plugin.dataIds[0]],
                "dataX-count": data[i2b2.Plugin.dataIds[1]]
            }
            const allData = {...data, ...lookupData};

            self._div.innerHTML = processTemplate(settings.hoverBox.template, allData);
            self._div.style.opacity = 1;
        } else {
            if (typeof settings.hoverBox.default !== 'undefined') {
                // display default msg
                self._div.innerHTML = settings.hoverBox.default;
                self._div.style.opacity = 1;
            } else {
                // hide the hover box
                self._div.style.opacity = 0;
            }
        }
    };
    hoverbox.addTo(map);


    // create a legend control
    let legendOptions = {position: 'bottomleft'};
    if (typeof settings.legend?.position !== 'undefined') legendOptions.position = settings.legend.position;
    let legendbox = L.control(legendOptions);
    i2b2.Plugin.legend = legendbox;
    legendbox.onAdd = (map) => {
        const self = i2b2.Plugin.legend;
        let className = "legend-box";
        self._div = L.DomUtil.create('div', className);
        // self._div.style.display = 'none';
        // self.update();
        // self._div.style.display = '';

        return self._div;
    };
    legendbox.hover = (x, y) => {
        const self = i2b2.Plugin.legend;
        for (let temp of self._svg.querySelectorAll('rect')) {
            temp.setAttribute("stroke", "#fff");
        }
        if (typeof x === 'undefined') return;

        let highlightColor;
        if (i2b2.model.settings?.legend.highlight) {
            highlightColor = i2b2.model.settings?.legend.highlight;
        } else {
            // by default, use the inverse color of the selected coordinate
            let inverseColor = RGBvalues.toColor(i2b2.model.activeColors[y][x]);
            ['r','g','b'].forEach((color) => {
                inverseColor[color] = 255 - inverseColor[color];
            });
            highlightColor = RGBvalues.toHTML(inverseColor.r, inverseColor.g, inverseColor.b);
        }
        let target = self._svg.querySelector(`rect[data-coordinate="${x}-${y}"]`);
        if (target) target.setAttribute("stroke", highlightColor);
    };
    legendbox.update = (data) => {
        const self = i2b2.Plugin.legend;
        const svgNS = "http://www.w3.org/2000/svg";
        // Create the SVG element
        const svg = document.createElementNS(svgNS, "svg");
        // Set attributes for the SVG element (optional, but common)
        // svg.setAttribute("width", "300");
        // svg.setAttribute("height", "200");
        // svg.setAttribute("style", "border: 1px solid black;");
        // Append the SVG element to the document
        self._div.innerHTML = "";
        self._div.appendChild(svg);
        self._svg = svg;


        // Clear any existing content
        //svg.innerHTML = '';
        const colorMatrix = i2b2.model.activeColors;

        // Get dimensions
        const rows = colorMatrix.length;
        const cols = colorMatrix[0].length;

        // Define block size and spacing
        const blockSize = 16;
        const spacing = 2;
        const matrixOffsetX = 16;
        const matrixOffsetY = 16;
        const blockWithSpacing = blockSize + spacing;

        // Calculate SVG dimensions
        let width = cols * blockWithSpacing;
        let height = rows * blockWithSpacing;

        // Set SVG attributes
        // svg.setAttribute('width', width);
        // svg.setAttribute('height', height);
        // svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // add a group for the matrix elements
        const matrixGroup = document.createElementNS(svgNS,"g");
        matrixGroup.setAttribute("name","color-matrix");
        matrixGroup.setAttribute("transform", `translate(${matrixOffsetX}, 0)`);
        svg.appendChild(matrixGroup);

        // Generate rectangles
        // Note: Matrix is inverted vertically so [0,0] appears at bottom-left
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const rect = document.createElementNS(svgNS, "rect");

                // Calculate position (invert row to make bottom-left the origin)
                const x = col * blockWithSpacing;
                const y = (rows - row - 1) * blockWithSpacing;

                rect.setAttribute('x', x);
                rect.setAttribute('y', y);
                rect.setAttribute('width', blockSize);
                rect.setAttribute('height', blockSize);
                rect.setAttribute('fill', colorMatrix[row][col]);
                rect.setAttribute('stroke', '#fff');
                rect.setAttribute('stroke-width', '1');
                rect.setAttribute('data-coordinate', `${row}-${col}`);

                matrixGroup.appendChild(rect);
            }
        }

        // add "low" text
        const textLow = document.createElementNS(svgNS, "text");
        textLow.textContent = "Low";
        textLow.setAttribute("x", 0);
        textLow.setAttribute("y", 0);
        textLow.setAttribute("fill", "#000");
        textLow.setAttribute("font-size", "14");
        textLow.setAttribute("transform", "rotate(-45)");
        svg.appendChild(textLow);
        // find our placement
        const textLowSize = textLow.getBBox();
        const textLowX = 5;
        const textLowY = (rows * blockWithSpacing) + textLow.scrollHeight;
        height = textLowY;
        textLow.setAttribute("transform", `translate(7, ${textLowY}) rotate(-45)`);

        // shift the location of the matrix to adjust for the new text
        matrixGroup.setAttribute("transform", `translate(${textLow.scrollWidth}, 0)`);


        // add "Cohort 1" text
        const textCohort1 = document.createElementNS(svgNS, "text");
        textCohort1.textContent = "Cohort 1";
        textCohort1.setAttribute("x", 0);
        textCohort1.setAttribute("y", 0);
        textCohort1.setAttribute("fill", "#000");
        textCohort1.setAttribute("font-size", "16");
        textCohort1.setAttribute("font-weight", "bold");
        svg.appendChild(textCohort1);
        textCohort1.setAttribute("transform", `translate (16, ${height - 40}) rotate(-90)`);

        // add "Cohort 2" text
        const textCohort2 = document.createElementNS(svgNS, "text");
        textCohort2.textContent = "Cohort 2";
        textCohort2.setAttribute("x", 0);
        textCohort2.setAttribute("y", 0);
        textCohort2.setAttribute("fill", "#000");
        textCohort2.setAttribute("font-size", "16");
        textCohort2.setAttribute("font-weight", "bold");
        svg.appendChild(textCohort2);
        textCohort2.setAttribute("transform", `translate (40, ${height})`);


        // recalculate the SVG size and viewport
        width = cols * blockWithSpacing - spacing + textLow.scrollWidth;
        height = rows * blockWithSpacing - spacing + textLow.scrollHeight + 5;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);


    };
    legendbox.addTo(map);
});


const processTemplate = (template, data) => {
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


// ---------------------------------------------------------------------------------------
const indicateBadDrop = (datasetId) => {
    const targetEl = document.getElementById(datasetId);
    if (!targetEl) return;
    targetEl.classList.remove("isSet");
    targetEl.classList.remove("dragging");
    targetEl.style.backgroundColor = "#F00";
    setTimeout(() => {
        targetEl.style.transition = "background-color 0.3s ease-in-out";
        targetEl.style.backgroundColor = "";
    }, 10);
    setTimeout(() => {
        targetEl.style.transition = "";
    }, 750);

};


// ---------------------------------------------------------------------------------------
const indicateGoodDrop = (datasetId) => {
    const targetEl = document.getElementById(datasetId);
    if (!targetEl) return;
    targetEl.classList.add("isSet");
    targetEl.classList.remove("dragging");
    targetEl.style.backgroundColor = "#0F0";
    setTimeout(() => {
        targetEl.style.transition = "background-color 0.3s ease-in-out";
        targetEl.style.backgroundColor = "";
    }, 10);
    setTimeout(() => {
        targetEl.style.transition = "";
    }, 750);
};


// ---------------------------------------------------------------------------------------
const getXPath = function(xmlDoc, xPath) {
    var retArray = [];

    // do some inline translation of the xmlDoc from string to XMLDocument
    if (typeof xmlDoc === 'string') {
        // kill namespaces - needed fix for Firefox
        xmlDoc = xmlDoc.replace(/(<\/?)\w+:(\w+[^>]*>)/g, "$1$2")
        try {
            let parser = new DOMParser();
            let test = parser.parseFromString(xmlDoc, "text/xml");
            xmlDoc = test.documentElement;
        } catch(e) {
            return retArray;
        }
    }

    if (!xmlDoc) {
        console.warn("An invalid XMLDoc was passed to i2b2.h.XPath");
        return retArray;
    }
    try {
        if (window.ActiveXObject  || "ActiveXObject" in window) {
            if((!!navigator.userAgent.match(/Trident.*rv\:11\./)) && (typeof xmlDoc.selectNodes == "undefined")) { // IE11 handling
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.loadXML(new XMLSerializer().serializeToString(xmlDoc));
                xmlDoc = doc;
            }

            // Microsoft's XPath implementation
            // HACK: setProperty attempts execution when placed in IF statements' test condition, forced to use try-catch
            try {
                xmlDoc.setProperty("SelectionLanguage", "XPath");
            } catch(e) {
                try {
                    xmlDoc.ownerDocument.setProperty("SelectionLanguage", "XPath");
                } catch(e) {}
            }
            retArray = xmlDoc.selectNodes(xPath);

        } else if (document.implementation && document.implementation.createDocument) {
            // namespace resolver
            let nsResolver = (prefix) => { return "http://" + prefix; };
            // W3C XPath implementation (Internet standard)
            let ownerDoc = xmlDoc.ownerDocument;
            if (!ownerDoc) {ownerDoc = xmlDoc; }
            let nodes = ownerDoc.evaluate(xPath, xmlDoc, nsResolver, XPathResult.ANY_TYPE, null);
            let rec = nodes.iterateNext();
            while (rec) {
                retArray.push(rec);
                rec = nodes.iterateNext();
            }
        }
    } catch (e) {
        console.error("An error occurred while trying to perform XPath query.");
        console.dir(e);
    }
    return retArray;
};



// ---------------------------------------------------------------------------------------
const RGBvalues = (function() {

    var _hex2dec = function(v) {
        return parseInt(v, 16)
    };

    var _splitHEX = function(hex) {
        var c;
        if (hex.length === 4) {
            c = (hex.replace('#','')).split('');
            return {
                r: _hex2dec((c[0] + c[0])),
                g: _hex2dec((c[1] + c[1])),
                b: _hex2dec((c[2] + c[2]))
            };
        } else {
            return {
                r: _hex2dec(hex.slice(1,3)),
                g: _hex2dec(hex.slice(3,5)),
                b: _hex2dec(hex.slice(5))
            };
        }
    };

    var _splitRGB = function(rgb) {
        var c = (rgb.slice(rgb.indexOf('(')+1, rgb.indexOf(')'))).split(',');
        var flag = false, obj;
        c = c.map(function(n,i) {
            return (i !== 3) ? parseInt(n, 10) : flag = true, parseFloat(n);
        });
        obj = {
            r: c[0],
            g: c[1],
            b: c[2]
        };
        if (flag) obj.a = c[3];
        return obj;
    };

    var toColor = function(col) {
        var slc = col.slice(0,1);
        if (slc === '#') {
            return _splitHEX(col);
        } else if (slc.toLowerCase() === 'r') {
            return _splitRGB(col);
        } else {
            console.log('!Ooops! RGBvalues.color('+col+') : HEX, RGB, or RGBa strings only');
        }
    };

    var toHTML = function(r,g,b) {
        return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
    };

    return {
        toColor: toColor,
        toHTML: toHTML
    };
}());

