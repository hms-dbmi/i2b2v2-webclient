import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    DELETE_USER_ACTION,
    deleteUserFailed,
    deleteUserSucceeded,
} from "actions";

const deleteUserRequest = (username) => {
    const data = {
        user_name: username
    };

    return i2b2.ajax.PM.deleteUser(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

export function* doDeleteUser(action) {
    const { user } = action.payload;
    console.log("deleting user " + user.username + "..." );
    try {
        const response = yield call(deleteUserRequest, user.username);

        if(!response.toString().includes("AJAX_ERROR")) {
            yield put(deleteUserSucceeded());
        }else{
            yield put(deleteUserFailed(response));
        }
    } finally {
        const msg = `delete user thread closed`;
        yield msg;
    }
}

export function* deleteUserSaga() {
    yield takeLatest(DELETE_USER_ACTION.DELETE_USER, doDeleteUser);
}
