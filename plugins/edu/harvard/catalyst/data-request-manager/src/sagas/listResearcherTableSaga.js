/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {listResearcherTableSuccess, listResearcherTableError} from "../reducers/listResearcherTableSlice";
import { DateTime } from "luxon";

import {
    LIST_RESEARCHER_TABLE
} from "../actions";

const parseData = (tableList) => {
    let results = [];

    return results;
}

const getTestData = () => {
    const data = [
        {
            id: 1477,
            description: "Abnormal findings on neonatal screenings",
            dateSubmitted: "2024-01-02",
            lastUpdated: "2024-02-14",
            irbNumber: "2024S",
            status: "Submitted",
            requests: [
                "Request Demographics Data"
            ]
        },
        {
            id: 1478,
            description: "Female hypertensive disease",
            dateSubmitted: "2024-03-18",
            lastUpdated: "2024-04-11",
            irbNumber: "2024S",
            status: "Approved",
            requests: [
                "Request Demographics Data",
                "Request Diagnosis Data",
            ]
        },
        {
            id: 1479,
            description: "Diabetes Mellitus@10:32:58",
            dateSubmitted: "2024-07-11",
            lastUpdated: "2024-08-11",
            irbNumber: "2024S",
            status: "Denied",
            requests: [
                "Request Demographics Data",
                "Request Diagnosis Data",
                "Request Patient Mapping"
            ]
        },
        {
            id: 1450,
            description: "Diabetes Mellitus@10:35:46",
            dateSubmitted: "2024-07-28",
            lastUpdated: "2024-09-29",
            irbNumber: "2024S",
            status: "File Available",
            requests: [
                "Request Demographics Data",
                "Request Medication Data",
                "Request Diagnosis Data",
                "Request Lab Data",
                "Request Patient Mapping"
            ]
        },
        {
            id: 1451,
            description: "Circulatory system@21:30:14",
            dateSubmitted: "2024-09-03",
            lastUpdated: "2024-09-28",
            irbNumber: "2024S1",
            status: "Cancelled",
            requests: [
                "Request Diagnosis Data",
                "Request Lab Data"
            ]
        }
    ];

    return data;
}
export function* doListResearcherTable(action) {
    try {
        let response = {ok: true};
        if (response.ok) {
            const data = getTestData(); //parseData(yield response.json());
            yield put(listResearcherTableSuccess(data));
        } else {
            yield put(listResearcherTableError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
        }
    } catch (error) {
        yield put(listResearcherTableError({errorMessage: "There was an error retrieving the list of researcher data export requests"}));
    }
}


export function* listResearcherTableSaga() {
    yield takeLatest(LIST_RESEARCHER_TABLE, doListResearcherTable);
}