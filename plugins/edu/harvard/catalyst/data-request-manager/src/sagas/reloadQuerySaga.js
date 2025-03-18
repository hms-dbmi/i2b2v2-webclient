/* globals i2b2 */

import {all, call, put, takeLatest} from "redux-saga/effects";
import { RELOAD_QUERY} from "../actions";
import {reloadQueryError} from "../reducers/requestDetailsSlice";

const reloadQueryRequest = (queryId) => {

    i2b2.authorizedTunnel.function["i2b2.CRC.ctrlr.QT.doQueryLoad"](queryId).error(e => {
        console.log("Error reloading query " + e);
    });
}

const switchToFindPatientsTabRequest = () => {
    i2b2.authorizedTunnel.function["i2b2.layout.selectTab"]('i2b2.CRC.view.QT').error(e => {
        console.log("Error switching to find Patients tab " + e);
    });
}

export function* doReloadQuery(action) {
    const { queryId } = action.payload;

    try {
        yield all([
            call(reloadQueryRequest, queryId),
            call(switchToFindPatientsTabRequest)
        ]);
    } catch (error) {
        yield put(reloadQueryError({errorMessage: "There was an error while reloading query " + queryId}));
    }
}

export function* reloadQuerySaga() {
    yield takeLatest(RELOAD_QUERY, doReloadQuery);
}