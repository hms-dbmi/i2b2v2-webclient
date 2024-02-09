import { call, takeLatest, put, apply } from "redux-saga/effects";

import {
    GET_ALL_USERS_ACTION,
} from "actions";


export function* doGetAllUsers(action) {
    console.log("getting all users...");
}


export function* userSaga() {
    yield takeLatest(GET_ALL_USERS_ACTION.GET_ALL_USERS, doGetAllUsers);
}
