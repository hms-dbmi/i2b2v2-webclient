/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {listTablesSuccess, listTablesError} from "../reducers/listTablesSlice";
import { DateTime } from "luxon";

import {
    LIST_TABLES
} from "../actions";

const parseData = (tableList) => {
    let results = {};
    results.sharedRows = tableList.tables.filter(p => p.shared).map(p => {
        p.create_date = DateTime.fromISO(p.create_date).toJSDate();
        p.edit_date = DateTime.fromISO(p.edit_date).toJSDate();
        return p;
    });
    results.userRows = tableList.tables.filter(p => !p.shared).map(p => {
        p.create_date = DateTime.fromISO(p.create_date).toJSDate();
        p.edit_date = DateTime.fromISO(p.edit_date).toJSDate();
        return p;
    });
    return results;
}

export function* doListTables(action) {
    try {
        // You can also export the axios call as a function.
        let formdata = new FormData();
        formdata.append('uid',i2b2.model.user);
        formdata.append('pid',i2b2.model.project);
        formdata.append('sid',i2b2.model.session);
        formdata.append('fid','get_tables');
        const response = yield fetch(i2b2.model.endpointUrl, {
            method: "POST",
            mode: "cors",
            body: formdata
        });
        /*if (response.ok) {
            const data = parseData(yield response.json());
            i2b2.model.tableList = data;
            i2b2.state.save();
            yield put(listTablesSuccess(data));
        } else {*/
            yield put(listTablesError({errorMessage: "There was an error retrieving the list of tables"}));
       // }
    } catch (error) {
        yield put(listTablesError({errorMessage: "There was an error retrieving the list of tables"}));
    }
}


export function* listTablesSaga() {
    yield takeLatest(LIST_TABLES, doListTables);
}