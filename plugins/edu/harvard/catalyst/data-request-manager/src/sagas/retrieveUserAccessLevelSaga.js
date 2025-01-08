/* globals i2b2 */

import {call, put, takeLatest} from "redux-saga/effects";
import {retrieveUserAccessLevelError, retrieveUserAccessLevelSuccess} from "../reducers/retrieveUserAccessLevelSlice";
import { RETRIEVE_USER_ACCESS_LEVEL} from "../actions";

const getUserAccessLevelRequest = () => i2b2.authorizedTunnel.variable["i2b2.PM.model.userRoles"].then((userRoles) => userRoles);

export function* doRetrieveUserAccessLevel(action) {
    try {
        const response = yield call(getUserAccessLevelRequest);

        let isAdmin = false;
        if (response && response.length > 0) {
            isAdmin = response.includes('EDITOR');
        }

        if (isAdmin) {
            yield put(retrieveUserAccessLevelSuccess(isAdmin));
        } else {
            yield put(retrieveUserAccessLevelError({errorMessage: "There was an error retrieving the list user access level"}));
        }
    } catch (error) {
        yield put(retrieveUserAccessLevelError({errorMessage: "There was an error retrieving the user access level"}));
    }
}


export function* retrieveUserAccessLevelSaga() {
    yield takeLatest(RETRIEVE_USER_ACCESS_LEVEL, doRetrieveUserAccessLevel);
}