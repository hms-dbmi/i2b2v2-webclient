/* globals i2b2 */

import {call, put, takeLatest} from "redux-saga/effects";
import {GET_REQUEST_DETAILS} from "../actions";
import {getRequestDetailsError, getRequestDetailsSuccess} from "../reducers/requestDetailsSlice";
import {requestDetails, adminRequestDetails} from "./testData";
import XMLParser from "react-xml-parser";


const getExportRequestDetailRequest = (queryResultInstanceId) => {
    let data = {
        qr_key_value: queryResultInstanceId//1394,
    };
    return i2b2.ajax.CRC.getQueryResultInstanceList_fromQueryResultInstanceId(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

const getTestData = (requestId, isManager) => {
    let request = null;

    if(isManager){
        request = adminRequestDetails.filter((req) => req.id === requestId);
    }else{
        request = requestDetails.filter((req) => req.id === requestId);
    }
    return request.length > 0 ? request[0] : {};
}

export function* doGetRequestDetails(action) {
    const { requestRow, isManager } = action.payload;

    let response1 = yield call(getExportRequestDetailRequest, requestRow.id);
    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(requestRow.id, isManager); //parseData(yield response.json());
            yield put(getRequestDetailsSuccess({requestDetails: data, isManager}));
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