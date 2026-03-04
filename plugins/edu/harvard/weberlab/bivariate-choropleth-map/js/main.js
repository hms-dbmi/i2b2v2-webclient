
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
            ['#e8e8e8','#b5c0da','#6c83b5'],
            ['#b8d6be','#90b2b3','#567994'],
            ['#73ae80','#5a9178','#2a5a5b']
        ],
        "purplegold": [
            ['#9972af','#976b82','#804d36'],
            ['#cbb8d7','#c8ada0','#af8e53'],
            ['#e8e8e8','#e4d9ac','#c8b35a']
        ],
        "griffin": [
            ["#f3f3f3","#b4d3e1","#509dc2"],
            ["#f4e6b3","#a9b3a9","#376387"],
            ["#f3b300","#b36600","#003300"]
        ]
    },
    dataIds: ["dataset1", "dataset2"],
    hover: {
        "template": ""
    }
};

// ============================================================================
// Core constants and shared utilities
// ============================================================================
function parseXmlResponse(response) {
    if (!response) return null;
    if (typeof response === 'string') {
        return (new DOMParser()).parseFromString(response, "application/xml");
    }
    if (response.refXML) return response.refXML;
    if (response.msgResponse) {
        return (new DOMParser()).parseFromString(response.msgResponse, "application/xml");
    }
    return null;
}

const GEO_VIEWS = Object.freeze({
    ZIP5: 'zip5',
    ZIP3: 'zip3',
    STATE: 'state'
});
const DATASET_SLOT_IDS = Object.freeze(["dataset1", "dataset2"]);

// ============================================================================
// UI state helpers (view switch, flow hint, loading indicators)
// ============================================================================
function getActiveGeoView() {
    const current = i2b2.model && i2b2.model.settings ? i2b2.model.settings.geoView : null;
    return current || GEO_VIEWS.ZIP5;
}

