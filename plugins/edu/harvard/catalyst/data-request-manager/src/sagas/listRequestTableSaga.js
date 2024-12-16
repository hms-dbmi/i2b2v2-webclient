/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {listRequestTableSuccess, listRequestTableError} from "../reducers/listRequestTableSlice";
import {requestList, adminRequestList} from "./testData";

import {
    LIST_REQUEST_TABLE
} from "../actions";

/*const parseData = (tableList) => {
    let results = [];

    return results;
}*/

const getTestData = (isAdmin) => {
    let data = requestList;
    if(isAdmin) {
       data = adminRequestList;
    }
    return data;
}

export function* doListRequestTable(action) {
    const { isAdmin } = action.payload;

    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(isAdmin); //parseData(yield response.json());
            yield put(listRequestTableSuccess({researcherRequests: data, isAdmin: isAdmin}));
        } else {
            yield put(listRequestTableError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
        }
    } catch (error) {
        yield put(listRequestTableError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
    }
}


export function* listRequestTableSaga() {
    yield takeLatest(LIST_REQUEST_TABLE, doListRequestTable);
}