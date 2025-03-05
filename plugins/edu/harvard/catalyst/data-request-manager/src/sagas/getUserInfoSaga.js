/* globals i2b2 */

import {all, call, put, takeLatest} from "redux-saga/effects";
import { GET_USER_INFO} from "../actions";
import {getUserInfoError, getUserInfoSuccess} from "../reducers/userInfoSlice";

const getUserNameRequest = () => i2b2.authorizedTunnel.variable["i2b2.PM.model.login_username"].then((username) => username).catch((error) => {
    console.error("Error getUsername:", error); // This will be executed if the promise is rejected
});
const isAdminUserRequest = () => i2b2.authorizedTunnel.variable["i2b2.PM.model.isAdmin"].then((isAdmin) => isAdmin).catch((error) => {
    console.error("Error isAdmin:", error); // This will be executed if the promise is rejected
});

export function* doGetUserInfo(action) {
    try {
        const [username, isAdmin] = yield all([
            call(getUserNameRequest),
            call(isAdminUserRequest)
        ])

        if (username !== undefined && isAdmin !== undefined) {
            yield put(getUserInfoSuccess({isAdmin, username}));
        } else {
            yield put(getUserInfoError({errorMessage: "There was an error getting the user info"}));
        }
    } catch (error) {
        yield put(getUserInfoError({errorMessage: "There was an error getting the user info"}));
    }
}


export function* getUserInfoSaga() {
    yield takeLatest(GET_USER_INFO, doGetUserInfo);
}