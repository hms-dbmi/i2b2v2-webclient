import { call, takeLatest, put} from "redux-saga/effects";
import {getQueryMetricsFailed, getQueryMetricsSucceeded} from "../reducers/queryMetricsSlice";
import {GET_QUERY_METRICS} from "../actions";
import {parseXml} from "../utilities/parseXml";
import {decode} from 'html-entities';

//a function that returns a promise
const getQueryMetricsRequest = (projectId) => {
    let data = {
        sec_project: projectId,
        psm_result_output: '<result_output_list>'
            +   '<result_output priority_index="1" name="ADMIN_QUERY_DASHBOARD_CLASS_XML"/>'
            +   '</result_output_list>'
    };

    return i2b2.ajax.CRC.runBreakdown(data).then((xmlString) => parseXml(xmlString));
}

const parseQueryMetricsRequestXml = (queryMetricsRequestListXml) => {
    let queryMetrics = {
        totalQuery: null,
        totalQuery1Days: null,
        totalQuery7Days: null,
        totalQuery30Days: null,
        topUsers: []
    };

    let crcXmlResult = queryMetricsRequestListXml.getElementsByTagName('crc_xml_result');
    if(crcXmlResult.length > 0){
        crcXmlResult = crcXmlResult[0];
        let xmlValue = crcXmlResult.getElementsByTagName('xml_value');
        if(xmlValue.length > 0 && xmlValue[0].childNodes.length !== 0) {
            xmlValue = xmlValue[0].childNodes[0].nodeValue;
            xmlValue = decode(xmlValue);
            let parsedXmlValue = parseXml(xmlValue);
            let dataList = parsedXmlValue.getElementsByTagName('data');
            for (let i = 0; i < dataList.length; i++) {
                let data = dataList[i];
                let dataValue = null;
                if(data.childNodes.length !== 0){
                    dataValue = data.childNodes[0].nodeValue;
                }

                let column = data.getAttribute('column');
                if(!column){
                    column = '';
                }

                let type = data.getAttribute('type');
                if(!type){
                    type = '';
                }

                if(column.toUpperCase() === "TOTAL_QUERIES" && type.toUpperCase() === "ADMIN_TOTAL_QUERY"){
                    queryMetrics.totalQuery = dataValue;
                }
                if(column.toUpperCase() === "TOTAL_QUERIES" && type.toUpperCase() === "ADMIN_TOTAL_QUERY_1DAYS"){
                    queryMetrics.totalQuery1Days = dataValue;
                }
                if(column.toUpperCase() === "TOTAL_QUERIES" && type.toUpperCase() === "ADMIN_TOTAL_QUERY_7DAYS"){
                    queryMetrics.totalQuery7Days = dataValue;
                }
                if(column.toUpperCase() === "TOTAL_QUERIES" && type.toUpperCase() === "ADMIN_TOTAL_QUERY_30DAYS"){
                    queryMetrics.totalQuery30Days = dataValue;
                }
            }
        }
    }

    return queryMetrics;
}

export function* doGetQueryMetrics(action) {
    console.log("getting query metrics...");
    const { projectId } = action.payload;

    try {
        const response = yield call(getQueryMetricsRequest, projectId);

        if(response) {
            let queryMetrics = parseQueryMetricsRequestXml(response);
            yield put(getQueryMetricsSucceeded(queryMetrics));
        }else{
            yield put(getQueryMetricsFailed(response));
        }
    } finally {
        const msg = `get query metrics thread closed`;
        yield msg;
    }
}

export function* getQueryMetricsSaga() {
    yield takeLatest(GET_QUERY_METRICS, doGetQueryMetrics);
}