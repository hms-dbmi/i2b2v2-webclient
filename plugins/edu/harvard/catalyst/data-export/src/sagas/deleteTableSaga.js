import { takeLatest, put} from "redux-saga/effects";
import {deleteTableSuccess, deleteTableError} from "../reducers/tableListingSlice";

import {
    DELETE_TABLE
} from "../actions";
/* global i2b2 */


export function* doDeleteTable(action) {
    let { tableId, isShared } = action.payload;

    try {

        const response = {
            ok: true
        }
        if(response.ok) {
            //const data = yield response.json();
            yield put(deleteTableSuccess({tableId, isShared}));
        }else{
            console.error("Error deleting table! Status code: " + response.status + "Message: " + response.statusText);
            yield put(deleteTableError({errorMessage: "There was an error deleting the table."}));
        }
    } catch (error) {
        yield put(deleteTableError({errorMessage: "There was an error deleting the table."}));
    }
}



export function* deleteTableSaga() {
    yield takeLatest(DELETE_TABLE, doDeleteTable);
}
