/* globals i2b2 */

import {call, put, takeLatest} from "redux-saga/effects";
import {getUserAccessLevelError, getUserAccessLevelSuccess} from "../reducers/userAccessLevelSlice";
import { GET_USER_ACCESS_LEVEL} from "../actions";

const getUserAccessLevelRequest = () => i2b2.authorizedTunnel.variable["i2b2.PM.model.userRoles"].then((userRoles) => userRoles);

export function* doGetUserAccessLevel(action) {
    try {
        const response = yield call(getUserAccessLevelRequest);

        let isAdmin = false;
        if (response && response.length > 0) {
            isAdmin = response.includes('MANAGER');
        }

        if (isAdmin) {
            yield put(getUserAccessLevelSuccess(isAdmin));
        } else {
            yield put(getUserAccessLevelError({errorMessage: "There was an error getting the list user access level"}));
        }
    } catch (error) {
        yield put(getUserAccessLevelError({errorMessage: "There was an error getting the user access level"}));
    }
}


export function* getUserAccessLevelSaga() {
    yield takeLatest(GET_USER_ACCESS_LEVEL, doGetUserAccessLevel);
}