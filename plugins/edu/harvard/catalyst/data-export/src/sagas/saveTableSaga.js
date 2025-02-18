import { call, takeLatest, put} from "redux-saga/effects";
import {saveTableSuccess, saveTableError} from "../reducers/saveTableSlice";
import { DateTime } from "luxon";

import {
    SAVE_DATA_TABLE
} from "../actions";
import XMLParser from "react-xml-parser";
/* global i2b2 */


const setTableRequest = (rows, title, creator_id, shared, id) => {

    let data = {
        title: title,
        creator_id: creator_id,
        shared: shared,
        column_count: rows.length,
        visible: false,
        concepts: getConceptsToXml(rows)
    };

    const date = DateTime.now().toISO();
    if(id !== undefined) {
        data.table_id_attr = "id= " + id;
        data.create_date_xml = "<create_date>" + date +"</create_date>";
        data.update_date_xml = "<update_date>" + date + " </update_date>";
    }else{
        data.table_id_attr = "";
        data.create_date_xml = "<create_date>" + date +"</create_date>";
        data.update_date_xml = "<update_date>" + date + " </update_date>";
    }

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

        const dataXml = '<json_data><![CDATA[[\n' + JSON.stringify(jsonData) + ']]]>\n</json_data>';
        return "<concept>\n"
            + "<name>" + concept.name +"</name>\n"
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
    let { tableId, tableDefRows, creator_id, title, shared } = action.payload;

    try {
        let response = yield call(setTableRequest, tableDefRows, title, creator_id, shared, tableId);
        if(!response.error) {
            yield put(saveTableSuccess());
        }
        else{
            console.error("Error saving table! Message: " + response.errorMsg + ". Error details: " + response.errorData);
            yield put(saveTableError({errorMessage: "There was an error saving the table"}));
        }
    } catch (error) {
        yield put(saveTableError({errorMessage: "There was an error saving the table"}));
    }
}


export function* saveTableSaga() {
    yield takeLatest(SAVE_DATA_TABLE, doSaveTable);
}
