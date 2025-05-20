import { call, put, takeLatest} from "redux-saga/effects";
import {getTableDefinitionSuccess, getTableDefinitionError} from "../reducers/tableDefSlice";

import {
    GET_TABLE_DEF
} from "../actions";
import {parseXml} from "../utilities/parseXml";
/* global i2b2 */

const getTableRequest = (tableId) => {

    let data = {
        tableId: tableId,
    };

    return i2b2.ajax.CRC.getTable(data).then((xmlString) => {
        //parses XML with CDATA properly
        return parseXml(xmlString);
    }).catch((err) => err);
};
const parseGetTableXml = (tableXml) => {

    let table = {
        rows: [],
        title: "",
    }

    let title = tableXml.getElementsByTagName('title');
    if(title.length !== 0 && title[0].childNodes.length > 0){
        table.title = title[0].childNodes[0].nodeValue;
    }

    let requiredRows = [];
    let nonRequiredColumns = [];

    const concepts = tableXml.getElementsByTagName('concept');
    for (let i = 0; i < concepts.length; i++) {
        let concept = concepts[i];
        let name = concept.getElementsByTagName('name');
        let required = concept.getElementsByTagName('required');
        let display = concept.getElementsByTagName('display');
        let data = concept.getElementsByTagName('data');

        if(name.length !== 0 && name[0].childNodes.length > 0 && required.length !== 0 && required[0].childNodes.length > 0
            && display[0].childNodes.length > 0){
            name = name[0].childNodes[0].nodeValue;
            required = required[0].childNodes[0].nodeValue === "true";
            display = display[0].childNodes[0].nodeValue === "true";

            if (data.length !== 0 && data[0].childNodes[0].length > 0) {
                data = data[0].childNodes[0].nodeValue;
                data = JSON.parse(data)[0];
            }

            if (required) {
                const dataOption = "VALUE";
                const sdxData = data.sdxData ? data.sdxData : {};
                requiredRows.push({name, dataOption, sdxData, display});
            } else {
                if (data?.dataOption.length > 0) {
                    const dataOption = data.dataOption;
                    const sdxData = data.sdxData;
                    nonRequiredColumns.push({name, dataOption, sdxData, display});
                }
            }
        }
    };

    table.rows = table.rows.concat(requiredRows);
    table.rows = table.rows.concat(nonRequiredColumns);
    return table;
}

export function* doGetTableDefinition(action) {
    let {tableId}  = action.payload;

    try {
        let response = yield call(getTableRequest, tableId);
        if(!response.error) {
            let tableDef = parseGetTableXml(response);
            if(tableDef)
            yield put(getTableDefinitionSuccess({tableDef}));
        }else{
            console.error("Error retrieving table! Message: " + response.errorMsg + ". Error details: " + response.errorData);
            yield put(getTableDefinitionError({errorMessage: "There was an error retrieving the table definition."}));
        }
    } catch (error) {
        console.log("Caught load table error " + error);
        yield put(getTableDefinitionError({errorMessage: "There was an error retrieving the table definition."}));
    }
}


export function* getTableDefinitionSaga() {
    yield takeLatest(GET_TABLE_DEF, doGetTableDefinition);
}
