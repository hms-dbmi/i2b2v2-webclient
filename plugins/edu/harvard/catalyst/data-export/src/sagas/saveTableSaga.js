import { call, takeLatest, put} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {saveTableSuccessAction, saveTableErrorAction} from "../reducers/saveTableSlice";

import {
    SAVE_DATA_TABLE
} from "../actions";

export function* doSaveTable(action) {
    try {
        // You can also export the axios call as a function.
        //const response = yield axios.get(`your-server-url:port/api/users/${id}`);
        const response = "";

        yield put(saveTableSuccessAction());
    } catch (error) {
        yield put(saveTableErrorAction({error: "There was an error saving the data table"}));
    }
}


export function* saveTableSaga() {
    yield takeLatest(SAVE_DATA_TABLE, doSaveTable);
}
