/* globals i2b2 */

import {takeLatest, put, call} from "redux-saga/effects";

import {updateRequestStatusError, updateRequestStatusSuccess} from "../reducers/requestDetailsSlice";
import XMLParser from "react-xml-parser";
import {UPDATE_REQUEST_STATUS} from "../actions";
import {RequestStatus} from "../models";
import {updateRequestRowStatus} from "../reducers/requestTableSlice";


const updateRequestStatusRequest = (queryInstanceId, status, username) => {
    let data = {
        user_id: username,
        query_instance_id: queryInstanceId,
        status_name: status
    };
    return i2b2.ajax.CRC.setQueryInstanceStatus(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => console.error(err));
};

const parseUpdateRequestStatusXml = (updateRequestStatusXml) => {
    let updatedStatus = "";

    let queryInstance = updateRequestStatusXml.getElementsByTagName('query_instance');
    if(queryInstance.length > 0){
        queryInstance = queryInstance[0];
        const batchMode = queryInstance.getElementsByTagName('batch_mode');
        if(batchMode.length > 0){
            updatedStatus = batchMode[0].value;
        }
    }
    return updatedStatus;
}
export function* doUpdateRequestStatus(action) {
    const {queryInstanceId, status, username } = action.payload;

    try {
        const statusName = RequestStatus._lookupStatusKey(status.name);
        const response = yield call(updateRequestStatusRequest, queryInstanceId, statusName, username);
        if (!response.error) {
            const newStatus = parseUpdateRequestStatusXml(response);
            yield put(updateRequestStatusSuccess({status}));
            yield put(updateRequestRowStatus({queryInstanceId, status}));
        } else {
            yield put(updateRequestStatusError({errorMessage: "There was an error updating the request status."}));
        }
    } catch (error) {
        yield put(updateRequestStatusError({errorMessage: "There was an error updating the request status."}));
        console.error("There was an error updating the request status. Error: " + error)
    }
}


export function* updateRequestStatusSaga() {
    yield takeLatest(UPDATE_REQUEST_STATUS, doUpdateRequestStatus);
}