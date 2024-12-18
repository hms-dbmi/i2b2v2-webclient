/* globals i2b2 */

import {put, takeLatest} from "redux-saga/effects";
import {GET_REQUEST_DETAILS} from "../actions";
import {getRequestDetailsError, getRequestDetailsSuccess} from "../reducers/getRequestDetailsSlice";
import {requestDetails, adminRequestDetails} from "./testData";


const getTestData = (requestId, isAdmin) => {
    let request = null;

    if(isAdmin){
        request = adminRequestDetails.filter((req) => req.id === requestId);
    }else{
        request = requestDetails.filter((req) => req.id === requestId);
    }
    return request.length > 0 ? request[0] : {};
}

export function* doGetRequestDetails(action) {
    const { id, isAdmin } = action.payload;
    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(id, isAdmin); //parseData(yield response.json());
            yield put(getRequestDetailsSuccess({requestDetails: data, isAdmin: isAdmin}));
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