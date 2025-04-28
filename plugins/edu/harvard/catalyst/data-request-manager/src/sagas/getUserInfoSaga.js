/* globals i2b2 */

import {all, call, put, takeLatest} from "redux-saga/effects";
import { GET_USER_INFO} from "../actions";
import {getUserInfoError, getUserInfoSuccess} from "../reducers/userInfoSlice";

const getUserNameRequest = () => i2b2.authorizedTunnel.variable["i2b2.PM.model.login_username"].then((username) => username);
const getUserRolesRequest = () => i2b2.authorizedTunnel.variable["i2b2.PM.model.userRoles"].then((userRoles) => userRoles);
const isAdminUserRequest = () => i2b2.authorizedTunnel.variable["i2b2.PM.model.isAdmin"].then((isAdmin) => isAdmin);


export function* doGetUserInfo(action) {
    try {
        const [username, userRoles, isAdmin] = yield all([
            call(getUserNameRequest),
            call(getUserRolesRequest),
            call(isAdminUserRequest)
        ]);

        if (username !== undefined && userRoles !== undefined) {
            const isManager = userRoles.includes('MANAGER');
            const  isObfuscated = !userRoles.includes('DATA_AGG');
            yield put(getUserInfoSuccess({isAdmin, isManager, username, isObfuscated}));
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