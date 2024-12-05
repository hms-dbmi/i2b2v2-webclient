/* globals i2b2 */

import { takeLatest, put} from "redux-saga/effects";
import {listResearcherTableSuccess, listResearcherTableError} from "../reducers/listResearcherTableSlice";
import { DateTime } from "luxon";

import {
    LIST_RESEARCHER_TABLE
} from "../actions";
import {RequestStatus} from "../models/RequestStatus";

const parseData = (tableList) => {
    let results = [];

    return results;
}

const getTestData = () => {
    const data = [
        {
            id: 1477,
            description: "Abnormal findings on neonatal screenings",
            dateSubmitted: DateTime.fromISO("2024-01-02").toJSDate(),
            irbNumber: "2024S",
            status: RequestStatus.SUBMITTED,
            requests: [
                "Request Demographics Data"
            ]
        },
        {
            id: 1478,
            description: "Female hypertensive disease",
            dateSubmitted: DateTime.fromISO("2024-03-18").toJSDate(),
            irbNumber: "2024S",
            status: RequestStatus.APPROVED,
            requests: [
                "Request Demographics Data",
                "Request Diagnosis Data",
            ]
        },
        {
            id: 1479,
            description: "Diabetes Mellitus@10:32:58",
            dateSubmitted: DateTime.fromISO("2024-07-11").toJSDate(),
            irbNumber: "2024S",
            status: RequestStatus.DENIED,
            requests: [
                "Request Demographics Data",
                "Request Diagnosis Data",
                "Request Patient Mapping"
            ]
        },
        {
            id: 1450,
            description: "Diabetes Mellitus@10:35:46",
            dateSubmitted: DateTime.fromISO("2024-07-28").toJSDate(),
            irbNumber: "2024S",
            status: RequestStatus.FILE_AVAILABLE,
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
            dateSubmitted: DateTime.fromISO("2024-09-03").toJSDate(),
            irbNumber: "2024S1",
            status: RequestStatus.CANCELLED,
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