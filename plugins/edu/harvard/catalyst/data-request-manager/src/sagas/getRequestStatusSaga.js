/* globals i2b2 */

import {call, put, takeLatest} from "redux-saga/effects";
import {GET_REQUEST_DETAILS, GET_REQUEST_STATUS} from "../actions";
import {getRequestDetailsError, getRequestDetailsSuccess} from "../reducers/requestDetailsSlice";
import XMLParser from "react-xml-parser";
import {decode} from 'html-entities';
import {getRequestStatusError, getRequestStatusSuccess} from "../reducers/requestTableSlice";

const getRequestStatusRequest = (queryMasterId, comments) => {
    let data = {
        qm_key_value: queryMasterId,
    };
    return i2b2.ajax.CRC.getQueryInstanceList_fromQueryMasterId(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

const parseRequestStatusXml = (requestStatusXml) => {
    let status= "";

    let queryInstance = requestStatusXml.getElementsByTagName('query_instance');
    if (queryInstance.length > 0) {
        queryInstance = queryInstance[0];
        let queryInstanceStatus = queryInstance.getElementsByTagName('batch_mode');
        if(queryInstanceStatus.length > 0) {
            status = queryInstanceStatus[0].value;
        }
    }

    return status;
}

export function* doGetRequestStatus(action) {
    const { queryMasterId  } = action.payload;

    try {
        const response = yield call(getRequestStatusRequest, queryMasterId);

        if (!response.error) {
            const requestStatus = parseRequestStatusXml(response);
            yield put(getRequestStatusSuccess({queryMasterId, requestStatus}));
        } else {
            yield put(getRequestStatusError({queryMasterId, errorMessage: "There was an error getting the request status"}));
        }
    } catch (error) {
        console.log("There was an error getting the request status: " + error);
        yield put(getRequestStatusError({queryMasterId, errorMessage: "There was an error getting the request status"}));
    }
}

export function* getRequestStatusSaga() {
    yield takeLatest(GET_REQUEST_STATUS, doGetRequestStatus);
}