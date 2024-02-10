import { call, takeLatest, put, apply } from "redux-saga/effects";
import {
    GET_ALL_USERS_ACTION,
    getAllUsersFailed,
    getAllUsersSucceeded,
} from "actions";

//a function that returns a promise
const getAllUsersActions = () => i2b2.ajax.PM.getAllUser({}).then((xmlString) => xmlString);

export function* doGetAllUsers(action) {
    console.log("getting all users...");
    try {
        const response = yield call(getAllUsersActions);
        if(response) {
            console.log("Response succeeded. Response is " + response) ;
            yield put(getAllUsersSucceeded(response));
        }else{
            yield put(getAllUsersFailed(response));
        }
    } finally {
        const msg = `get all users thread closed`;
        yield msg;
    }
}

export function* allUsersSaga() {
    yield takeLatest(GET_ALL_USERS_ACTION.GET_ALL_USERS, doGetAllUsers);
}
