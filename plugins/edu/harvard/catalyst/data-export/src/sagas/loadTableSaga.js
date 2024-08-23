import { call, takeLatest, put} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
/*import { AxiosResponse } from "axios";*/
import {loadTableSuccess, loadTableError} from "../reducers/loadTableSlice";

import {
    LOAD_DATA_TABLE
} from "../actions";
import {TableDefinition} from "../models";
const defaultRows = TableDefinition().rows;

export function* doLoadTable(action) {
    let rows = [];

    // load the basic required columns if this is the startup run
    if (action.payload === undefined) rows = defaultRows;

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
