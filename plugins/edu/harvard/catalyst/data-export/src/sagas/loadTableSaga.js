import { call, put, takeLatest} from "redux-saga/effects";
import {loadTableSuccess, loadTableError} from "../reducers/tableDefSlice";
import XMLParser from 'react-xml-parser';

import {
    LOAD_DATA_TABLE
} from "../actions";
/* global i2b2 */

export const DEFAULT_TABLE_ID = -1;
export const DEFAULT_TABLE_TITLE = "DEFAULT";

const getTableRequest = (tableId) => {

    let data = {
        tableId: tableId,
    };

    return i2b2.ajax.CRC.getTable(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};
const parseGetTableXml = (tableXml, id) => {

    let table = {
        rows: {},
        id: id,
        title: "",
        shared: false,
    }

    let title = tableXml.getElementsByTagName('title');
    if(title.length !== 0){
        table.title = title[0].value;
    }

    let shared = tableXml.getElementsByTagName('shared');
    if(shared.length !== 0){
        table.shared = shared[0].value === "true";
    }

    let allColumns = {
        required: [],
        concepts: [],
    };

    let concepts = tableXml.getElementsByTagName('concept');
    concepts.map(concept => {
        let name = concept.getElementsByTagName('name');
        let required = concept.getElementsByTagName('required');
        let locked = concept.getElementsByTagName('locked');
        let display = concept.getElementsByTagName('display');
        let data = concept.getElementsByTagName('data');

        if(name.length !== 0){
           name = name[0].value;
            if(required.length !== 0) {
                required = required[0].value === "true";
                if(locked.length !== 0) {
                    locked = locked[0].value === "true";
                    if(display.length !== 0) {
                        display = display[0].value === "true";

                        if(data.length !== 0) {
                            data = data[0].value;
                            //remove trailing '>' char in cdata string
                            data = data.substring(0, data.length - 1);
                            data = JSON.parse(data)[0];
                        }

                        if(required){
                            const dataOption = data.dataOption ? data.dataOption : "Value";
                            allColumns.required.push({name, required, locked, display, dataOption});

                        }else{
                            allColumns.concepts.push({name, required, locked, display, dataOption: data.dataOption, sdxData: data.sdxData});
                        }
                    }
                }
            }
        }
    });

    table.rows = allColumns;
    return table;
}

export function* doLoadTable(action) {
    let {title, id}  = action.payload;

    if(!id) {
        id = DEFAULT_TABLE_ID;
        title = DEFAULT_TABLE_TITLE;
    }
    try {
        let response = yield call(getTableRequest, id);
        if(!response.error) {
            let table= yield parseGetTableXml(response, id);
            table.title = title;
            yield put(loadTableSuccess(table));
        }else{
            console.error("Error loading table! Message: " + response.errorMsg + ". Error details: " + response.errorData);
            yield put(loadTableError({errorMessage: "There was an error loading the table definition " + title}));
        }
    } catch (error) {
        console.log("Caught load table error " + error);
        yield put(loadTableError({errorMessage: "There was an error loading the table definition " + title}));
    }
}


export function* loadTableSaga() {
    yield takeLatest(LOAD_DATA_TABLE, doLoadTable);
}
