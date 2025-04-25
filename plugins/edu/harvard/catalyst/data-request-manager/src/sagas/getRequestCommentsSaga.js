/* globals i2b2 */

import {takeLatest, put, call} from "redux-saga/effects";

import {
    GET_REQUEST_COMMENTS
} from "../actions";
import {getRequestCommentsError, getRequestCommentsSuccess} from "../reducers/requestCommentsSlice";
import {parseXml} from "../utilities/parseXml";

const getRequestCommentsRequest = (queryMasterId, comments) => {
    let data = {
        qm_key_value: queryMasterId,
    };
    return i2b2.ajax.CRC.getQueryInstanceList_fromQueryMasterId(data).then((xmlString) =>parseXml(xmlString)).catch((err) => err);
};

const parseRequestCommentsXml = (exportRequestListXml) => {
    let message= "";

    let queryInstance = exportRequestListXml.getElementsByTagName('query_instance');
    if(queryInstance.length !== 0 && queryInstance[0].childNodes.length > 0){
        queryInstance = queryInstance[0];
        let queryInstanceMessage = queryInstance.getElementsByTagName('message');
        if(queryInstanceMessage.length !== 0 && queryInstanceMessage[0].childNodes.length > 0){
            message  = queryInstanceMessage[0].childNodes[0].nodeValue;
        }
    }


return message;
}

export function* doGetRequestComments(action) {
const { queryMasterId  } = action.payload;

try {
const response = yield call(getRequestCommentsRequest, queryMasterId);

if (!response.error) {
    const comments = parseRequestCommentsXml(response);
    yield put(getRequestCommentsSuccess({comments}));
} else {
    yield put(getRequestCommentsError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
}
} catch (error) {
yield put(getRequestCommentsError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
}
}


export function* getRequestCommentsSaga() {
yield takeLatest(GET_REQUEST_COMMENTS, doGetRequestComments);
}
