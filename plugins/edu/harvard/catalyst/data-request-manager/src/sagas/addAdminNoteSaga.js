/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {adminRequestDetails} from "./testData";

import {
    ADD_ADMIN_NOTE
} from "../actions";
import {addAdminNoteError, addAdminNoteSuccess} from "../reducers/adminNotesSlice";


const updateTestData = (requestId, data) => {
    const adminRequest = adminRequestDetails.filter((req) => req.id === requestId);
    if(adminRequest.length > 0) {
        adminRequest[0].adminNotes.push({
            id: data.id,
            date: data.date,
            note: data.note
        });
    }

}
export function* doAddAdminNote(action) {
    const { note, requestId, date } = action.payload;

    try {
        const adminRequest = adminRequestDetails.filter((req) => req.id === requestId);

        let response = {ok: true};
        if (response.ok) {
            const data = {
                id: adminRequest[0].adminNotes.length + 1,
                date: date.toLocaleString(),
                note: note
            }; //parseData(yield response.json());
            updateTestData(requestId, data);
            yield put(addAdminNoteSuccess({note: data}));
        } else {
            yield put(addAdminNoteError({errorMessage: "There was an error adding note"}));
        }
    } catch (error) {
        yield put(addAdminNoteError({errorMessage: "There was an error adding note"}));
    }
}


export function* addAdminNoteSaga() {
    yield takeLatest(ADD_ADMIN_NOTE, doAddAdminNote);
}