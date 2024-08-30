import { call, takeLatest, put} from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
/*import { AxiosResponse } from "axios";*/
import XMLParser from 'react-xml-parser';
import {handleRowInsertSucceeded, handleRowInsertError} from "../reducers/loadTableSlice";
/* global i2b2 */

import {
    INSERT_DATA_ROW
} from "../actions";
import {DATATYPE} from "../models/TableDefinitionRow";

const getTermInfoRequest = (sdx) => {
    let data = {
        ont_max_records: 'max="1"',
        ont_synonym_records: false,
        ont_hidden_records: false,
        concept_key_value: sdx.sdxInfo.sdxKeyValue
    }

    return i2b2.ajax.ONT.GetTermInfo(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

const parseTermInfoXml = (termXml) => {
    console.log("parsetermxml received " + JSON.stringify(termXml));

    let xmlparser = new XMLParser();
    let valueMetadata = {};
    let valueMetadataList = termXml.getElementsByTagName('metadataxml');
    if(valueMetadataList.length !== 0 ) {
        let dataType = valueMetadataList[0].getElementsByTagName('DataType');
        if(dataType.length !== 0) {
            valueMetadata.dataType = DATATYPE[dataType[0].value.toUpperCase()];
        }
        let concepts = termXml.getElementsByTagName('ns6:concepts');
        if(concepts.length !== 0) {
            valueMetadata.origXml =  xmlparser.toString(concepts[0]);
        }
    }

    return valueMetadata;
}


export function* doInsertRow(action) {
    try {
        console.log("getting term info...");

        const { rowIndex, sdx } = action.payload;

        const response = yield call(getTermInfoRequest, sdx);
        if(response) {
            const parsedResponse = parseTermInfoXml(response);
            yield put(handleRowInsertSucceeded({
                rowIndex: rowIndex,
                dataType: parsedResponse.dataType,
                origXml: parsedResponse.origXml
            } ));
        }else{
            yield put(handleRowInsertError({error: "There was an error retrieving concept details"}));
        }
    } catch (error) {
        yield put(handleRowInsertError({error: "There was an error retrieving concept details"}));
    }
}


export function* handleRowInsertSaga() {
    yield takeLatest(INSERT_DATA_ROW, doInsertRow);
}