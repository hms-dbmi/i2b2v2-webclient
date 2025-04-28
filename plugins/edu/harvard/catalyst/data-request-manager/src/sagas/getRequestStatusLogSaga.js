/* globals i2b2 */

import {all, call, put, takeLatest} from "redux-saga/effects";
import {GET_REQUEST_STATUS_LOG} from "../actions";
import {getRequestStatusLogError, getRequestStatusLogSuccess} from "../reducers/requestStatusLogSlice";
import XMLParser from "react-xml-parser";
import {decode} from 'html-entities';
import {DateTime} from "luxon";
import {RequestStatus} from "../models";

const getRequestStatusLogRequest = (exportRequest) => {
    let data = {
        qr_key_value: exportRequest.resultInstanceId,
    };
    return i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId(data).then((xmlString) => {
        return {
            description: exportRequest.description,
            xml: new XMLParser().parseFromString(xmlString)
        }
    }).catch((err) => err);
};

const parseRequestStatusLogXml = (requestStatusLogXmlAndDesc) => {
    let exportRequestDetail = {
        description:  requestStatusLogXmlAndDesc.description,
        statusLogs: []
    };

    let crcXmlResult = requestStatusLogXmlAndDesc.xml.getElementsByTagName('crc_xml_result');
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
                column = column.replace("Request Submitted", "SUBMITTED");
                //check of this is a status
                const status = RequestStatus.statuses[column];
                if(status){
                    const id = exportRequestDetail.statusLogs.length + 1;
                    let inputFormat = "yyyyLLdd_HHmmss";
                    let date = data.value;//.split("_");
                    if(date.length > 0){
                        date = DateTime.fromFormat(date, inputFormat, {zone: 'utc'});
                        exportRequestDetail.statusLogs.push({id, date, status});
                    }
                }
            })
        }
    }

    return exportRequestDetail;
}

export function* doGetRequestStatusLog(action) {
    const { exportRequests } = action.payload;

    try {
        const requestStatusLogRequestList = exportRequests.map(exportRequest => call(getRequestStatusLogRequest, exportRequest));

        const responseList = yield all(requestStatusLogRequestList);

        const hasErrors = responseList.some(response => response.error === true);
        if (!hasErrors) {
            const requestStatusLog = responseList.map(response => parseRequestStatusLogXml(response));
            yield put(getRequestStatusLogSuccess({requestStatusLog}));
        } else {
            yield put(getRequestStatusLogError({errorMessage: "There was an error getting status log for requests"}));
        }
    } catch (error) {
        yield put(getRequestStatusLogError({errorMessage: "There was an error getting status log for requests"}));
    }
}

export function* getRequestStatusLogSaga() {
    yield takeLatest(GET_REQUEST_STATUS_LOG, doGetRequestStatusLog);
}