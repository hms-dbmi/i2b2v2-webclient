import { call, takeLatest, put} from "redux-saga/effects";
/*import { PayloadAction } from "@reduxjs/toolkit";*/
import {listTablesSuccess, listTablesError} from "../reducers/listTablesSlice";

import {
    LIST_TABLES
} from "../actions";

const exampleResponse = {
    "tables": [
        {
            "id": "global_23b70575-293b-4b3e-a7fc-d036d751a255",
            "title": "Demographics",
            "create_date": "2023-01-01",
            "edit_date": "2024-07-07",
            "column_count": 10,
            "user_id": "global"
        },
        {
            "id": "global_34c0cdd0-28c8-408c-904a-993446960250",
            "title": "Covid Use Case",
            "create_date": "2023-04-05",
            "edit_date": "2024-07-07",
            "column_count": 20,
            "user_id": "global"
        },
        {
            "id": "global_35ed3eae-7ccc-4830-98f6-05d0251872c8",
            "title": "Demographics",
            "create_date": "2023-06-07",
            "edit_date": "2024-07-07",
            "column_count": 25,
            "user_id": "global"
        },
        {
            "id": "global_3d9194d3-2446-4ba3-8485-d763a7b43b6f",
            "title": "Demographics 2",
            "create_date": "2023-11-16",
            "edit_date": "2024-07-07",
            "column_count": 11,
            "user_id": "global"
        },
        {
            "id": "nw096_71e11f05-dd9b-41d7-90ae-ae01bff13b4d",
            "title": "Example 1",
            "create_date": "2023-06-07",
            "edit_date": "2024-07-07",
            "column_count": 25,
            "user_id": "nw096"
        },
        {
            "id": "nw096_8d26d1b6-34e1-4b35-a65c-f8299f802565",
            "title": "Example 2",
            "create_date": "2023-11-16",
            "edit_date": "2024-07-07",
            "column_count": 11,
            "user_id": "nw096"
        }
    ],
    "users": [
        {
            "id": "global",
            "table_count": 4
        },
        {
            "id": "nw096",
            "table_count": 2
        }
    ]
};

const parseData = (tableList) => {
    let results = {};
    results.sharedRows = tableList.tables.filter(p => p.user_id === "global").map(p => {
        p.create_date = new Date(p.create_date);
        p.edit_date = new Date(p.edit_date);
        return p;
    });
    results.userRows = tableList.tables.filter(p => p.user_id !== "global").map(p => {
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
        yield put(listTablesError({errorMessage: "There was an error saving the data table"}));
    }
}


export function* listTablesSaga() {
    yield takeLatest(LIST_TABLES, doListTables);
}