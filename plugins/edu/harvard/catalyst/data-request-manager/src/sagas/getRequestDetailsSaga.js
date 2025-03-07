/* globals i2b2 */

import {call, put, takeLatest} from "redux-saga/effects";
import {GET_REQUEST_DETAILS} from "../actions";
import {getRequestDetailsError, getRequestDetailsSuccess} from "../reducers/requestDetailsSlice";
import XMLParser from "react-xml-parser";
import {decode} from 'html-entities';

const getExportRequestDetailRequest = (queryResultInstanceId) => {
    let data = {
        qr_key_value: queryResultInstanceId,
    };
    return i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

const parseExportRequestDetailXml = (exportRequestListXml) => {
    let exportRequestDetail = {
        email: '',
        statusLogs: []
    };

    let crcXmlResult = exportRequestListXml.getElementsByTagName('crc_xml_result');
    if(crcXmlResult.length > 0){
        crcXmlResult = crcXmlResult[0];
        let xmlValue = crcXmlResult.getElementsByTagName('xml_value');
        if(xmlValue.length > 0) {
            xmlValue = xmlValue[0].value;
            xmlValue = decode(xmlValue);
            let parsedXmlValue = new XMLParser().parseFromString(xmlValue);
            let dataList = parsedXmlValue.getElementsByTagName('data');
            dataList.forEach(data => {
                let column = data.attributes['column'];
                if(column.length > 0 && column.toUpperCase() === "EMAIL"){
                    exportRequestDetail.email = data.value;
                }
            })
        }
    }

    return exportRequestDetail;
}

export function* doGetRequestDetails(action) {
    const { requestRow, isManager } = action.payload;

    try {
        let response;
        const isResultInstanceIdAvailable = requestRow.requests.length > 0 && requestRow.requests[0].resultInstanceId;
        if(isResultInstanceIdAvailable){
            response = yield call(getExportRequestDetailRequest, requestRow.requests[0].resultInstanceId);
        }

        if(!isResultInstanceIdAvailable){
            yield put(getRequestDetailsError({errorMessage: "There was an error getting result instance id for retrieving the request details"}));
        }
        else if (!response.error) {
            const emailAndStatusLogs = parseExportRequestDetailXml(response);
            let requestDetails = { ...requestRow };
            requestDetails.email = emailAndStatusLogs.email;
            requestDetails.statusLogs = emailAndStatusLogs.statusLogs;
            yield put(getRequestDetailsSuccess({requestDetails, isManager}));
        } else {
            yield put(getRequestDetailsError({errorMessage: "There was an error getting the request details"}));
        }
    } catch (error) {
        yield put(getRequestDetailsError({errorMessage: "There was an error getting the request details"}));
    }
}

export function* getRequestDetailsSaga() {
    yield takeLatest(GET_REQUEST_DETAILS, doGetRequestDetails);
}