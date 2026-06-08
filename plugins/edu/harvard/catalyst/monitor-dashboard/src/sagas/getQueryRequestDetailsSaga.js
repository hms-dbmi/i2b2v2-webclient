import { call, takeLatest, put} from "redux-saga/effects";
import {GET_QUERY_REQUEST_DETAILS} from "../actions";
import {parseXml} from "../utilities/parseXml";
import {getQueryRequestDetailsFailed, getQueryRequestDetailsSucceeded} from "../reducers/queryRequestDetailsSlice";
import xmlFormat from 'xml-formatter';
import {decode} from 'html-entities';
import {DateTime} from "luxon";

//a function that returns a promise
const getQueryRequestXmlRequest = (queryMasterId, groupId) => {
    let data = {
        qm_key_value: queryMasterId,
        group_id: groupId
    };

    return i2b2.ajax.CRC.getRequestXml_fromQueryMasterIdAndGroupId(data).then((xmlString) => parseXml(xmlString));
}

const extractPanelList = (panels) => {
    let panelsList = [];
    for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        let panelNumber = panel.getElementsByTagName("panel_number");
        panelNumber = panelNumber.length > 0 && panelNumber[0].childNodes.length > 0 ? panelNumber[0].childNodes[0].nodeValue: "";

        let panelTiming = panel.getElementsByTagName("panel_timing");
        panelTiming = panelTiming.length > 0 && panelTiming[0].childNodes.length > 0 ? panelTiming[0].childNodes[0].nodeValue: "";

        let invert = panel.getElementsByTagName("invert");
        invert = invert.length > 0 && invert[0].childNodes.length > 0 ? invert[0].childNodes[0].nodeValue === "1": "";

        let occurrences = panel.getElementsByTagName("total_item_occurrences");
        occurrences = occurrences.length > 0 && occurrences[0].childNodes.length > 0 ? occurrences[0].childNodes[0].nodeValue: "";

        let panelItemsList = [];
        let panelItems =  panel.getElementsByTagName("item");
        for (let x = 0; x < panelItems.length; x++) {
            const panelItemElem =  panelItems[x];
            let hlevel = panelItemElem.getElementsByTagName("hlevel");
            hlevel = hlevel.length > 0 && hlevel[0].childNodes.length > 0 ? hlevel[0].childNodes[0].nodeValue: "";

            let itemName = panelItemElem.getElementsByTagName("item_name");
            itemName = itemName.length > 0 && itemName[0].childNodes.length > 0 ? itemName[0].childNodes[0].nodeValue: "";

            let itemKey = panelItemElem.getElementsByTagName("item_key");
            itemKey = itemKey.length > 0 && itemKey[0].childNodes.length > 0 ? itemKey[0].childNodes[0].nodeValue: "";

            let itemIcon = panelItemElem.getElementsByTagName("item_icon");
            itemIcon = itemIcon.length > 0 && itemIcon[0].childNodes.length > 0 ? itemIcon[0].childNodes[0].nodeValue: "";

            let tooltip = panelItemElem.getElementsByTagName("tooltip");
            tooltip = tooltip.length > 0 && tooltip[0].childNodes.length > 0 ? tooltip[0].childNodes[0].nodeValue: "";

            let isSynonym = panelItemElem.getElementsByTagName("item_is_synonym");
            isSynonym = isSynonym.length > 0 && isSynonym[0].childNodes.length > 0 ? isSynonym[0].childNodes[0].nodeValue === "true": "";

            let constrainByModifier = null;
            let constrainByModifierElem = panelItemElem.getElementsByTagName("constrain_by_modifier");
            if(constrainByModifierElem.length > 0 && constrainByModifierElem[0].childNodes.length > 0){
                constrainByModifierElem = constrainByModifierElem[0];
                let modifierName = constrainByModifierElem.getElementsByTagName("modifier_name");
                modifierName = modifierName.length > 0 && modifierName[0].childNodes.length > 0 ? modifierName[0].childNodes[0].nodeValue: "";

                let modifierKey = constrainByModifierElem.getElementsByTagName("modifier_key");
                modifierKey = modifierKey.length > 0 && modifierKey[0].childNodes.length > 0 ? modifierKey[0].childNodes[0].nodeValue: "";

                let appliedPath = constrainByModifierElem.getElementsByTagName("applied_path");
                appliedPath = appliedPath.length > 0 && appliedPath[0].childNodes.length > 0 ? appliedPath[0].childNodes[0].nodeValue: "";

                let modifierConstrainByValue = null;
                let modifierConstrainByValueElem = constrainByModifierElem.getElementsByTagName("constrain_by_value");
                if(modifierConstrainByValueElem.length > 0 && modifierConstrainByValueElem[0].childNodes.length > 0){
                    modifierConstrainByValueElem  = modifierConstrainByValueElem[0];
                    let valueOperator = modifierConstrainByValueElem.getElementsByTagName("value_operator");
                    valueOperator = valueOperator.length > 0 && valueOperator[0].childNodes.length > 0 ? valueOperator[0].childNodes[0].nodeValue: "";

                    let valueUnits = modifierConstrainByValueElem.getElementsByTagName("value_unit_of_measure");
                    valueUnits = valueUnits.length > 0 && valueUnits[0].childNodes.length > 0 ? valueUnits[0].childNodes[0].nodeValue: "";

                    let valueConstraint = modifierConstrainByValueElem.getElementsByTagName("value_constraint");
                    valueConstraint = valueConstraint.length > 0 && valueConstraint[0].childNodes.length > 0 ? valueConstraint[0].childNodes[0].nodeValue: "";

                    let valueType = modifierConstrainByValueElem.getElementsByTagName("value_type");
                    valueType = valueType.length > 0 && valueType[0].childNodes.length > 0 ? valueType[0].childNodes[0].nodeValue: "";

                    modifierConstrainByValue = {
                        valueOperator,
                        valueConstraint,
                        valueType,
                        valueUnits
                    }
                }
                constrainByModifier = {
                    name: modifierName,
                    key: modifierKey,
                    appliedPath: appliedPath,
                    constrainByValue: modifierConstrainByValue
                }
            }

            let constrainByValue = null;
            let constrainByValueElem = panelItemElem.querySelectorAll("item > constrain_by_value");
            if(constrainByValueElem.length > 0 && constrainByValueElem[0].childNodes.length > 0){
                constrainByValueElem = constrainByValueElem[0];
                let valueOperator = constrainByValueElem.getElementsByTagName("value_operator");
                valueOperator =valueOperator.length > 0 && valueOperator[0].childNodes.length > 0 ? valueOperator[0].childNodes[0].nodeValue: "";

                let valueConstraint = constrainByValueElem.getElementsByTagName("value_constraint");
                valueConstraint =valueConstraint.length > 0 && valueConstraint[0].childNodes.length > 0 ? valueConstraint[0].childNodes[0].nodeValue: "";

                let valueType = constrainByValueElem.getElementsByTagName("value_type");
                valueType = valueType.length > 0 && valueType[0].childNodes.length > 0 ? valueType[0].childNodes[0].nodeValue: "";

                let valueUnits = constrainByValueElem.getElementsByTagName("value_unit_of_measure");
                valueUnits = valueUnits.length > 0 && valueUnits[0].childNodes.length > 0 ? valueUnits[0].childNodes[0].nodeValue: "";

                constrainByValue = {
                    valueOperator,
                    valueConstraint,
                    valueType,
                    valueUnits
                }
            }

            let constrainByDate = null;
            let constrainByDateElem = panelItemElem.getElementsByTagName("constrain_by_date");
            if(constrainByDateElem.length > 0 && constrainByDateElem[0].childNodes.length > 0){
                constrainByDateElem = constrainByDateElem[0];

                let dateFrom = constrainByDateElem.getElementsByTagName("date_from");
                dateFrom = dateFrom.length > 0 && dateFrom[0].childNodes.length > 0 ? DateTime.fromISO(dateFrom[0].childNodes[0].nodeValue).toJSDate(): null;

                let dateTo = constrainByDateElem.getElementsByTagName("date_to");

                dateTo = dateTo.length > 0 && dateTo[0].childNodes.length > 0 ? DateTime.fromISO(dateTo[0].childNodes[0].nodeValue).toJSDate(): null;

                constrainByDate = {
                    dateFrom,
                    dateTo
                }
            }

            panelItemsList.push({
                hlevel,
                itemName,
                itemKey,
                itemIcon,
                tooltip,
                isSynonym,
                constrainByModifier,
                constrainByValue,
                constrainByDate,
            });
        }
        panelsList.push({
            panelNumber,
            panelTiming,
            invert,
            occurrences,
            panelItems: panelItemsList
        })
    }

    return panelsList;
}

