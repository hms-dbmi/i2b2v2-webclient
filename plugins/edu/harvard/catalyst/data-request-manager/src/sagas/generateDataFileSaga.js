/* globals i2b2 */

import {call, put, takeLatest} from "redux-saga/effects";
import {GENERATE_DATA_FILE} from "../actions";
import XMLParser from "react-xml-parser";
import {generateDataFileError, generateDataFileSuccess, getRequestStatus} from "../reducers/requestTableSlice";

const runExportRequest = (queryInstanceId) => {
    let data = {
        query_instance_id: queryInstanceId,
    };
    return i2b2.ajax.CRC.runExport_fromQueryInstanceId(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => console.error(err));
};

export function* doGenerateDataFile(action) {
    const { queryMasterId, queryInstanceId } = action.payload;
    try {
        const response = yield call(runExportRequest, queryInstanceId);
        if (!response.error) {
            yield put(generateDataFileSuccess({queryInstanceId}));
            yield put(getRequestStatus({queryMasterId}));
        } else {
            yield put(generateDataFileError({queryInstanceId, errorMessage: "There was an error generating the file(s)"}));
        }
    } catch (error) {
        yield put(generateDataFileError({queryInstanceId, errorMessage: "There was an error generating the file(s)"}));
        console.error("There was an error generating the file(s). Error: " + error);
    }
}


export function* generateDataFileSaga() {
    yield takeLatest(GENERATE_DATA_FILE, doGenerateDataFile);
}