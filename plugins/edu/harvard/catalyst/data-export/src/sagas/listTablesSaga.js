/* globals i2b2 */

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
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b00', user_id:"demo", shared: false, title: "Nick's 1st Demographics run", create_date: "01/01/23", edit_date: "07/07/24", column_count: 10},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b01', user_id:"demo", shared: false, title: "Dummy test", create_date: "04/05/23", edit_date: "07/07/24", column_count: 20},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b02', user_id:"demo", shared: false, title: "Example 1", create_date: "06/07/23", edit_date: "07/07/24", column_count: 25},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b03', user_id:"demo", shared: false, title: "Example 2", create_date: "11/16/23", edit_date: "07/07/24", column_count: 11},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b04', user_id:"demo", shared: false, title: "COVID + GLP-1s", create_date: "01/01/23", edit_date: "07/07/24", column_count: 10},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b05', user_id:"demo", shared: false, title: "COVID + ACE2", create_date: "04/05/23", edit_date: "07/07/24", column_count: 20},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b06', user_id:"demo", shared: false, title: "NegCOVID + GLP-1s", create_date: "06/07/23", edit_date: "07/07/24", column_count: 25},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b07', user_id:"demo", shared: false, title: "NegCOVID + ACE2", create_date: "11/16/23", edit_date: "07/07/24", column_count: 11},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b08', user_id:"demo", shared: false, title: "Diabetes", create_date: "01/01/23", edit_date: "07/07/24", column_count: 10},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b09', user_id:"demo", shared: false, title: "Ashtma", create_date: "04/05/23", edit_date: "07/07/24", column_count: 20},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b10', user_id:"demo", shared: false, title: "COPD", create_date: "06/07/23", edit_date: "07/07/24", column_count: 25},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b11', user_id:"demo", shared: false, title: "opps (delete me)", create_date: "11/16/23", edit_date: "07/07/24", column_count: 11},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b12', user_id:"demo", shared: false, title: "Complex Stats Demo", create_date: "01/01/23", edit_date: "07/07/24", column_count: 10},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b13', user_id:"demo", shared: false, title: "testing 2", create_date: "04/05/23", edit_date: "07/07/24", column_count: 20},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b14', user_id:"demo", shared: false, title: "testing 1", create_date: "06/07/23", edit_date: "07/07/24", column_count: 25},
            { id:'demo_71e11f05-dd9b-41d7-90ae-ae01bff13b15', user_id:"demo", shared: false, title: "test", create_date: "11/16/23", edit_date: "07/07/24", column_count: 11}
        ],
        "users": [
            {
                "id": "demo",
                "table_count": 16
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
        let formdata = new FormData();
        formdata.append('uid',i2b2.model.user);
        formdata.append('pid',i2b2.model.project);
        formdata.append('sid',i2b2.model.session);
        formdata.append('fid','get_tables');
        const response = yield fetch(i2b2.model.endpointUrl, {
            method: "POST",
            mode: "cors",
            body: formdata
        });
        if (response.ok) {
            const data = parseData(yield response.json());
            yield put(listTablesSuccess(data));
        } else {
            yield put(listTablesError({errorMessage: "There was an error retrieving the list of tables"}));
        }
        // const response = parseData(exampleResponse);
        // yield put(listTablesSuccess(response));
    } catch (error) {
        yield put(listTablesError({errorMessage: "There was an error retrieving the list of tables"}));
    }
}


export function* listTablesSaga() {
    yield takeLatest(LIST_TABLES, doListTables);
}