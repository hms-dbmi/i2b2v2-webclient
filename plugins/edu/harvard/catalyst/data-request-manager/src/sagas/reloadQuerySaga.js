/* globals i2b2 */

import {all, call, put, takeLatest} from "redux-saga/effects";
import { RELOAD_QUERY} from "../actions";
import {reloadQueryError} from "../reducers/requestDetailsSlice";

const reloadQueryRequest = (queryId) => {
    i2b2.authorizedTunnel.function["i2b2.CRC.ctrlr.QT.doQueryLoad"](queryId).then((userRoles) => userRoles);
}

export function* doReloadQuery(action) {
    const { queryId } = action.payload;

    try {
        const [result] = yield all([
            //call(getUserNameRequest),
            call(reloadQueryRequest, queryId)
        ])

        if (result !== undefined) {
            //  const isManager = userRoles.includes('MANAGER');
            //yield put(reloadQuerySuccess({isManager, username}));
            //} else {
            yield put(reloadQueryError({errorMessage: "There was an error getting the user info"}));
        }
    } catch (error) {
        yield put(reloadQueryError({errorMessage: "There was an error getting the user info"}));
    }
}


export function* reloadQuerySaga() {
    yield takeLatest(RELOAD_QUERY, doReloadQuery);
}