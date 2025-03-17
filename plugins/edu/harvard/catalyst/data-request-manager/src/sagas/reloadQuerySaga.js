/* globals i2b2 */

import { call, put, takeLatest} from "redux-saga/effects";
import { RELOAD_QUERY} from "../actions";
import {reloadQueryError} from "../reducers/requestDetailsSlice";

const reloadQueryRequest = (queryId, tabToShow) => {
    i2b2.authorizedTunnel.function["i2b2.CRC.ctrlr.QT.doQueryLoad"](queryId, tabToShow).error(e => {
        console.log("Error reloading query " + e);
    });
}

export function* doReloadQuery(action) {
    const { queryId } = action.payload;

    try {
        yield call(reloadQueryRequest, queryId, "i2b2.CRC.view.QT");
    } catch (error) {
        yield put(reloadQueryError({errorMessage: "There was an error reloading query " + queryId}));
    }
}


export function* reloadQuerySaga() {
    yield takeLatest(RELOAD_QUERY, doReloadQuery);
}