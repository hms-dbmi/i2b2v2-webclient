import { call, put, takeLatest} from "redux-saga/effects";
import {renameTableSuccess, renameTableError} from "../reducers/tableListingSlice";
import XMLParser from 'react-xml-parser';

import {
    RENAME_TABLE
} from "../actions";
/* global i2b2 */

const renameTableRequest = (tableId, title) => {

    let data = {
        tableId: tableId,
        title: title
    };

    return i2b2.ajax.CRC.renameTable(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doRenameTable(action) {
    let {id, title}  = action.payload;

    try {
        let response = yield call(renameTableRequest, id, title);
        if(!response.error) {
            yield put(renameTableSuccess());
        }else{
            console.error("Error renaming the table definition! Message: " + response.errorMsg + ". Error details: " + response.errorData);
            yield put(renameTableError({errorMessage: "There was an error renaming the table definition " + title}));
        }
    } catch (error) {
        console.log("Caught load table error " + error);
        yield put(renameTableError({errorMessage: "There was an error renaming the table definition " + title}));
    }
}


export function* renameTableSaga() {
    yield takeLatest(RENAME_TABLE, doRenameTable);
}
