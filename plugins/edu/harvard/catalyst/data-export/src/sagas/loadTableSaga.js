import { call, takeLatest, put} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
/*import { AxiosResponse } from "axios";*/
import {loadTableSuccess, loadTableError} from "../reducers/loadTableSlice";

import {
    LOAD_DATA_TABLE
} from "../actions";
const rows = [
    { order: 1, id:123, name: "Patient Number", aggregation:"Value", included:true, demographic: true},
    { order: 2, id:122, name: "Gender", aggregation:"Value", included:true, demographic: true},
    { order: 3, id:121, name: "Age",  aggregation:"Value", included:true, demographic: true},
    { order: 4, id:111, name: "Race",  aggregation:"Value", included:false, demographic: true},
    { order: 5, id:58, name: "Ethnicity", aggregation:"Value", included:false, demographic: true},
    { order: 6, id:35, name: "Vital Status", aggregation:"Value", included:false, demographic: true},
    { order: 7, id:36, name: "Hemoglobin A1C (Test:mcsq-a1c)",  aggregation:"Maximum Value"},
    { order: 8, id:25, name: "Hemoglobin A1C (Test:mcsq-a1c)", aggregation:"Mode (Most Frequent Value)"},
    { order: 9, id:136, name: "Hemoglobin A1C (Test:mcsq-a1c)",  aggregation:"Date (Most Recent)"},
    { order: 10, id:125, name: "Hemoglobin A1C (Test:mcsq-a1c)", aggregation:"Average Value"}
];

export function* doLoadTable(action) {
    try {
        // You can also export the axios call as a function.
        //const response = yield axios.get(`your-server-url:port/api/users/${id}`);
        const response = {data: rows};

        yield put(loadTableSuccess(response.data));
    } catch (error) {
        yield put(loadTableError({error: "There was an error loading the data table"}));
    }
}


export function* loadTableSaga() {
    yield takeLatest(LOAD_DATA_TABLE, doLoadTable);
}
