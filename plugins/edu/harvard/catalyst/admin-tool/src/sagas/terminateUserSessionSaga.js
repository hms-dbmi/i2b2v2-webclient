import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
     TERMINATE_USER_SESSION,
} from "../actions";

import {terminateUserSessionFailed, terminateUserSessionSucceeded} from "../reducers/allUsersSlice";

const terminateUserSessionRequest = (user) => {

    let data = {
        username: user.username,
        password: '<password>@</password>'
    };

    return i2b2.ajax.PM.logoutUser(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doTerminateUserSession(action) {
    const { user } = action.payload;

    console.log("terminating user session for user " + user.username + "...");

    try {
        let response = yield call(terminateUserSessionRequest, user);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(terminateUserSessionSucceeded({user}));
        }else{
            yield put(terminateUserSessionFailed({user}));
        }
    } finally {
        const msg = `terminate user session thread closed`;
        yield msg;
    }
}

export function* terminateUserSessionSaga() {
    yield takeLatest(TERMINATE_USER_SESSION, doTerminateUserSession);
}