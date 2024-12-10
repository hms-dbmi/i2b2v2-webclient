import { createSlice } from '@reduxjs/toolkit'
import { RESEARCHER_TABLE } from "../actions";
import { defaultState } from '../defaultState';
import {RequestStatus, ResearcherTable, ResearcherTableRow, StatusInfo} from "../models";
import {DateTime} from "luxon";

export const listResearcherTableSlice = createSlice({
    name: RESEARCHER_TABLE,
    initialState: defaultState.researcherTable,
    reducers: {
        listResearcherTable: state => {
            return ResearcherTable({
                isFetching: true
            })
        },
        listResearcherTableSuccess: (state, { payload: researcherRequests }) => {
            const rows = researcherRequests.map((request) => {
                let status = RequestStatus._lookupStatus(request.status);
                if(status.length > 0){
                    status = status[0];
                }else{
                    status = RequestStatus.statuses.UNKNOWN;
                }
                return ResearcherTableRow({
                    id: request.id,
                    description: request.description,
                    requests: request.requests,
                    dateSubmitted: DateTime.fromISO(request.dateSubmitted).toJSDate(),
                    lastUpdated: DateTime.fromISO(request.lastUpdated).toJSDate(),
                    irbNumber: request.irbNumber,
                    status:  status
                })
            });
            state.rows = rows;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        listResearcherTableError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    listResearcherTable,
    listResearcherTableSuccess,
    listResearcherTableError,
} = listResearcherTableSlice.actions

export default listResearcherTableSlice.reducer