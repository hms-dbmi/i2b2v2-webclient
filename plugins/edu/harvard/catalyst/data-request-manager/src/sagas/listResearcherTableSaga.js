/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {listResearcherTableSuccess, listResearcherTableError} from "../reducers/listResearcherTableSlice";
import {requestList} from "./testData";

import {
    LIST_RESEARCHER_TABLE
} from "../actions";

/*const parseData = (tableList) => {
    let results = [];

    return results;
}*/

const getTestData = () => {
    return requestList;
}

export function* doListResearcherTable(action) {
    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(); //parseData(yield response.json());
            yield put(listResearcherTableSuccess(data));
        } else {
            yield put(listResearcherTableError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
        }
    } catch (error) {
        yield put(listResearcherTableError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
    }
}


export function* listResearcherTableSaga() {
    yield takeLatest(LIST_RESEARCHER_TABLE, doListResearcherTable);
}