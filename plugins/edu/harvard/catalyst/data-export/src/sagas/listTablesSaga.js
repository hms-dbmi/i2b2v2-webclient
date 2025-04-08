/* globals i2b2 */

import {takeLatest, put, call} from "redux-saga/effects";
import {listTablesSuccess, listTablesError} from "../reducers/tableListingSlice";
import { DateTime } from "luxon";
import XMLParser from "react-xml-parser";

import {
    LIST_TABLES
} from "../actions";


const getAllTablesListRequest = () => {
    return i2b2.ajax.CRC.getAllTablesList().then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

const parseAllTablesListXml = (tablesListXml) => {
    let tablesObj = {
        globalRows: [],
        projectRows: [],
        userRows: []
    };

    let tables = tablesListXml.getElementsByTagName('rpdo');
    tables.forEach(table => {
        let id = table.attributes['id'];
        let title = table.getElementsByTagName('title');
        let creator_id = table.getElementsByTagName('creator_id');
        let shared = table.getElementsByTagName('shared');
        let create_date = table.getElementsByTagName('create_date');
        let column_count = table.getElementsByTagName('column_count');
        let visible = table.getElementsByTagName('visible');
        if(id.length !== 0 && title.length !== 0 && creator_id.length !== 0 && shared.length !== 0
            && create_date.length !== 0&& column_count.length !== 0) {
            title = title[0].value;
            creator_id = creator_id[0].value;
            shared = shared[0].value === "true";
            column_count = column_count[0].value;

            create_date = create_date[0].value;
            create_date = DateTime.fromISO(create_date).toJSDate();
            if (visible.length !== 0) {
                visible = visible[0].value === "true";
            } else {
                visible = false;
            }
            if(creator_id === '@'){
                tablesObj.globalRows.push({
                    id,
                    title,
                    creator_id,
                    create_date,
                    column_count,
                    visible
                });
            }
            else if(shared){
                tablesObj.projectRows.push({
                    id,
                    title,
                    creator_id,
                    create_date,
                    column_count,
                    visible
                });
            }
            else {
                tablesObj.userRows.push({
                    id,
                    title,
                    creator_id,
                    create_date,
                    column_count,
                    visible
                });
            }
        }
    });

    return tablesObj;
}

export function* doListTables(action) {
    try {
        let response = yield call(getAllTablesListRequest);
        if(!response.error) {
            let tablesList = yield parseAllTablesListXml(response);
            yield put(listTablesSuccess(tablesList));
        } else {
            yield put(listTablesError({errorMessage: "There was an error retrieving the list of tables"}));
        }
    } catch (error) {
        yield put(listTablesError({errorMessage: "There was an error retrieving the list of tables"}));
    }
}


export function* listTablesSaga() {
    yield takeLatest(LIST_TABLES, doListTables);
}