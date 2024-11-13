import { takeLatest, put} from "redux-saga/effects";
import {makeRequestSuccess, makeRequestError} from "../reducers/makeRequestSlice";
import {
    MAKE_REQUEST
} from "../actions";
/* global i2b2 */

const transformTableDef = (tableDefRows) => {
    let requiredRows = {};
    let concepts = [];

    let index=0;
    tableDefRows.forEach(row => {
       if(row.required){
           requiredRows[row.id] = {
                name: row.name,
               display: row.display,
               locked: row.locked
           }
       }
       else{
           concepts.push({
               index: index,
               dataOption: row.dataOptions,
               textDisplay: row.name,
               locked: false,
               sdxData: row.sdxData
           });
           index++;
       }
    });

    const newTdef = {
        required: requiredRows,
        concepts: concepts,
    }

    return newTdef;
}
export function* doMakeRequest(action) {
    let { makeRequestDetails, tableDefRows } = action.payload;

    const metadata = {
        email: makeRequestDetails.email,
        comments: makeRequestDetails.comments
    }

    try {
        let formdata = new FormData();
        formdata.append('uid',i2b2.model.user);
        formdata.append('pid',i2b2.model.project);
        formdata.append('sid',i2b2.model.session);
        formdata.append('tdef', JSON.stringify(transformTableDef(tableDefRows)));
        formdata.append('pset', JSON.stringify(makeRequestDetails.patientSet));
        formdata.append('metadata', JSON.stringify(metadata));
        formdata.append('fid','make_request');

        const fetchConfig = {
            method: "POST",
            mode: "cors",
            body: formdata
        };

        const response = yield fetch(i2b2.model.endpointUrl, fetchConfig);
        if(response.ok) {
            const data = yield response.json();
            if(!data.success){
                let error = data.error;
                if(error && error.length === 0 ) {
                    error = "There was an error submitting request"
                }
                console.error("Error submitting request! Message: " + error);
                yield put(makeRequestError({errorMessage: error}));
            }
            else{
                yield put(makeRequestSuccess());
            }
        }else{
            console.error("Error submitting request! Status code: " + response.status + "Message: " + response.statusText);
            yield put(makeRequestError({errorMessage: "There was an error making the request"}));
        }
    } catch (error) {
        yield put(makeRequestError({errorMessage: "There was an error submitting the request"}));
    }
}


export function* makeRequestSaga() {
    yield takeLatest(MAKE_REQUEST, doMakeRequest);
}
