import { call, takeLatest, put} from "redux-saga/effects";
/*import { PayloadAction } from "@reduxjs/toolkit";*/
import {makeRequestSuccess, makeRequestError} from "../reducers/makeRequestSlice";
import {
    MAKE_REQUEST
} from "../actions";

export function* doMakeRequest(action) {
    try {
        // You can also export the axios call as a function.
        //const response = yield axios.get(`your-server-url:port/api/users/${id}`);
        const response = "";

        yield put(makeRequestSuccess());
    } catch (error) {
        yield put(makeRequestError({errorMessage: "There was an error making the request"}));
    }
}


export function* makeRequestSaga() {
    yield takeLatest(MAKE_REQUEST, doMakeRequest);
}
