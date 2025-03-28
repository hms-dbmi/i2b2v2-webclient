import {takeLatest, put, call} from "redux-saga/effects";
import {deleteTableSuccess, deleteTableError} from "../reducers/tableListingSlice";

import {
    DELETE_TABLE
} from "../actions";
import XMLParser from "react-xml-parser";
/* global i2b2 */

const deleteTableRequest = (tableId) => {

    let data = {
        tableId: tableId,
    };

    return i2b2.ajax.CRC.deleteTable(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doDeleteTable(action) {
    let { tableId, isShared } = action.payload;

    try {
        let response = yield call(deleteTableRequest, tableId);

        if(!response.error) {
            yield put(deleteTableSuccess({tableId, isShared}));
        }else{
            console.error("Error deleting table! Message: " + response.errorMsg + ". Error details: " + response.errorData);
            yield put(deleteTableError({errorMessage: "There was an error deleting the table."}));
        }
    } catch (error) {
        yield put(deleteTableError({errorMessage: "There was an error deleting the table."}));
    }
}


export function* deleteTableSaga() {
    yield takeLatest(DELETE_TABLE, doDeleteTable);
}