function updateGeoViewButtons() {
    const current = getActiveGeoView();
    document.querySelectorAll('.geo-view-btn').forEach(function(btn) {
        const isActive = btn.dataset && btn.dataset.view === current;
        btn.classList.toggle('active', !!isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
}

function updateViewHelperText() {
    const el = document.getElementById('view-helper-text');
    if (!el) return;
    const view = getActiveGeoView();
    if (view === GEO_VIEWS.STATE) {
        el.textContent = 'Nationwide state-level aggregation.';
    } else if (view === GEO_VIEWS.ZIP3) {
        el.textContent = 'Aggregated by first 3 ZIP digits (regional coverage).';
    } else {
        el.textContent = 'Detailed ZIP-level map (regional coverage).';
    }
}

function updateFlowHint() {
    const flow = document.getElementById('flow-hint');
    if (!flow) return;
    const steps = flow.querySelectorAll('.flow-step');
    if (!steps || steps.length < 4) return;
    const count = getFilledDatasetCount();
    const activeIdx = count >= 2 ? 3 : Math.min(2, count);
    steps.forEach(function(step, idx) {
        step.classList.toggle('is-active', idx === activeIdx);
    });
}

function setLoadMapButtonLoading(isLoading) {
    const btn = document.getElementById('load-map-btn');
    if (!btn) return;
    btn.classList.toggle('is-loading', !!isLoading);
}

function refreshDatasetCohortLabels() {
    const list = (i2b2.model && Array.isArray(i2b2.model.datasets)) ? i2b2.model.datasets : [];
    list.forEach(function(entry) {
        const li = document.getElementById(entry.id);
        if (!li) return;
        const label = li.querySelector('.cohort-label');
        const chip = li.querySelector('.cohort-chip');
        const isSlot1 = entry.slotId === DATASET_SLOT_IDS[0];
        const cohortText = isSlot1 ? '1' : '2';
        if (label) label.textContent = cohortText;
        if (chip) {
            chip.classList.remove('cohort-a', 'cohort-b');
            chip.classList.add(isSlot1 ? 'cohort-a' : 'cohort-b');
        }
    });
}

function detectGeoViewFromResultType(typeName) {
    const t = String(typeName || '').toLowerCase();
    if (!t) return null;
    if (t.includes('state')) return GEO_VIEWS.STATE;
    if (t.includes('zip3') || t.includes('zip_3') || t.includes('3zip') || t.includes('3_digit') || t.includes('3digit')) return GEO_VIEWS.ZIP3;
    if (t.includes('zip')) return GEO_VIEWS.ZIP5;
    return null;
}

function getResultInstanceIdForView(dataset, viewKey) {
    if (!dataset || !dataset.sdx) return null;
    const ids = dataset.sdx.origData && dataset.sdx.origData.map_result_instance_ids ? dataset.sdx.origData.map_result_instance_ids : {};
    const fallback = dataset.sdx.sdxInfo && dataset.sdx.sdxInfo.sdxKeyValue ? String(dataset.sdx.sdxInfo.sdxKeyValue).trim() : null;
    const viewId = ids && ids[viewKey] ? String(ids[viewKey]).trim() : null;
    if (viewId) return viewId;
    if (ids && ids[GEO_VIEWS.ZIP5]) return String(ids[GEO_VIEWS.ZIP5]).trim();
    return fallback;
}

// ============================================================================
// Query result parsing helpers (table rows -> area keys/counts)
// ============================================================================
function stripPopulationPrefix(columnText) {
    return String(columnText || '').replace(/^\s*\[POPULATION\]\s*/i, '').trim();
}

function parseCountValue(rawValue) {
    const raw = String(rawValue == null ? '' : rawValue).trim();
    if (!raw) return null;
    const less = raw.match(/less\s+than\s+([0-9,]+)/i);
    if (less) {
        const n = parseInt(String(less[1]).replace(/,/g, ''), 10);
        return isNaN(n) ? null : Math.max(0, n - 1);
    }
    const num = raw.match(/([0-9][0-9,]*)/);
    if (!num) return null;
    const v = parseInt(String(num[1]).replace(/,/g, ''), 10);
    return isNaN(v) ? null : v;
}

function rowHasExplicitZip5(columnText) {
    const c = stripPopulationPrefix(columnText);
    return /^[0-9]{5}(?![0-9])\s*-/.test(c);
}

function rowHasExplicitZip3(columnText) {
    const c = stripPopulationPrefix(columnText);
    return /^[0-9]{3}(?![0-9])\s*-/.test(c);
}

function rowHasExplicitState(columnText) {
    const c = stripPopulationPrefix(columnText);
    return /^[A-Za-z]{2}$/.test(c) || /^[A-Za-z]{2}\s*-/.test(c);
}

function parseAreaFromColumn(columnText, viewKey, zipRegEx) {
    const col = String(columnText || '').trim();
    const clean = stripPopulationPrefix(col);
    if (!col) return null;

    if (viewKey === GEO_VIEWS.ZIP3) {
        const m3 = clean.match(/^([0-9]{3})(?![0-9])\s*-\s*(.*)$/) || clean.match(/^([0-9]{3})(?![0-9])$/);
        if (m3) {
            const key = String(m3[1]).trim();
            return { key: key, text: clean, label: (m3[2] || '').trim() };
        }
        const m5 = clean.match(/^([0-9]{5})(?![0-9])\s*-\s*(.*)$/) || clean.match(/^([0-9]{5})(?![0-9])$/);
        if (m5) {
            const key5 = String(m5[1]).trim();
            return { key: key5.substring(0, 3), text: clean, label: (m5[2] || '').trim() };
        }
        return null;
    }

    if (viewKey === GEO_VIEWS.STATE) {
        // Strict mode: state values are expected as 2-letter abbreviations only (e.g., MA or MA - label)
        const mAbbr = clean.match(/^([A-Za-z]{2})(?:\s*-\s*(.*))?$/);
        if (mAbbr) {
            const abbr = String(mAbbr[1]).toUpperCase();
            return { key: abbr, text: clean, label: (mAbbr[2] || '').trim() };
        }
        return null;
    }

    // ZIP5 view: support strict regex, plain "02139 - ...", and prefixed rows with embedded ZIP5 code
    const mZip5 = clean.match(zipRegEx) || clean.match(/^([0-9]{5})(?![0-9])\s*-\s*(.*)$/) || clean.match(/^([0-9]{5})(?![0-9])$/);
    if (!mZip5) return null;
    const key5 = String(mZip5[1]).trim();
    return { key: key5, text: clean, label: (mZip5[2] || clean).trim() };
}

function normalizeZip5(value) {
    const v = value == null ? '' : String(value).trim();
    return /^[0-9]{5}$/.test(v) ? v : '';
}

function normalizeZip3(value) {
    const v = value == null ? '' : String(value).trim();
    return /^[0-9]{3}$/.test(v) ? v : '';
}

function normalizeStateAbbr(value) {
    const v = value == null ? '' : String(value).trim().toUpperCase();
    return /^[A-Z]{2}$/.test(v) ? v : '';
}

// ============================================================================
// GeoJSON feature keying and per-view filtering
// ============================================================================
function getFeatureGeoCodes(feature, zipAttribName) {
    const props = feature && feature.properties ? feature.properties : {};
    const aggLevelRaw = props.aggLevel != null ? String(props.aggLevel).trim().toUpperCase() : '';
    const aggKeyRaw = props.aggKey != null ? String(props.aggKey).trim() : '';

    const zip5 = normalizeZip5(
        props[zipAttribName] != null ? props[zipAttribName] :
        (props.ZCTA5CE10 != null ? props.ZCTA5CE10 :
        (props.zip5code != null ? props.zip5code :
        (props.zipcode != null ? props.zipcode :
        ((aggLevelRaw === 'ZIP5') ? aggKeyRaw : ''))))
    );

    const zip3 = normalizeZip3(
        props.zip3code != null ? props.zip3code :
        ((aggLevelRaw === 'ZIP3') ? aggKeyRaw :
        (zip5 ? zip5.substring(0, 3) : ''))
    );

    let state = normalizeStateAbbr(
        props.abbr != null ? props.abbr :
        (props.stateCode != null ? props.stateCode :
        ((aggLevelRaw === 'STATE') ? aggKeyRaw : ''))
    );
    if (!state) {
        const stateId = feature && feature.id != null ? normalizeStateAbbr(feature.id) : '';
        if (stateId) state = stateId;
    }

    return {
        aggLevel: aggLevelRaw,
        zip5: zip5,
        zip3: zip3,
        state: state
    };
}

function featureMatchesView(feature, viewKey, zipAttribName) {
    const codes = getFeatureGeoCodes(feature, zipAttribName);
    const level = codes.aggLevel;
    if (viewKey === GEO_VIEWS.ZIP5) {
        if (level && level !== 'ZIP5') return false;
        return !!codes.zip5;
    }
    if (viewKey === GEO_VIEWS.ZIP3) {
        // Prefer explicit ZIP3 geometries when present, but allow ZIP5 fallback on legacy files.
        if (level && level !== 'ZIP3' && level !== 'ZIP5') return false;
        return !!codes.zip3;
    }
    if (level && level !== 'STATE') return false;
    return !!codes.state;
}

function getFeatureAreaKey(feature, viewKey, zipAttribName) {
    const codes = getFeatureGeoCodes(feature, zipAttribName);
    if (viewKey === GEO_VIEWS.STATE) return codes.state || null;
    if (viewKey === GEO_VIEWS.ZIP3) return codes.zip3 || null;
    return codes.zip5 || null;
}

// ============================================================================
// GeoJSON build/zoom helpers for Leaflet rendering
// ============================================================================
function buildWorkingGeoJSON(geoFeatures, mainData, viewKey, zipAttribName) {
    const dataIdX = i2b2.Plugin.dataIds[0];
    const dataIdY = i2b2.Plugin.dataIds[1];
    const out = { type: "FeatureCollection", features: [] };
    const safeMainData = (mainData && typeof mainData === 'object') ? mainData : {};
    const hasNativeZip3Geometry = viewKey === GEO_VIEWS.ZIP3 && geoFeatures.some(function(feature) {
        const codes = getFeatureGeoCodes(feature, zipAttribName);
        return codes.aggLevel === 'ZIP3' && !!codes.zip3;
    });

    if (viewKey === GEO_VIEWS.ZIP5) {
        geoFeatures.forEach((feature) => {
            if (!featureMatchesView(feature, viewKey, zipAttribName)) return;
            const areaKey = getFeatureAreaKey(feature, viewKey, zipAttribName);
            const mainDataLookup = areaKey && safeMainData[areaKey];
            if (!mainDataLookup || typeof mainDataLookup !== 'object') return;
            const featureCopy = structuredClone(feature);
            for (let attrib in mainDataLookup) featureCopy.properties[attrib] = mainDataLookup[attrib];
            featureCopy.properties.geo_view = viewKey;
            featureCopy.properties.geo_key = areaKey;
            const bucketX = i2b2.Plugin.toBucket(dataIdX, mainDataLookup[dataIdX]);
            const bucketY = i2b2.Plugin.toBucket(dataIdY, mainDataLookup[dataIdY]);
            if (isNaN(bucketX) || isNaN(bucketY)) {
                featureCopy.properties.color = "url(#error-pattern)";
            } else {
                featureCopy.properties.color = i2b2.model.activeColors[bucketY][bucketX];
                featureCopy.properties.buckets = [bucketY, bucketX];
            }
            out.features.push(featureCopy);
        });
        return out;
    }

    if (viewKey === GEO_VIEWS.STATE) {
        geoFeatures.forEach((feature) => {
            if (!featureMatchesView(feature, viewKey, zipAttribName)) return;
            const areaKey = getFeatureAreaKey(feature, viewKey, zipAttribName);
            const mainDataLookup = areaKey && safeMainData[areaKey];
            if (!areaKey || !mainDataLookup || typeof mainDataLookup !== 'object') return;
            const featureCopy = structuredClone(feature);
            for (let attrib in mainDataLookup) featureCopy.properties[attrib] = mainDataLookup[attrib];
            featureCopy.properties.geo_view = viewKey;
            featureCopy.properties.geo_key = areaKey;
            const bucketX = i2b2.Plugin.toBucket(dataIdX, mainDataLookup[dataIdX]);
            const bucketY = i2b2.Plugin.toBucket(dataIdY, mainDataLookup[dataIdY]);
            if (isNaN(bucketX) || isNaN(bucketY)) {
                featureCopy.properties.color = "url(#error-pattern)";
            } else {
                featureCopy.properties.color = i2b2.model.activeColors[bucketY][bucketX];
                featureCopy.properties.buckets = [bucketY, bucketX];
            }
            out.features.push(featureCopy);
        });
        return out;
    }

    // Aggregate geometries by area key so hover/buckets are per geographic bucket.
    const grouped = {};
    geoFeatures.forEach((feature) => {
        if (!featureMatchesView(feature, viewKey, zipAttribName)) return;
        if (viewKey === GEO_VIEWS.ZIP3 && hasNativeZip3Geometry) {
            const codes = getFeatureGeoCodes(feature, zipAttribName);
            if (codes.aggLevel !== 'ZIP3') return;
        }
        const areaKey = getFeatureAreaKey(feature, viewKey, zipAttribName);
        const mainDataLookup = areaKey && safeMainData[areaKey];
        if (!areaKey || !mainDataLookup || typeof mainDataLookup !== 'object') return;
        if (!grouped[areaKey]) {
            grouped[areaKey] = {
                props: structuredClone(mainDataLookup),
                geometries: []
            };
        }
        grouped[areaKey].geometries.push(structuredClone(feature.geometry));
    });

    Object.keys(grouped).forEach((areaKey) => {
        const g = grouped[areaKey];
        const props = g && g.props ? g.props : null;
        if (!props || typeof props !== 'object') return;
        props.geo_view = viewKey;
        props.geo_key = areaKey;
        const bucketX = i2b2.Plugin.toBucket(dataIdX, props[dataIdX]);
        const bucketY = i2b2.Plugin.toBucket(dataIdY, props[dataIdY]);
        if (isNaN(bucketX) || isNaN(bucketY)) {
            props.color = "url(#error-pattern)";
        } else {
            props.color = i2b2.model.activeColors[bucketY][bucketX];
            props.buckets = [bucketY, bucketX];
        }

        let geometry;
        if (g.geometries.length === 1) {
            geometry = g.geometries[0];
        } else {
            geometry = {
                type: "GeometryCollection",
                geometries: g.geometries
            };
        }

        out.features.push({
            type: "Feature",
            properties: props,
            geometry: geometry
        });
    });

    return out;
}

function applyGeoViewZoom(viewKey, geoJsonLayer) {
    if (!i2b2.Plugin.map || !geoJsonLayer || typeof geoJsonLayer.getBounds !== 'function') return;
    if (viewKey === GEO_VIEWS.STATE) {
        i2b2.Plugin.map.setView([39.8, -98.6], 4);
        document.querySelectorAll('.zoom-link').forEach((el) => el.classList.remove('selected'));
        return;
    }
    const bounds = geoJsonLayer.getBounds();
    if (!bounds || !bounds.isValid || !bounds.isValid()) return;

    let maxZoom;
    let padding;
    if (viewKey === GEO_VIEWS.STATE) {
        maxZoom = 6;
        padding = [20, 20];
    } else if (viewKey === GEO_VIEWS.ZIP3) {
        maxZoom = 8;
        padding = [20, 20];
    } else {
        maxZoom = 11;
        padding = [16, 16];
    }

    i2b2.Plugin.map.fitBounds(bounds, {
        padding: padding,
        maxZoom: maxZoom
    });
    document.querySelectorAll('.zoom-link').forEach((el) => el.classList.remove('selected'));
}

function setMapLoading(isLoading, text) {
    const el = document.getElementById('map-loading');
    if (!el) return;
    const txt = el.querySelector('.map-loading-text');
    if (txt && text) txt.textContent = text;
    el.classList.toggle('hidden', !isLoading);
}

// ============================================================================
// SDX/query resolution helpers (QM/QI -> PRC ZIP breakdowns)
// ============================================================================
// Resolve query master id from PRC origData (QI uses QM_id; some paths use query_master_id)
function getQueryMasterId(origData) {
    return origData["QM_id"] != null ? String(origData["QM_id"]) : (origData["query_master_id"] != null ? String(origData["query_master_id"]) : null);
}

// Extract query name from getRequestXml API result (may be { refXML, msgResponse } or raw XML string)
function getQueryNameFromRequestResult(result) {
    if (result == null) return '';
    let xmlDoc = parseXmlResponse(result);
    if (!xmlDoc) {
        return (result.title != null ? result.title : '') || (result.name != null ? result.name : '') || '';
    }
    try {
        const context = xmlDoc.nodeType === 9 ? xmlDoc : xmlDoc.documentElement || xmlDoc;
        const xpathResult = xmlDoc.evaluate("//query_name", context, null, XPathResult.STRING_TYPE, null);
        return (xpathResult && xpathResult.stringValue) ? String(xpathResult.stringValue).trim() : '';
    } catch (e) {
        return '';
    }
}

// ---------------------------------------------------------------------------------------
function showValidationMessage(text) {
    const el = document.getElementById('bivariate-validation-msg');
    if (el) {
        el.textContent = text;
        el.className = 'bivariate-validation-msg visible error';
    }
}
function clearValidationMessage() {
    const el = document.getElementById('bivariate-validation-msg');
    if (el) {
        el.textContent = '';
        el.className = 'bivariate-validation-msg';
    }
}

function resolveQMtoZipPRC(qmSdx) {
    const qmId = qmSdx.sdxInfo && qmSdx.sdxInfo.sdxKeyValue;
    if (!qmId) return Promise.reject(new Error('Invalid query master'));

    return i2b2.ajax.CRC.getQueryInstanceList_fromQueryMasterId({ qm_key_value: qmId }).then(function(qiResponse) {
        let xmlDoc = parseXmlResponse(qiResponse);
        if (!xmlDoc) return Promise.reject(new Error('No QI response'));
        const qiNodes = xmlDoc.getElementsByTagName('query_instance');
        if (qiNodes.length === 0) return Promise.reject(new Error('NO_ZIP'));
        // Try each query instance until one has a ZIP result (first QI may be an older run without ZIP)
        function tryNextQi(idx) {
            if (idx >= qiNodes.length) return Promise.reject(new Error('NO_ZIP'));
            const idEl = qiNodes[idx].getElementsByTagName('query_instance_id')[0];
            if (!idEl || !idEl.childNodes.length) return tryNextQi(idx + 1);
            const qid = (idEl.childNodes[0].nodeValue || '').trim();
            if (!qid) return tryNextQi(idx + 1);
            const qiSdx = {
                sdxInfo: { sdxType: 'QI', sdxKeyValue: qid, sdxDisplayName: (qmSdx.sdxInfo && qmSdx.sdxInfo.sdxDisplayName) || '' },
                origData: { query_master_id: qmId, QM_id: qmId }
            };
            return resolveQItoZipPRC(qiSdx).catch(function (err) { return tryNextQi(idx + 1); });
        }
        return tryNextQi(0);
    });
}

// Resolve a dropped QI (Query Instance, e.g. "Results of Female@8:28:10") to a PRC for ZIP Code breakdown if one exists
function resolveQItoZipPRC(qiSdx) {
    const raw = qiSdx.sdxInfo && qiSdx.sdxInfo.sdxKeyValue;
    const qiId = raw ? String(raw).trim() : null;
    const qmId = getQueryMasterId(qiSdx.origData);
    if (!qiId) return Promise.reject(new Error('Invalid query'));

    return i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryInstanceId({ qi_key_value: qiId }).then(function(response) {
        let xmlDoc = parseXmlResponse(response);
        if (!xmlDoc) return Promise.reject(new Error('No response'));

        const instances = xmlDoc.getElementsByTagName('query_result_instance');
        const mapResultIds = {};
        let firstTitle = (qiSdx.sdxInfo && qiSdx.sdxInfo.sdxDisplayName) || '';
        for (let i = 0; i < instances.length; i++) {
            const node = instances[i];
            let typeName = '';
            try {
                const typeEl = node.getElementsByTagName('query_result_type')[0];
                if (typeEl) {
                    const nameEl = typeEl.getElementsByTagName('name')[0];
                    if (nameEl && nameEl.childNodes.length) typeName = nameEl.childNodes[0].nodeValue || '';
                }
            } catch (e) {}
            const viewKey = detectGeoViewFromResultType(typeName);
            if (!viewKey) continue;

            let rawId = (node.getElementsByTagName('result_instance_id')[0] || {}).childNodes && node.getElementsByTagName('result_instance_id')[0].childNodes[0] ? node.getElementsByTagName('result_instance_id')[0].childNodes[0].nodeValue : null;
            const resultInstanceId = rawId ? String(rawId).trim() : null;
            if (!resultInstanceId) continue;
            if (!mapResultIds[viewKey]) mapResultIds[viewKey] = resultInstanceId;

            try {
                const descEl = node.getElementsByTagName('description')[0];
                if (descEl && descEl.childNodes.length && !firstTitle) firstTitle = descEl.childNodes[0].nodeValue || firstTitle;
            } catch (e) {}
        }
        const primaryId = mapResultIds[GEO_VIEWS.ZIP5] || mapResultIds[GEO_VIEWS.ZIP3] || mapResultIds[GEO_VIEWS.STATE];
        if (!primaryId) return Promise.reject(new Error('NO_ZIP'));

        const title = firstTitle || (qiSdx.sdxInfo && qiSdx.sdxInfo.sdxDisplayName) || '';
        const origData = {
            QM_id: qmId,
            query_master_id: qmId,
            result_type: 'PATIENT_GEO_BREAKDOWN',
            PRC_id: primaryId,
            result_instance_id: primaryId,
            map_result_instance_ids: mapResultIds,
            title: title
        };
        const prcSdx = {
            sdxInfo: {
                sdxType: 'PRC',
                sdxKeyName: 'result_instance_id',
                sdxKeyValue: primaryId,
                sdxDisplayName: title
            },
            origData: origData
        };
        return Promise.resolve(prcSdx);
    });
}

// ============================================================================
// Drag/drop dataset list management
// ============================================================================
i2b2.Plugin.itemDropped = function(sdxData, e) {
    const dropZone = e.target.closest && e.target.closest('.drop-slot-box');
    const slotId = dropZone && dropZone.dataset ? dropZone.dataset.slotId : null;
    const isListDrop = !!slotId;

    clearValidationMessage();

    // If dropped item is QM (top-level master query, e.g. "Female@8:28:10"), resolve to ZIP PRC
    if (sdxData.sdxInfo && sdxData.sdxInfo.sdxType === 'QM' && isListDrop) {
        resolveQMtoZipPRC(sdxData).then(function(prcSdx) {
            appendDatasetToSlot(prcSdx, slotId);
        }).catch(function(err) {
            if (err && err.message === 'NO_ZIP') {
                showValidationMessage('This query does not include a ZIP Code breakdown. Run the query with "Demographic Distribution by Zip Code" as a result option, then drop the master query again.');
            } else {
                showValidationMessage('Could not load query results. Please try again.');
            }
            indicateBadDropList(slotId);
        });
        return;
    }

    // If dropped item is QI ("Results of..."), resolve to ZIP PRC
    if (sdxData.sdxInfo && sdxData.sdxInfo.sdxType === 'QI' && isListDrop) {
        resolveQItoZipPRC(sdxData).then(function(prcSdx) {
            appendDatasetToSlot(prcSdx, slotId);
        }).catch(function(err) {
            if (err && err.message === 'NO_ZIP') {
                showValidationMessage('This query does not include a ZIP Code breakdown. Run the query with "Demographic Distribution by Zip Code" as a result option.');
            } else {
                showValidationMessage('Could not load query results. Please try again.');
            }
            indicateBadDropList(slotId);
        });
        return;
    }

    // Accept PRC directly (e.g., individual "Demographic Distribution by Zip Code" result)
    if (sdxData.sdxInfo && sdxData.sdxInfo.sdxType === 'PRC' && isListDrop) {
        appendDatasetToSlot(sdxData, slotId);
        return;
    }
    if (isListDrop) return;
};

function getDatasetKey(sdxData) {
    if (!sdxData) return '';
    if (sdxData.sdxInfo && sdxData.sdxInfo.sdxKeyValue) return String(sdxData.sdxInfo.sdxKeyValue).trim();
    if (sdxData.origData && sdxData.origData.result_instance_id) return String(sdxData.origData.result_instance_id).trim();
    if (sdxData.origData && sdxData.origData.PRC_id) return String(sdxData.origData.PRC_id).trim();
    return '';
}

function getNextDatasetId() {
    if (!i2b2.model.datasetIdCounter) i2b2.model.datasetIdCounter = 0;
    i2b2.model.datasetIdCounter += 1;
    return 'ds-' + i2b2.model.datasetIdCounter;
}

function getDatasetBySlot(slotId) {
    const list = (i2b2.model && Array.isArray(i2b2.model.datasets)) ? i2b2.model.datasets : [];
    return list.find(function(entry) { return entry.slotId === slotId; }) || null;
}

function getFilledDatasetCount() {
    const list = (i2b2.model && Array.isArray(i2b2.model.datasets)) ? i2b2.model.datasets : [];
    return list.length;
}

function getDatasetPairForRender() {
    const dataset1 = getDatasetBySlot(DATASET_SLOT_IDS[0]);
    const dataset2 = getDatasetBySlot(DATASET_SLOT_IDS[1]);
    return { dataset1: dataset1, dataset2: dataset2 };
}

function appendDatasetToSlot(sdxData, slotId) {
    if (!slotId || !DATASET_SLOT_IDS.includes(slotId)) return;
    if (!i2b2.model.datasets) i2b2.model.datasets = [];
    const list = i2b2.model.datasets;
    const existingInSlot = getDatasetBySlot(slotId);
    if (existingInSlot) {
        showValidationMessage((slotId === DATASET_SLOT_IDS[0] ? 'Query 1' : 'Query 2') + ' is already set. Remove it to replace.');
        indicateBadDropList(slotId);
        return;
    }
    const newKey = getDatasetKey(sdxData);
    const dup = list.some(function(d) {
        const key = getDatasetKey(d.sdx);
        return (newKey && key && newKey === key);
    });
    if (dup) {
        showValidationMessage('That query is already in the list.');
        indicateBadDropList(slotId);
        return;
    }
    const id = getNextDatasetId();
    const entry = {
        id,
        slotId: slotId,
        sdx: sdxData,
        buckets: 5,
        dirty: true
    };
    const listEl = document.getElementById('bivariate-' + slotId + '-list');
    const boxEl = document.getElementById('bivariate-' + slotId + '-drop');
    if (!listEl || !boxEl) return;
    i2b2.model.datasets.push(entry);
    i2b2.model.dirtyData = true;
    const li = document.createElement('li');
    li.id = id;
    li.className = 'dataset isSet';
    const chip = document.createElement('span');
    chip.className = 'cohort-chip ' + (slotId === DATASET_SLOT_IDS[0] ? 'cohort-a' : 'cohort-b');
    chip.setAttribute('aria-hidden', 'true');
    li.appendChild(chip);
    const cohortLabel = document.createElement('span');
    cohortLabel.className = 'cohort-label';
    cohortLabel.textContent = slotId === DATASET_SLOT_IDS[0] ? '1' : '2';
    li.appendChild(cohortLabel);
    const span = document.createElement('span');
    span.className = 'slot-text';
    span.textContent = 'Loading…';
    li.appendChild(span);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'bivariate-list-remove';
    removeBtn.title = 'Remove from list';
    removeBtn.setAttribute('aria-label', 'Remove query from list');
    removeBtn.setAttribute('draggable', 'false');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();
        removeDatasetFromList(id);
    });
    li.appendChild(removeBtn);
    listEl.appendChild(li);
    if (boxEl) boxEl.classList.remove('empty');
    refreshDatasetCohortLabels();
    updateFlowHint();

    const qmKey = getQueryMasterId(sdxData.origData);
    if (!qmKey) {
        entry.title = (sdxData.sdxInfo && sdxData.sdxInfo.sdxDisplayName) || 'Query';
        i2b2.Plugin.renderDatasetInfo(id);
        i2b2.Plugin.updateLoadMapButton();
        return;
    }
    const reqVars = { qm_key_value: qmKey };
    i2b2.ajax.CRC.getRequestXml_fromQueryMasterId(reqVars).then((result) => {
        entry.queryDefinition = result;
        entry.title = getQueryNameFromRequestResult(result) || (sdxData.sdxInfo && sdxData.sdxInfo.sdxDisplayName) || 'Query';
        i2b2.state.save();
        i2b2.Plugin.renderDatasetInfo(id);
        i2b2.Plugin.updateLoadMapButton();
    }).catch((e) => {
        // Keep the item so the drop still counts; use display name so user can still load map
        entry.title = (sdxData.sdxInfo && sdxData.sdxInfo.sdxDisplayName) || 'Query (name unavailable)';
        entry.queryDefinition = null;
        i2b2.state.save();
        i2b2.Plugin.renderDatasetInfo(id);
        i2b2.Plugin.updateLoadMapButton();
    });
}

function indicateBadDropList(slotId) {
    const targets = slotId
        ? [document.getElementById('bivariate-' + slotId + '-drop')]
        : [document.getElementById('bivariate-dataset1-drop'), document.getElementById('bivariate-dataset2-drop')];
    targets.forEach(function(box) {
        if (!box) return;
        box.style.backgroundColor = '#ffebee';
        setTimeout(() => { box.style.backgroundColor = ''; }, 800);
    });
}

function removeDatasetFromList(id) {
    if (!i2b2.model.datasets || !Array.isArray(i2b2.model.datasets)) return;
    const idx = i2b2.model.datasets.findIndex(function(d) { return d.id === id; });
    if (idx === -1) return;
    const removed = i2b2.model.datasets[idx];
    i2b2.model.datasets.splice(idx, 1);
    const li = document.getElementById(id);
    if (li) li.remove();
    const boxEl = removed && removed.slotId ? document.getElementById('bivariate-' + removed.slotId + '-drop') : null;
    if (boxEl) boxEl.classList.add('empty');
    refreshDatasetCohortLabels();
    updateFlowHint();
    i2b2.Plugin.updateLoadMapButton();
    clearValidationMessage();
}

// ============================================================================
// Dataset UI rendering and color matrix calculations
// ============================================================================
i2b2.Plugin.renderDatasetInfo = function(datasetId) {
    const targetDatasetEl = document.getElementById(datasetId);
    if (!targetDatasetEl) return;

    let title = '';
    if (i2b2.model[datasetId] && i2b2.model[datasetId].title !== undefined) {
        title = i2b2.model[datasetId].title;
    } else if (i2b2.model.datasets && Array.isArray(i2b2.model.datasets)) {
        const entry = i2b2.model.datasets.find(function(d) { return d.id === datasetId; });
        if (entry && entry.title !== undefined) title = entry.title;
    }

    const slotText = targetDatasetEl.querySelector('.slot-text');
    if (slotText) {
        slotText.textContent = title;
        slotText.title = title;
    } else {
        targetDatasetEl.textContent = title;
        targetDatasetEl.title = title;
    }
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


// ============================================================================
// Geometry acquisition helpers (QueryStatus model/tunnel/direct fetch)
// ============================================================================
i2b2.Plugin.toBucket = function(datasetName, value) {
    if (typeof i2b2.model[datasetName] !== 'object') return NaN;
    // bucketing function for the map variable
    if (i2b2.model[datasetName].max === i2b2.model[datasetName].min) return 0;
    const bucketSize = (i2b2.model[datasetName].max - i2b2.model[datasetName].min) / i2b2.model[datasetName].buckets;
    const calulated = Math.floor((value - i2b2.model[datasetName].min) / bucketSize);
    return Math.min((i2b2.model[datasetName].buckets - 1), Math.max(0, calulated));
};


function getZipGeoJSONFromQueryStatusModel() {
    const model = i2b2
        && i2b2.CRC
        && i2b2.CRC.QueryStatus
        && i2b2.CRC.QueryStatus.model
        ? i2b2.CRC.QueryStatus.model
        : null;
    if (!model) return null;
    const geo = model.MultiGeoJSON || model.GeoJSON || null;
    if (geo && geo.data && Array.isArray(geo.data.features)) return geo;
    return null;
}

function normalizeBaseUrl(base) {
    if (!base) return null;
    return /\/$/.test(base) ? base : (base + '/');
}

function fetchZipGeoJSONManifest(baseUrl, mapFolder) {
    const safeBase = normalizeBaseUrl(baseUrl);
    if (!safeBase) return Promise.reject(new Error("Missing QueryStatus base URL"));
    const loadListUrl = safeBase + mapFolder + "/GeoJSON/load_list.json";
    const zoomListUrl = safeBase + mapFolder + "/zoom_list.json";
    return fetch(loadListUrl).then(function(resp) {
        if (!resp.ok) throw new Error("Failed to load " + mapFolder + " load list: " + resp.status);
        return resp.json();
    }).then(function(loadList) {
        const files = Array.isArray(loadList) ? loadList : [];
        if (files.length === 0) throw new Error("No GeoJSON files listed for " + mapFolder);
        const fetches = files.map(function(fileName) {
            return fetch(safeBase + mapFolder + "/GeoJSON/" + fileName).then(function(resp) {
                if (!resp.ok) throw new Error("Failed to load " + mapFolder + " GeoJSON file: " + fileName + " (" + resp.status + ")");
                return resp.json();
            });
        });
        return Promise.all(fetches).then(function(parts) {
            const merged = { type: "FeatureCollection", features: [] };
            parts.forEach(function(part) {
                if (part && Array.isArray(part.features)) {
                    part.features.forEach(function(feature) {
                        merged.features.push(feature);
                    });
                }
            });
            return fetch(zoomListUrl).then(function(resp) {
                if (!resp.ok) return [];
                return resp.json();
            }).catch(function() {
                return [];
            }).then(function(zooms) {
                return { data: merged, zooms: Array.isArray(zooms) ? zooms : [] };
            });
        });
    });
}

function ensureZipGeoJSONByDirectLoad() {
    if (i2b2.Plugin.GeoJSONPromise) return i2b2.Plugin.GeoJSONPromise;
    const candidateBases = [];
    const queryStatusBase = i2b2 && i2b2.CRC && i2b2.CRC.QueryStatus ? i2b2.CRC.QueryStatus.baseURL : null;
    if (queryStatusBase) candidateBases.push(queryStatusBase);
    candidateBases.push("js-i2b2/cells/CRC/QueryStatus/");
    candidateBases.push("/js-i2b2/cells/CRC/QueryStatus/");
    const mapFolders = ["MultiZipcodeMap", "ZipcodeMap"];

    let chain = Promise.reject(new Error("No direct ZIP geometry source available"));
    candidateBases.forEach(function(base) {
        mapFolders.forEach(function(folder) {
            chain = chain.catch(function() {
                return fetchZipGeoJSONManifest(base, folder);
            });
        });
    });

    i2b2.Plugin.GeoJSONPromise = chain.then(function(geo) {
        i2b2.Plugin.GeoJSONPromise = null;
        if (geo && geo.data && Array.isArray(geo.data.features) && geo.data.features.length > 0) {
            i2b2.Plugin.GeoJSON = geo;
            return i2b2.Plugin.GeoJSON;
        }
        return null;
    }).catch(function(err) {
        i2b2.Plugin.GeoJSONPromise = null;
        console.error("[Bivariate map] direct ZIP geometry load failed", err);
        return null;
    });
    return i2b2.Plugin.GeoJSONPromise;
}

function readZipGeoJSONFromTunnel() {
    if (typeof i2b2.authorizedTunnel === 'undefined' || !i2b2.authorizedTunnel.variable) {
        return Promise.resolve(null);
    }
    const tunnelPaths = [
        "i2b2.CRC.QueryStatus.model.MultiGeoJSON", // RC3+
        "i2b2.CRC.QueryStatus.model.GeoJSON"       // legacy branches
    ];
    let chain = Promise.resolve(null);
    tunnelPaths.forEach(function(path) {
        chain = chain.then(function(found) {
            if (found && found.data && Array.isArray(found.data.features)) return found;
            let p;
            try {
                p = i2b2.authorizedTunnel.variable[path];
            } catch (err) {
                return null;
            }
            if (!p || typeof p.then !== 'function') return null;
            return Promise.resolve(p).then(function(data) {
                if (data && data.data && Array.isArray(data.data.features)) return data;
                return null;
            }).catch(function() {
                return null;
            });
        });
    });
    return chain;
}

// Resolve with QueryStatus GeoJSON (ZIP + STATE) using model/tunnel/direct load fallback.
function ensureGeoJSON() {
    if (i2b2.Plugin.GeoJSON && i2b2.Plugin.GeoJSON.data && Array.isArray(i2b2.Plugin.GeoJSON.data.features)) {
            return Promise.resolve(i2b2.Plugin.GeoJSON);
    }
    const qsGeo = getZipGeoJSONFromQueryStatusModel();
    if (qsGeo) {
        i2b2.Plugin.GeoJSON = qsGeo;
        return Promise.resolve(i2b2.Plugin.GeoJSON);
    }
    return readZipGeoJSONFromTunnel().then(function(data) {
        if (data && data.data && Array.isArray(data.data.features)) {
            i2b2.Plugin.GeoJSON = data;
            return i2b2.Plugin.GeoJSON;
        }
        return ensureZipGeoJSONByDirectLoad();
    }).catch(function(err) {
        return ensureZipGeoJSONByDirectLoad();
    });
}

function ensureRenderSettings() {
    if (!i2b2.model.settings) i2b2.model.settings = {};
    if (!i2b2.model.settings.zipRegEx) i2b2.model.settings.zipRegEx = /^([0-9]{5}) - (.*)$/;
    if (!i2b2.model.settings.zipAttribName) i2b2.model.settings.zipAttribName = "ZCTA5CE10";
}

function setRenderBusyState(isBusy, activeGeoView) {
    i2b2.model.isMapLoading = !!isBusy;
    setLoadMapButtonLoading(!!isBusy);
    i2b2.Plugin.updateLoadMapButton();
    if (isBusy) {
        document.body.classList.add("working");
        setMapLoading(true, activeGeoView === GEO_VIEWS.STATE ? "Loading nationwide state geometry..." : "Loading map data...");
    } else {
        document.body.classList.remove("working");
        setMapLoading(false);
    }
}

function buildResultRequestPlan(activeGeoView) {
    const promiseList = [];
    const requestTargets = [];
    for (const targetId of i2b2.Plugin.dataIds) {
        const dataset = i2b2.model[targetId];
        if (!dataset) continue;
        if (!dataset.dataXMLByView) dataset.dataXMLByView = {};
        if (dataset.dataXMLByView[activeGeoView] !== undefined) {
            dataset.dataXML = dataset.dataXMLByView[activeGeoView];
            continue;
        }
        const resultInstanceId = getResultInstanceIdForView(dataset, activeGeoView);
        if (!resultInstanceId) continue;
        requestTargets.push(targetId);
        promiseList.push(
            i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId({"qr_key_value": String(resultInstanceId).trim()})
        );
    }
    return { promiseList: promiseList, requestTargets: requestTargets };
}

function cacheViewXmlResponses(requestTargets, resultsList, activeGeoView) {
    let resultIndex = 0;
    for (const targetId of requestTargets) {
        const xml = resultsList[resultIndex++];
        i2b2.model[targetId].dataXML = xml;
        if (!i2b2.model[targetId].dataXMLByView) i2b2.model[targetId].dataXMLByView = {};
        i2b2.model[targetId].dataXMLByView[activeGeoView] = xml;
    }
}

function aggregateAreaCountsFromXml(innerXml, activeGeoView, zipRegEx) {
    const params = getXPath(innerXml, 'descendant::data[@column]/text()/..');
    const hasExplicitZip3 = params.some(function(p) {
        const c = p.getAttribute("column");
        return c && !/^\s*\[POPULATION\]/i.test(c) && rowHasExplicitZip3(c);
    });
    const hasExplicitState = params.some(function(p) {
        const c = p.getAttribute("column");
        return c && !/^\s*\[POPULATION\]/i.test(c) && rowHasExplicitState(c);
    });
    const aggregated = {};
    const labels = {};
    for (let i = 0; i < params.length; i++) {
        const zipData = params[i].getAttribute("column");
        if (zipData && /^\s*\[POPULATION\]/i.test(zipData)) continue;
        if (activeGeoView === GEO_VIEWS.ZIP3 && hasExplicitZip3 && rowHasExplicitZip5(zipData)) continue;
        if (activeGeoView === GEO_VIEWS.STATE && hasExplicitState && (rowHasExplicitZip5(zipData) || rowHasExplicitZip3(zipData))) continue;
        const area = parseAreaFromColumn(zipData, activeGeoView, zipRegEx);
        if (!area) continue;
        const areaKey = area.key;
        if (!labels[areaKey]) labels[areaKey] = { text: area.text, label: area.label };
        const countRaw = params[i].firstChild ? params[i].firstChild.nodeValue : 0;
        const count = parseCountValue(countRaw);
        if (count == null) continue;
        aggregated[areaKey] = (aggregated[areaKey] || 0) + count;
    }
    return { aggregated: aggregated, labels: labels };
}

function mergeAggregatedCountsIntoModel(targetId, aggregated, labels) {
    let minCount = Infinity;
    let maxCount = -Infinity;
    Object.keys(aggregated).forEach(function(areaKey) {
        if (typeof i2b2.model.mainData[areaKey] === 'undefined') {
            const labelData = labels[areaKey] || { text: areaKey, label: areaKey };
            i2b2.model.mainData[areaKey] = { text: labelData.text, label: labelData.label };
        }
        const count = aggregated[areaKey];
        i2b2.model.mainData[areaKey][targetId] = count;
        minCount = Math.min(count, minCount);
        maxCount = Math.max(count, maxCount);
    });
    i2b2.model[targetId].min = minCount;
    i2b2.model[targetId].max = maxCount;
    if (minCount === maxCount) i2b2.model[targetId].buckets = 1;
}

function getViewOutline(activeGeoView) {
    if (activeGeoView === GEO_VIEWS.STATE) return { weight: 0.9, opacity: 0.55, color: "#4f6170" };
    if (activeGeoView === GEO_VIEWS.ZIP3) return { weight: 0.85, opacity: 0.82, color: "#2f3d4a" };
    return { weight: 0.45, opacity: 0.34, color: "#667782" };
}

function buildLayerStyleHandlers(activeGeoView, viewOutline) {
    const func_StylingNorm = function(feat) {
        const confStyles = (i2b2.model.settings && i2b2.model.settings.styles) ? i2b2.model.settings.styles : {};
        const ret = { fillColor: feat.properties.color };
        for (let attrib in confStyles.norm) ret[attrib] = confStyles.norm[attrib];
        ret.weight = viewOutline.weight;
        ret.opacity = viewOutline.opacity;
        ret.color = viewOutline.color;
        if (activeGeoView !== GEO_VIEWS.ZIP5 && ret.fillOpacity == null) ret.fillOpacity = 0.78;
        return ret;
    };
    const func_StylingHighlight = function(e) {
        const confStyles = (i2b2.model.settings && i2b2.model.settings.styles) ? i2b2.model.settings.styles : {};
        const layer = e.target;
        const style = {};
        for (let attrib in confStyles.hover) style[attrib] = confStyles.hover[attrib];
        const hoverColor = String(style.color || '').toLowerCase();
        if (!hoverColor || hoverColor === '#f00' || hoverColor === '#ff0000' || hoverColor === 'red') style.color = "#455a64";
        const baseWeight = (typeof layer.options.weight === 'number') ? layer.options.weight : viewOutline.weight;
        if (activeGeoView === GEO_VIEWS.ZIP3) {
            style.weight = Math.max(1.6, baseWeight + 0.8, style.weight || 0);
            style.opacity = 1;
        } else {
            style.weight = Math.max(3, baseWeight + 2.2, style.weight || 0);
            style.opacity = 1;
        }
        style.color = style.color || "#455a64";
        style.fillOpacity = (typeof layer.options.fillOpacity === 'number') ? layer.options.fillOpacity : undefined;
        layer.setStyle(style);
        layer.bringToFront();
        if (typeof i2b2.Plugin.hoverbox !== 'undefined') i2b2.Plugin.hoverbox.update(layer.feature.properties);
        const buckets = layer.feature.properties.buckets;
        if (buckets) i2b2.Plugin.legend.hover(buckets[0], buckets[1]);
    };
    const func_StylingReset = function(e) {
        i2b2.Plugin.geojson.resetStyle(e.target);
        if (typeof i2b2.Plugin.hoverbox !== 'undefined') i2b2.Plugin.hoverbox.update();
        i2b2.Plugin.legend.hover();
    };
    return {
        style: func_StylingNorm,
        onEachFeature: function(feature, layer) {
            layer.on({ mouseover: func_StylingHighlight, mouseout: func_StylingReset });
        }
    };
}

function renderGeoLayer(workingGeoJSON, activeGeoView, styleOptions) {
    if (i2b2.Plugin.map && typeof i2b2.Plugin.geojson !== 'undefined') {
        i2b2.Plugin.map.removeLayer(i2b2.Plugin.geojson);
        i2b2.Plugin.geojson = undefined;
    }
    if (workingGeoJSON.features.length > 0 && i2b2.Plugin.map) {
        i2b2.Plugin.geojson = L.geoJson(workingGeoJSON, styleOptions).addTo(i2b2.Plugin.map);
        applyGeoViewZoom(activeGeoView, i2b2.Plugin.geojson);
        const pane = document.querySelector('.leaflet-overlay-pane');
        if (pane) pane.classList.remove('hidden');
    }
    clearValidationMessage();
}

// ============================================================================
// Main map render pipeline
// ============================================================================
i2b2.Plugin.renderMap = function() {
    if (!i2b2.model.dirtyData) return;
    if (!i2b2.model.dataset1 || !i2b2.model.dataset2 || !i2b2.model.dataset1.sdx || !i2b2.model.dataset2.sdx) {
        return;
    }

    ensureRenderSettings();
    const activeGeoView = getActiveGeoView();
    setRenderBusyState(true, activeGeoView);
    const requestPlan = buildResultRequestPlan(activeGeoView);
    const promiseList = requestPlan.promiseList;
    const requestTargets = requestPlan.requestTargets;

    const finishWithError = (err) => {
        setRenderBusyState(false, activeGeoView);
        console.error("[Bivariate map] renderMap error", err);
        showValidationMessage('Could not load map data. ' + ((err && err.message) ? err.message : 'Please try again.'));
        i2b2.model.dirtyData = true;
    };

    let activeGeoData = null;
    const preGeoPromise = ensureGeoJSON();
    Promise.all([preGeoPromise, Promise.all(promiseList)]).then((preResults) => {
        activeGeoData = preResults[0] || null;
        if (activeGeoData) i2b2.Plugin.GeoJSON = activeGeoData;
        const resultsList = preResults[1] || [];
        i2b2.model.mainData = {};
        const handleMissingZip = () => {
            showValidationMessage('ZIP Code breakdown data could not be loaded. Please try again.');
            indicateBadDropList();
            func_ClearExistingData();
        };
        cacheViewXmlResponses(requestTargets, resultsList, activeGeoView);

        for (const targetId of i2b2.Plugin.dataIds) {
            let resultXML = getXPath(i2b2.model[targetId].dataXML, "//xml_value");
            if (resultXML.length === 0) {
                delete i2b2.model[targetId].dataXML;
                handleMissingZip();
            } else {
                let inner = resultXML[0].firstChild;
                let innerXml = (inner && inner.nodeValue) ? inner.nodeValue : (resultXML[0].textContent || '');
                if (!innerXml.trim()) {
                    delete i2b2.model[targetId].dataXML;
                    handleMissingZip();
                    continue;
                }
                const zipRegEx = i2b2.model.settings.zipRegEx;
                const aggregatedInfo = aggregateAreaCountsFromXml(innerXml, activeGeoView, zipRegEx);
                mergeAggregatedCountsIntoModel(targetId, aggregatedInfo.aggregated, aggregatedInfo.labels);
            }
        }

        i2b2.Plugin.recalculateColors();
        i2b2.Plugin.legend.update();
        return ensureGeoJSON();
    }).then((geo) => {
        activeGeoData = geo || activeGeoData;
        if (activeGeoData) i2b2.Plugin.GeoJSON = activeGeoData;

        let workingGeoJSON = { type: "FeatureCollection", features: [] };
        const sourceGeo = activeGeoData || i2b2.Plugin.GeoJSON;
        const rawFeatures = sourceGeo && sourceGeo.data && sourceGeo.data.features;
        const geoFeatures = Array.isArray(rawFeatures) ? rawFeatures : [];
        const zipAttribName = i2b2.model.settings.zipAttribName || "ZCTA5CE10";
        workingGeoJSON = buildWorkingGeoJSON(geoFeatures, i2b2.model.mainData, activeGeoView, zipAttribName);
        const viewOutline = getViewOutline(activeGeoView);
        const styleHandlers = buildLayerStyleHandlers(activeGeoView, viewOutline);
        renderGeoLayer(workingGeoJSON, activeGeoView, styleHandlers);

        i2b2.model.dirtyData = false;
        i2b2.state.save();
        setRenderBusyState(false, activeGeoView);
    }).catch(finishWithError);
};



// ============================================================================
// Button state and plugin bootstrap wiring
// ============================================================================
i2b2.Plugin.updateLoadMapButton = function() {
    const btn = document.getElementById('load-map-btn');
    if (!btn) return;
    const labelEl = btn.querySelector('.btn-label');
    const datasetPair = getDatasetPairForRender();
    const count = (datasetPair.dataset1 ? 1 : 0) + (datasetPair.dataset2 ? 1 : 0);
    const isLoading = !!(i2b2.model && i2b2.model.isMapLoading);
    if (isLoading) {
        btn.disabled = true;
        if (labelEl) labelEl.textContent = 'Loading…';
        btn.title = 'Rendering map';
    } else if (count === 0) {
        btn.disabled = true;
        if (labelEl) labelEl.textContent = 'Drop Query 1 and Query 2';
        btn.title = 'Drop queries in both boxes to enable map rendering';
    } else if (count === 1) {
        btn.disabled = true;
        if (labelEl) labelEl.textContent = 'Drop 1 more query';
        btn.title = 'Drop a query in the empty box to enable map rendering';
    } else {
        btn.disabled = false;
        if (labelEl) labelEl.textContent = 'Load map';
        btn.title = 'Load map';
    }
    updateFlowHint();
};

// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", ()=> {
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)

    // per-slot drop targets: accept PRC (ZIP result) or QI/QM (resolve to ZIP PRC)
    if (!i2b2.model.datasets) i2b2.model.datasets = [];
    ["bivariate-dataset1-drop", "bivariate-dataset2-drop"].forEach(function(dropId) {
        i2b2.sdx.AttachType(dropId, "QM");
        i2b2.sdx.setHandlerCustom(dropId, "QM", "DropHandler", i2b2.Plugin.itemDropped);
        i2b2.sdx.AttachType(dropId, "PRC");
        i2b2.sdx.setHandlerCustom(dropId, "PRC", "DropHandler", i2b2.Plugin.itemDropped);
        i2b2.sdx.AttachType(dropId, "QI");
        i2b2.sdx.setHandlerCustom(dropId, "QI", "DropHandler", i2b2.Plugin.itemDropped);
    });
    // Sync handlers to the key hive_SDX reads (i2b2DragdropEvents) so drops work without modifying hive
    (function syncDropEventsToHiveKey() {
        if (typeof $ === "undefined") return;
        ["bivariate-dataset1-drop", "bivariate-dataset2-drop"].forEach(function(dropId) {
            var el = document.getElementById(dropId);
            if (!el) return;
            var from = $(el).data("i2b2-dragdrop-events");
            if (from) $(el).data("i2b2DragdropEvents", from);
        });
    })();

    // Load map button: build map from the two queries in the list
    const loadMapBtn = document.getElementById('load-map-btn');
    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', () => {
            const pair = getDatasetPairForRender();
            if (!pair.dataset1 || !pair.dataset2) return;
            i2b2.model.isMapLoading = true;
            setLoadMapButtonLoading(true);
            i2b2.Plugin.updateLoadMapButton();
            i2b2.model.dataset1 = pair.dataset1;
            i2b2.model.dataset2 = pair.dataset2;
            delete i2b2.model.dataset1.dataXML;
            delete i2b2.model.dataset2.dataXML;
            i2b2.model.dirtyData = true;
            i2b2.Plugin.renderMap();
            if (i2b2.Plugin.map) i2b2.Plugin.map.invalidateSize();
        });
    }

    // Geography switch (ZIP5 / ZIP3 / State): rerender current pair instantly
    if (!i2b2.model.settings) i2b2.model.settings = {};
    if (!i2b2.model.settings.geoView) i2b2.model.settings.geoView = GEO_VIEWS.ZIP5;
    updateGeoViewButtons();
    updateViewHelperText();
    document.querySelectorAll('.geo-view-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const nextView = btn.dataset && btn.dataset.view ? btn.dataset.view : GEO_VIEWS.ZIP5;
            if (nextView === i2b2.model.settings.geoView) return;
            i2b2.model.settings.geoView = nextView;
            updateGeoViewButtons();
            updateViewHelperText();
            const pair = getDatasetPairForRender();
            if (pair.dataset1 && pair.dataset2) {
                i2b2.model.dataset1 = pair.dataset1;
                i2b2.model.dataset2 = pair.dataset2;
                i2b2.model.dirtyData = true;
                i2b2.Plugin.renderMap();
                if (i2b2.Plugin.map) i2b2.Plugin.map.invalidateSize();
            }
            if (i2b2.state) i2b2.state.save();
        });
    });
    i2b2.Plugin.updateLoadMapButton();

    // Do not warm tunnel on init; fetch geometry lazily during render to avoid
    // "I am not done yet" console errors before users click Load map.
    // get the zoom settings from the main UI's QueryStatus model
    i2b2.model.dirtyData = true;
    ensureGeoJSON().then((data) => {
        if (!data) return;
        // save all the data
        i2b2.Plugin.GeoJSON = data;

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
    

    // initially hide the overlay plane (uses this for animation)
    document.querySelector('.leaflet-overlay-pane').classList.add('hidden');

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
            const activeGeoView = getActiveGeoView();
            const geoLabel = activeGeoView === GEO_VIEWS.STATE ? 'State' : (activeGeoView === GEO_VIEWS.ZIP3 ? 'ZIP3' : 'ZIP5');
            const geoKey = data && data.geo_key ? String(data.geo_key).trim() : '';
            const rawLabel = data && data.label ? String(data.label).trim() : '';
            const rawText = data && data.text ? String(data.text).trim() : '';
            let geoValue = '(unknown)';
            if (activeGeoView === GEO_VIEWS.ZIP3 || activeGeoView === GEO_VIEWS.ZIP5) {
                const labelText = rawLabel || rawText;
                if (geoKey && labelText) {
                    const startsWithKey = labelText.toUpperCase().startsWith(geoKey.toUpperCase() + ' -');
                    geoValue = startsWithKey ? labelText : (geoKey + ' - ' + labelText);
                } else if (geoKey) {
                    geoValue = geoKey;
                } else if (labelText) {
                    geoValue = labelText;
                }
            } else {
                geoValue = rawLabel || rawText || geoKey || '(unknown)';
            }
            const cohortA = 'Cohort 1';
            const cohortB = 'Cohort 2';
            const formatCount = function(v) {
                const n = Number(v);
                return Number.isFinite(n) ? n.toLocaleString() : '(unknown)';
            };
            const countA = formatCount(data[i2b2.Plugin.dataIds[0]]);
            const countB = formatCount(data[i2b2.Plugin.dataIds[1]]);
            self._div.innerHTML = '<h4>Patient Counts</h4>'
                + '<div class="geo-line">' + geoLabel + ': <strong>' + geoValue + '</strong></div>'
                + '<div>' + cohortA + '<span class="counts">' + countA + ' patients</span></div>'
                + '<div>' + cohortB + '<span class="counts">' + countB + ' patients</span></div>';
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
            temp.setAttribute("stroke-width", "1");
            temp.setAttribute("opacity", (typeof x === 'undefined') ? "1" : "0.6");
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
        if (target) {
            target.setAttribute("stroke", highlightColor);
            target.setAttribute("stroke-width", "2.5");
            target.setAttribute("opacity", "1");
        }
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

        const leftPad = 48;
        const bottomPad = 42;
        matrixGroup.setAttribute("transform", `translate(${leftPad}, 0)`);

        const cohortY = 'Cohort 1';
        const cohortX = 'Cohort 2';

        // Y axis cohort label
        const textCohortY = document.createElementNS(svgNS, "text");
        textCohortY.textContent = cohortY;
        textCohortY.setAttribute("fill", "#111");
        textCohortY.setAttribute("font-size", "12");
        textCohortY.setAttribute("font-weight", "700");
        svg.appendChild(textCohortY);
        textCohortY.setAttribute("transform", `translate(14, ${(rows * blockWithSpacing)}) rotate(-90)`);

        // X axis cohort label
        const textCohortX = document.createElementNS(svgNS, "text");
        textCohortX.textContent = cohortX;
        textCohortX.setAttribute("fill", "#111");
        textCohortX.setAttribute("font-size", "12");
        textCohortX.setAttribute("font-weight", "700");
        textCohortX.setAttribute("x", leftPad + 6);
        textCohortX.setAttribute("y", (rows * blockWithSpacing) + 30);
        svg.appendChild(textCohortX);

        // Direction hints (Low -> High)
        const xHint = document.createElementNS(svgNS, "text");
        xHint.textContent = "Low -> High";
        xHint.setAttribute("fill", "#4b5563");
        xHint.setAttribute("font-size", "10");
        xHint.setAttribute("x", leftPad + 6);
        xHint.setAttribute("y", (rows * blockWithSpacing) + 14);
        svg.appendChild(xHint);

        const yHint = document.createElementNS(svgNS, "text");
        yHint.textContent = "Low -> High";
        yHint.setAttribute("fill", "#4b5563");
        yHint.setAttribute("font-size", "10");
        svg.appendChild(yHint);
        yHint.setAttribute("transform", `translate(34, ${(rows * blockWithSpacing) - 4}) rotate(-90)`);

        // recalculate the SVG size and viewport
        width = leftPad + (cols * blockWithSpacing - spacing) + 8;
        height = (rows * blockWithSpacing - spacing) + bottomPad;
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        self._div.classList.remove('hidden');
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
            console.warn('RGBvalues.toColor(' + col + '): HEX, RGB, or RGBA strings only');
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

const func_ClearExistingData = () => {
    // hide the legend box
    document.querySelector('.legend-box').classList.add('hidden');

    // clear the data from the map
    if (i2b2.Plugin.geojson) {
        document.querySelector('.leaflet-overlay-pane').classList.add('hidden');
        setTimeout(()=>{
            i2b2.Plugin.geojson.clearLayers();
            i2b2.Plugin.map.removeLayer(i2b2.Plugin.geojson);
            delete i2b2.Plugin.geojson;
        }, 1000);
    }
};
