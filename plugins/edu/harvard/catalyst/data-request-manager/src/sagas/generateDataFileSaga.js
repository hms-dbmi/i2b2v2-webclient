/* globals i2b2 */

import {call, put, takeLatest} from "redux-saga/effects";
import {GENERATE_DATA_FILE} from "../actions";
import {generateDataFileError, generateDataFileSuccess} from "../reducers/requestDetailsSlice";
import XMLParser from "react-xml-parser";

const runExportRequest = (queryInstanceId) => {
    let data = {
        query_instance_id: queryInstanceId,
    };
    return i2b2.ajax.CRC.runExport_fromQueryInstanceId(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => console.error(err));
};

export function* doGenerateDataFile(action) {
    const { queryInstanceId } = action.payload;
    try {
        const response = yield call(runExportRequest, queryInstanceId);
        if (!response.error) {
            yield put(generateDataFileSuccess());
        } else {
            yield put(generateDataFileError({errorMessage: "There was an error generating the file(s)"}));
        }
    } catch (error) {
        yield put(generateDataFileError({errorMessage: "There was an error generating the file(s)"}));
        console.error("There was an error generating the file(s). Error: " + error);
    }
}


export function* generateDataFileSaga() {
    yield takeLatest(GENERATE_DATA_FILE, doGenerateDataFile);
}