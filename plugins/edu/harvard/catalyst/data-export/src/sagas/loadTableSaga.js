import { takeLatest, put} from "redux-saga/effects";
import {loadTableSuccess, loadTableError} from "../reducers/loadTableSlice";

import {
    LOAD_DATA_TABLE
} from "../actions";
/* global i2b2 */

export function* doLoadTable(action) {
    let tableListing  = action.payload;

    try {
        // You can also export the axios call as a function.

        let formdata = new FormData();
        formdata.append('uid',i2b2.model.user);
        formdata.append('pid',i2b2.model.project);
        formdata.append('sid',i2b2.model.session);
        formdata.append('tid', tableListing.id);
        formdata.append('fid','get_table');

        const fetchConfig = {
            method: "POST",
            mode: "cors",
            body: formdata
        };

        const response = yield fetch(i2b2.model.endpointUrl, fetchConfig);

        if(response.ok) {
            let data = yield response.json();
            if(data.error){
                let error = data.error;
                if(error && error.length === 0 ) {
                    error = "There was an error loading the table"
                }
                console.error("Error loading table! Message: " + error);
                yield put(loadTableError({errorMessage: error}));
            }
            else{
                yield put(loadTableSuccess(data));
            }
        }else{
            console.error("Error saving table! Status code: " + response.status + "Message: " + response.statusText);
            yield put(loadTableError({errorMessage: "There was an error loading the table definition " + tableListing.title}));
        }
    } catch (error) {
        console.log("Caught load table error " + error);
        yield put(loadTableError({errorMessage: "There was an error loading the table definition " + tableListing.title}));
    }
}


export function* loadTableSaga() {
    yield takeLatest(LOAD_DATA_TABLE, doLoadTable);
}
