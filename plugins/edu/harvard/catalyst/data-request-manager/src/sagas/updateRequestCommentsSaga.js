/* globals i2b2 */

import {takeLatest, put, call} from "redux-saga/effects";

import {
    UPDATE_REQUEST_COMMENTS
} from "../actions";
import {updateRequestCommentsError, updateRequestCommentsSuccess} from "../reducers/requestCommentsSlice";
import XMLParser from "react-xml-parser";


const updateRequestCommentsRequest = (queryInstanceId, comments, username) => {
    let data = {
        user_id: username,
        query_instance_id: queryInstanceId,
        query_instance_message: comments
    };
    return i2b2.ajax.CRC.updateQueryInstanceMessage(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doUpdateRequestComments(action) {
    const {queryInstanceId, username, comments } = action.payload;

    try {
        const response = yield call(updateRequestCommentsRequest, queryInstanceId, comments, username);
        if (!response.error) {
            yield put(updateRequestCommentsSuccess({comments}));
        } else {
            yield put(updateRequestCommentsError({errorMessage: "There was an error updating comments"}));
        }
    } catch (error) {
        yield put(updateRequestCommentsError({errorMessage: "There was an error updating comments"}));
        console.error("There was an error updating comments. Error: " + error);
    }
}


export function* updateRequestCommentsSaga() {
    yield takeLatest(UPDATE_REQUEST_COMMENTS, doUpdateRequestComments);
}