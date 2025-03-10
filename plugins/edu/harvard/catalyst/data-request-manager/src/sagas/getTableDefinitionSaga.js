import { call, put, takeLatest} from "redux-saga/effects";
import {getTableDefinitionSuccess, getTableDefinitionError} from "../reducers/tableDefSlice";
import XMLParser from 'react-xml-parser';

import {
    GET_TABLE_DEF
} from "../actions";
/* global i2b2 */

const getTableRequest = (tableId) => {

    let data = {
        tableId: tableId,
    };

    return i2b2.ajax.CRC.getTable(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};
const parseGetTableXml = (tableXml, id) => {

    let table = {
        rows: [],
        title: "",
    }

    let title = tableXml.getElementsByTagName('title');
    if(title.length !== 0){
        table.title = title[0].value;
    }

    let requiredRows = [];
    let nonRequiredColumns = [];

    let concepts = tableXml.getElementsByTagName('concept');
    concepts.map(concept => {
        let name = concept.getElementsByTagName('name');
        let required = concept.getElementsByTagName('required');
        let data = concept.getElementsByTagName('data');

        if(name.length !== 0){
            name = name[0].value;
            if(required.length !== 0) {
                required = required[0].value === "true";

                if (required) {
                    const dataOption = "VALUE";
                    requiredRows.push({name, dataOption});
                } else {
                    if (data.length !== 0) {
                        data = data[0].value;
                        //remove trailing '>' char in cdata string
                        data = data.substring(0, data.length - 1);
                        data = JSON.parse(data)[0];
                        const dataOption = data.dataOption;
                        const sdxData = data.sdxData;
                        nonRequiredColumns.push({name, dataOption, sdxData});
                    }
                }
            }
        }
    });

    table.rows = table.rows.concat(requiredRows);
    table.rows = table.rows.concat(nonRequiredColumns);
    return table;
}

export function* doGetTableDefinition(action) {
    let {title, tableId}  = action.payload;

    try {
        let response = yield call(getTableRequest, tableId);
        if(!response.error) {
            let tableDef = parseGetTableXml(response);
            yield put(getTableDefinitionSuccess({tableDef}));
        }else{
            console.error("Error retrieving table! Message: " + response.errorMsg + ". Error details: " + response.errorData);
            yield put(getTableDefinitionError({errorMessage: "There was an error retrieving the table definition " + title}));
        }
    } catch (error) {
        console.log("Caught load table error " + error);
        yield put(getTableDefinitionError({errorMessage: "There was an error retrieving the table definition " + title}));
    }
}


export function* getTableDefinitionSaga() {
    yield takeLatest(GET_TABLE_DEF, doGetTableDefinition);
}
