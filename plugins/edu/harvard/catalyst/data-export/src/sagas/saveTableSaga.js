import { call, takeLatest, put} from "redux-saga/effects";
import {saveTableSuccess, saveTableError} from "../reducers/saveTableSlice";

import {
    SAVE_DATA_TABLE
} from "../actions";
import XMLParser from "react-xml-parser";
import {encode} from 'html-entities';
import {refreshTitleAndFolderName} from "../reducers/tableDefSlice";
/* global i2b2 */


const setTableRequest = (rows, title, creator_id, shared, id) => {

    let data = {
        title: title,
        creator_id: creator_id,
        shared: shared,
        concepts: getConceptsToXml(rows)
    };

    if(id !== undefined) {
        data.table_id_attr = 'id="' + id + '"';
    }else{
        data.table_id_attr = "";
    }

    console.log("id is " + id);
    return i2b2.ajax.CRC.setTable(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

const getConceptsToXml = (concepts) => {
    const conceptsList = concepts.map(concept => {

        let jsonData = {
            dataOption: concept.dataOption,
            index: concept.order
        }

        if(concept.sdxData){
            jsonData.sdxData = concept.sdxData;
        }

        const dataXml = '<data><![CDATA[[' + JSON.stringify(jsonData) + ']]]></data>';
        return "<concept>\n"
            + "<name>" + encode(concept.name) +"</name>\n"
            + "<display>" + concept.display +"</display>\n"
            + "<required>" + concept.required +"</required>\n"
            + "<locked>" + concept.locked +"</locked>\n"
            + dataXml
            + "</concept>";
    })

    const conceptsXml = conceptsList.join("\n");
    return conceptsXml;
};

export function* doSaveTable(action) {
    let { tableId, tableDefRows, creator_id, title, shared, folderName } = action.payload;

    try {
        let response = yield call(setTableRequest, tableDefRows, title, creator_id, shared, tableId);
        if(!response.error) {
            yield put(saveTableSuccess());
            yield put(refreshTitleAndFolderName({title, folderName}));
        }
        else{
            console.error("Error saving table! Message: " + response.errorMsg + ". Error details: " + response.errorData);
            yield put(saveTableError({errorMessage: "There was an error saving the table"}));
        }
    } catch (error) {
        console.error("Error saving table! Message: " + error);
        yield put(saveTableError({errorMessage: "There was an error saving the table"}));
    }
}


export function* saveTableSaga() {
    yield takeLatest(SAVE_DATA_TABLE, doSaveTable);
}
