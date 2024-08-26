import { call, takeLatest, put} from "redux-saga/effects";
/*import { PayloadAction } from "@reduxjs/toolkit";*/
import {listTablesSuccess, listTablesError} from "../reducers/listTablesSlice";

import {
    LIST_TABLES
} from "../actions";

const exampleResponse = {
        "tables": [
            {
                "id": "global_8d26d1b6-34e1-4b35-a65c-f8299f802565",
                "title": "Global Medications Template",
                "create_date": "2024-01-02",
                "edit_date": "2024-08-22",
                "column_count": 7,
                "user_id": "global",
                "shared": true
            },
            {
                "id": "demo_71e11f05-dd9b-41d7-90ae-ae01bff13b4d",
                "title": "Example 1",
                "create_date": "2023-06-07",
                "edit_date": "2024-08-23",
                "column_count": 7,
                "user_id": "demo",
                "shared": false
            }
        ],
        "users": [
            {
                "id": "demo",
                "table_count": 1
            },
            {
                "id": "global",
                "table_count": 1
            }
        ]
    }
;

const parseData = (tableList) => {
    let results = {};
    results.sharedRows = tableList.tables.filter(p => p.shared).map(p => {
        p.create_date = new Date(p.create_date);
        p.edit_date = new Date(p.edit_date);
        return p;
    });
    results.userRows = tableList.tables.filter(p => !p.shared).map(p => {
        p.create_date = new Date(p.create_date);
        p.edit_date = new Date(p.edit_date);
        return p;
    });
    return results;
}

export function* doListTables(action) {
    try {
        // You can also export the axios call as a function.
        //const response = yield axios.get(`your-server-url:port/api/users/${id}`);
        const response = parseData(exampleResponse);
        yield put(listTablesSuccess(response));
    } catch (error) {
        yield put(listTablesError({errorMessage: "There was an error retrieving the list of tables"}));
    }
}


export function* listTablesSaga() {
    yield takeLatest(LIST_TABLES, doListTables);
}