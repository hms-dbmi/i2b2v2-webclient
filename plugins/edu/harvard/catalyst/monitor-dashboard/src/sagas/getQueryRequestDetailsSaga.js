import { call, takeLatest, put} from "redux-saga/effects";
import {GET_QUERY_REQUEST_DETAILS} from "../actions";
import {parseXml} from "../utilities/parseXml";
import {getQueryRequestDetailsFailed, getQueryRequestDetailsSucceeded} from "../reducers/queryRequestDetailsSlice";
import xmlFormat from 'xml-formatter';

//a function that returns a promise
const getQueryRequestXmlRequest = (queryMasterId) => {
    let data = {
        qm_key_value: queryMasterId,
    };

    return i2b2.ajax.CRC.getRequestXml_fromQueryMasterId(data).then((xmlString) => parseXml(xmlString));
}

const parseQueryRequestXml = (queryRequestXml) => {
    let queryRequest = {
        queryMasterId: null,
        queryName: "",
        queryRequestXml: ""
    };

    let queryMaster = queryRequestXml.getElementsByTagName('query_master');
    if(queryMaster.length > 0){
        queryMaster = queryMaster[0];
        let queryMasterId = queryMaster.getElementsByTagName('query_master_id');
        let queryName = queryMaster.getElementsByTagName('name');
        let queryRequestXml = queryMaster.getElementsByTagName('request_xml');

        if((queryMasterId.length > 0 && queryMasterId[0].childNodes.length !== 0)
        && queryName.length > 0 && queryName[0].childNodes.length !== 0
        && queryRequestXml.length > 0 && queryRequestXml[0].childNodes.length !== 0) {
            queryMasterId = queryMasterId[0].childNodes[0].nodeValue;
            queryName = queryName[0].childNodes[0].nodeValue;
            queryRequestXml = xmlFormat(queryRequestXml[0].innerHTML.trim());

            queryRequest.queryMasterId = queryMasterId;
            queryRequest.queryName = queryName;
            queryRequest.queryRequestXml = queryRequestXml;
        }
    }

    return queryRequest;
}

export function* doGetQueryRequestDetails(action) {
    console.log("getting query request xml...");
    const { queryMasterId } = action.payload;

    try {
        const response = yield call(getQueryRequestXmlRequest, queryMasterId);

        if(response) {
            let queryRequest = parseQueryRequestXml(response);
            console.log("query request: ", JSON.stringify(queryRequest));

            yield put(getQueryRequestDetailsSucceeded(queryRequest));
        }else{
            yield put(getQueryRequestDetailsFailed(response));
        }
    } finally {
        const msg = `get query request details thread closed`;
        yield msg;
    }
}

export function* getQueryRequestDetailsSaga() {
    yield takeLatest(GET_QUERY_REQUEST_DETAILS, doGetQueryRequestDetails);
}