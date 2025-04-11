/* globals i2b2 */

import {takeLatest, put, call} from "redux-saga/effects";

import {updateRequestStatusError, updateRequestStatusSuccess} from "../reducers/requestDetailsSlice";
import XMLParser from "react-xml-parser";
import {UPDATE_REQUEST_STATUS} from "../actions";
import {RequestStatus} from "../models";
import {updateRequestRowStatus} from "../reducers/requestTableSlice";
import {getRequestStatusLog} from "../reducers/requestStatusLogSlice";


const updateRequestStatusRequest = (queryInstanceId, status, username) => {
    let data = {
        user_id: username,
        query_instance_id: queryInstanceId,
        status_name: status
    };
    return i2b2.ajax.CRC.setQueryInstanceStatus(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => console.error(err));
};

export function* doUpdateRequestStatus(action) {
    const {queryInstanceId, status, username, requests } = action.payload;

    try {
        const statusName = RequestStatus._lookupStatusKey(status);
        const response = yield call(updateRequestStatusRequest, queryInstanceId, statusName, username);
        if (!response.error) {
            yield put(updateRequestStatusSuccess({status}));
            yield put(updateRequestRowStatus({queryInstanceId, status}));

            const exportRequests = requests.map(ri =>  {
                return {
                    description: ri.description,
                    resultInstanceId: ri.resultInstanceId
                }
            });
            yield put(getRequestStatusLog({exportRequests}));
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