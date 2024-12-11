/* globals i2b2 */

import {put, takeLatest} from "redux-saga/effects";
import {GET_REQUEST_DETAILS} from "../actions";
import {getRequestDetailsError, getRequestDetailsSuccess} from "../reducers/getRequestDetailsSlice";
import {requestDetails} from "./testData";


const getTestData = (requestId) => {
    const request = requestDetails.filter((req) => req.id === requestId);
    return request.length > 0 ? request[0] : {};
}

export function* doGetRequestDetails(action) {
    const { id } = action.payload;
    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(id); //parseData(yield response.json());
            yield put(getRequestDetailsSuccess(data));
        } else {
            yield put(getRequestDetailsError({errorMessage: "There was an error retrieving the request details"}));
        }
    } catch (error) {
        yield put(getRequestDetailsError({errorMessage: "There was an error retrieving the request details"}));
    }
}


export function* getRequestDetailsSaga() {
    yield takeLatest(GET_REQUEST_DETAILS, doGetRequestDetails);
}