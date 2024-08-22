import { call, takeLatest, put} from "redux-saga/effects";
/*import { PayloadAction } from "@reduxjs/toolkit";*/
import {listTablesSuccess, listTablesError} from "../reducers/listTablesSlice";

import {
    LIST_TABLES
} from "../actions";

export function* doListTables(action) {
    try {
        // You can also export the axios call as a function.
        //const response = yield axios.get(`your-server-url:port/api/users/${id}`);
        const response = "";

        yield put(listTablesSuccess());
    } catch (error) {
        yield put(listTablesError({errorMessage: "There was an error saving the data table"}));
    }
}


export function* listTablesSaga() {
    yield takeLatest(LIST_TABLES, doListTables);
}