const parseQueryRequestXml = (queryRequestXml) => {
    let queryRequest = {
        queryMasterId: null,
        queryName: "",
        queryRequestXml: "",
        queryRequestSQL: "",
        queryDefinition: null,
    };

    let queryMaster = queryRequestXml.getElementsByTagName('query_master');
    if(queryMaster.length > 0){
        queryMaster = queryMaster[0];
        let queryMasterId = queryMaster.getElementsByTagName('query_master_id');
        let queryName = queryMaster.getElementsByTagName('name');
        let queryRequestXml = queryMaster.getElementsByTagName('request_xml');
        let queryRequestSQL = queryMaster.getElementsByTagName('generated_sql');
        let username = queryMaster.getElementsByTagName('user_id');

        if((queryMasterId.length > 0 && queryMasterId[0].childNodes.length > 0)
        && queryName.length > 0 && queryName[0].childNodes.length > 0
        && queryRequestXml.length > 0 && queryRequestXml[0].childNodes.length > 0
        && username.length > 0 && username[0].childNodes.length > 0) {
            queryMasterId = queryMasterId[0].childNodes[0].nodeValue;
            queryName = queryName[0].childNodes[0].nodeValue;
            username = username[0].childNodes[0].nodeValue;

            let queryDefinitionElem = queryRequestXml;
            queryRequestXml = xmlFormat(queryRequestXml[0].innerHTML.trim());
            queryRequestSQL = queryRequestSQL.length > 0 ? decode(queryRequestSQL[0].innerHTML.trim()) : "";

            let queryDefinition = {};

            if(queryDefinitionElem.length > 0 && queryDefinitionElem[0].childNodes.length > 0) {
                queryDefinitionElem = queryDefinitionElem[0];

                let queryName = queryDefinitionElem.getElementsByTagName("query_name");
                queryName = queryName.length > 0 && queryName[0].childNodes.length > 0 ? queryName[0].childNodes[0].nodeValue : "";

                let queryTiming = queryDefinitionElem.getElementsByTagName("query_timing");
                queryTiming = queryTiming.length > 0 && queryTiming[0].childNodes.length > 0 ? queryTiming[0].childNodes[0].nodeValue : "";

                queryDefinition.queryName = queryName;
                queryDefinition.queryTiming = queryTiming;

                let panels = queryDefinitionElem.querySelectorAll("query_definition > panel");
                const panelsList = extractPanelList(panels);
                queryDefinition.panels = panelsList;


                let subQueryElems = queryDefinitionElem.getElementsByTagName("subquery");
                let subQueryList = [];
                for (let i = 0; i < subQueryElems.length; i++) {
                    const subQuery = subQueryElems[i];

                    let queryId = subQuery.getElementsByTagName("query_id");
                    let queryType = subQuery.getElementsByTagName("query_type");
                    let queryName = subQuery.getElementsByTagName("query_name");

                    if (queryId.length > 0 && queryId[0].childNodes.length > 0
                        && queryName.length > 0 && queryName[0].childNodes.length > 0) {
                        queryId = queryId[0].childNodes[0].nodeValue;
                        queryName = queryName[0].childNodes[0].nodeValue;
                        queryType = queryType.length > 0 && queryType[0].childNodes.length > 0 ? queryType[0].childNodes[0].nodeValue : "";
                        let subQueryPanels = subQuery.getElementsByTagName("panel");

                        const subQueryPanelsList = extractPanelList(subQueryPanels);

                        subQueryList.push({
                            queryId,
                            queryName,
                            queryType,
                            panels: subQueryPanelsList,
                        })
                    }
                }

                let subQueryConstraintElems = queryDefinitionElem.getElementsByTagName("subquery_constraint");
                let subQueryConstraintList = [];
                for (let i = 0; i < subQueryConstraintElems.length; i++) {
                    const subQueryConstraint = subQueryConstraintElems[i];

                    let firstQuery = subQueryConstraint.getElementsByTagName("first_query");
                    let secondQuery = subQueryConstraint.getElementsByTagName("first_query");
                    let operator = subQueryConstraint.getElementsByTagName("operator");
                    if (firstQuery.length > 0 && secondQuery.length
                        && operator.length > 0 && operator[0].childNodes[0].nodeValue) {
                        operator = operator[0].childNodes[0].nodeValue;
                        firstQuery = firstQuery[0];
                        secondQuery = secondQuery[0]
                        let firstQueryQueryId = firstQuery.getElementsByTagName("query_id");
                        let firstQueryJoinColumn = firstQuery.getElementsByTagName("join_column");
                        let firstQueryAggOperator = firstQuery.getElementsByTagName("aggregate_operator");

                        let secondQueryQueryId = secondQuery.getElementsByTagName("query_id");
                        let secondQueryJoinColumn = secondQuery.getElementsByTagName("join_column");
                        let secondQueryAggOperator = secondQuery.getElementsByTagName("aggregate_operator");
                        if (firstQueryQueryId.length > 0 && firstQueryQueryId[0].childNodes.length > 0
                            && firstQueryJoinColumn.length > 0 && firstQueryJoinColumn[0].childNodes.length > 0
                            && firstQueryAggOperator.length > 0 && firstQueryAggOperator[0].childNodes.length > 0
                            && secondQueryQueryId.length > 0 && secondQueryQueryId[0].childNodes.length > 0
                            && secondQueryJoinColumn.length > 0 && secondQueryJoinColumn[0].childNodes.length > 0
                            && secondQueryAggOperator.length > 0 && secondQueryAggOperator[0].childNodes.length > 0) {

                            firstQueryQueryId = firstQueryQueryId[0].childNodes[0].nodeValue;
                            firstQueryJoinColumn = firstQueryJoinColumn[0].childNodes[0].nodeValue;
                            firstQueryAggOperator = firstQueryAggOperator[0].childNodes[0].nodeValue;

                            secondQueryQueryId = secondQueryQueryId[0].childNodes[0].nodeValue;
                            secondQueryJoinColumn = secondQueryJoinColumn[0].childNodes[0].nodeValue;
                            secondQueryAggOperator = secondQueryAggOperator[0].childNodes[0].nodeValue;

                            let timeSpanElems = subQueryConstraint.getElementsByTagName("span");
                            let timeSpanList = [];
                            for (let i = 0; i < timeSpanElems.length; i++) {
                                const timeSpan = timeSpanElems[i];
                                let spanOperator = timeSpan.getElementsByTagName("operator");
                                let spanValue = timeSpan.getElementsByTagName("span_value");
                                let units = timeSpan.getElementsByTagName("units");
                                if (spanOperator.length > 0 && spanOperator[0].childNodes.length > 0
                                    && spanValue.length > 0 && spanValue[0].childNodes.length > 0
                                    && units.length > 0 && units[0].childNodes.length > 0)
                                {
                                    spanOperator = spanOperator[0].childNodes[0].nodeValue;
                                    spanValue = spanValue[0].childNodes[0].nodeValue;
                                    units = units[0].childNodes[0].nodeValue;
                                    timeSpanList.push({
                                        operator: spanOperator,
                                        value: spanValue,
                                        units
                                    })
                                }
                            }

                            subQueryConstraintList.push({
                                firstConstraint: {
                                    queryId: firstQueryQueryId,
                                    joinColumn: firstQueryJoinColumn,
                                    aggOperator: firstQueryAggOperator
                                },
                                secondConstraint: {
                                    queryId: secondQueryQueryId,
                                    joinColumn: secondQueryJoinColumn,
                                    aggOperator: secondQueryAggOperator
                                },
                                operator,
                                timeSpans: timeSpanList
                            });
                        }
                    }
                }

                queryDefinition.subqueryGroup = {
                    subquery: subQueryList,
                    subqueryConstraints: subQueryConstraintList
                }
            }
            queryRequest.queryMasterId = queryMasterId;
            queryRequest.queryName = queryName;
            queryRequest.username = username;
            queryRequest.queryRequestXml = queryRequestXml;
            queryRequest.queryRequestSQL = queryRequestSQL;
            queryRequest.queryDefinition = queryDefinition;
        }
    }

    return queryRequest;
}

export function* doGetQueryRequestDetails(action) {
    console.log("getting query request xml...");
    const { queryMasterId, groupId } = action.payload;

    try {
        const response = yield call(getQueryRequestXmlRequest, queryMasterId, groupId);

        if(response) {
            let queryRequest = parseQueryRequestXml(response);

            yield put(getQueryRequestDetailsSucceeded(queryRequest));
        }else{
            yield put(getQueryRequestDetailsFailed({errorMessage: "Error retrieving query request details."}));
        }
    } catch(e){
        console.error("Error retrieving query request details. ", e);
        yield put(getQueryRequestDetailsFailed({errorMessage: "Error retrieving query request details. " + e}));
    }finally {
        const msg = `get query request details thread closed`;
        yield msg;
    }
}

export function* getQueryRequestDetailsSaga() {
    yield takeLatest(GET_QUERY_REQUEST_DETAILS, doGetQueryRequestDetails);
}