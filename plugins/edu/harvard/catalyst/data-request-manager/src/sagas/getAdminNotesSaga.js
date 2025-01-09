/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {adminRequestDetails} from "./testData";

import {
    GET_ADMIN_NOTES
} from "../actions";
import {getAdminNotesError, getAdminNotesSuccess} from "../reducers/adminNotesSlice";


const getTestData = (requestId) => {
    const adminRequestDet = adminRequestDetails.filter((req) => req.id === requestId);
    return adminRequestDet.length > 0 ? adminRequestDet[0].adminNotes : [];
}

export function* doGetAdminNotes(action) {
    const { requestId  } = action.payload;

    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(requestId); //parseData(yield response.json());
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