/* globals i2b2 */

import {put, takeLatest} from "redux-saga/effects";
import {GENERATE_DATA_FILE} from "../actions";
import {generateDataFileError, generateDataFileSuccess} from "../reducers/getRequestDetailsSlice";


export function* doGenerateDataFile(action) {
    const { requestId } = action.payload;
    try {
        let response = {ok: true};
        if (response.ok) {
            yield put(generateDataFileSuccess({requestId: requestId}));
        } else {
            yield put(generateDataFileError({errorMessage: "There was an error generating the file(s)"}));
        }
    } catch (error) {
        yield put(generateDataFileError({errorMessage: "There was an error generating the file(s)"}));
    }
}


export function* generateDataFileSaga() {
    yield takeLatest(GENERATE_DATA_FILE, doGenerateDataFile);
}