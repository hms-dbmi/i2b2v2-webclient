/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {adminNotes} from "./testData";

import {
    GET_ADMIN_NOTES
} from "../actions";
import {getAdminNotesError, getAdminNotesSuccess} from "../reducers/adminNotesSlice";


const getTestData = () => {
    let data = adminNotes;

    return data;
}

export function* doGetAdminNotes(action) {
    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(); //parseData(yield response.json());
            yield put(getAdminNotesSuccess({notes: data}));
        } else {
            yield put(getAdminNotesError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
        }
    } catch (error) {
        yield put(getAdminNotesError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
    }
}


export function* getAdminNotesSaga() {
    yield takeLatest(GET_ADMIN_NOTES, doGetAdminNotes);
}