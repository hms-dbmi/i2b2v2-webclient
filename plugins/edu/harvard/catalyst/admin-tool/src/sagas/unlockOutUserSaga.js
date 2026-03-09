import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    UNLOCK_OUT_USER,
} from "../actions";
import {unlockOutUserFailed, unlockOutUserSucceeded} from "../reducers/allUsersSlice";

const unlockUserRequest = (user) => {

    let data = {
        user_name: user.username,
        project_id_xml: ""
    };

    return i2b2.ajax.PM.unlockUser(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doUnlockOutUser(action) {
    const { user } = action.payload;

    console.log("unlocking out user " + user.username + "from all projects ...");

    try {
        let response = yield call(unlockUserRequest, user);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(unlockOutUserSucceeded({user}));
        }else{
            yield put(unlockOutUserFailed({user}));
        }
    } finally {
        const msg = `unlock out user thread closed`;
        yield msg;
    }
}

export function* unlockOutUserSaga() {
    yield takeLatest(UNLOCK_OUT_USER, doUnlockOutUser);
}