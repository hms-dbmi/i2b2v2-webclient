import { takeLatest, put} from "redux-saga/effects";
import {saveTableSuccess, saveTableError} from "../reducers/saveTableSlice";

import {
    SAVE_DATA_TABLE
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
                dataOption: row.dataOption,
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

export function* doSaveTable(action) {
    let { tableId, tableTitle, tableDefRows } = action.payload;

    try {
        let transformedTableDef = transformTableDef(tableDefRows);
        transformedTableDef.title = tableTitle;
        let formdata = new FormData();

        formdata.append('uid',i2b2.model.user);
        formdata.append('pid',i2b2.model.project);
        formdata.append('sid',i2b2.model.session);
        formdata.append('tdef', JSON.stringify(transformedTableDef));
        formdata.append('fid','save_table');

        if(tableId) {
            formdata.append('tid',tableId);
        }

        const fetchConfig = {
            method: "POST",
            mode: "cors",
            body: formdata
        };

        const response = yield fetch(i2b2.model.endpointUrl, fetchConfig);
        if(response) {
            yield put(saveTableSuccess());
        }
    } catch (error) {
        yield put(saveTableError({errorMessage: "There was an error saving the data table"}));
    }
}


export function* saveTableSaga() {
    yield takeLatest(SAVE_DATA_TABLE, doSaveTable);
}
