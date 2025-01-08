import { createSlice } from '@reduxjs/toolkit'
import { REQUEST_TABLE } from "../actions";
import { defaultState } from '../defaultState';
import {AdminTableRow, RequestStatus, RequestTable, ResearcherTableRow, StatusInfo} from "../models";
import {DateTime} from "luxon";

export const listRequestTableSlice = createSlice({
    name: REQUEST_TABLE,
    initialState: defaultState.requestTable,
    reducers: {
        listRequestTable: state => {
            return RequestTable({
                isFetching: true
            })
        },
        listRequestTableSuccess: (state, { payload: {researcherRequests, isAdmin} }) => {
            const rows = researcherRequests.map((request) => {
                let status = RequestStatus._lookupStatus(request.status);
                if(status.length > 0){
                    status = status[0];
                }else{
                    status = RequestStatus.statuses.UNKNOWN;
                }

                if(isAdmin){
                    const patientCount = request.patientCount.length > 0 ? request.patientCount.toLocaleString() : request.patientCount;
                    return AdminTableRow({
                        id: request.id,
                        description: request.description,
                        requests: request.requests,
                        lastUpdated: DateTime.fromISO(request.lastUpdated).toJSDate(),
                        patientCount: patientCount,
                        userId: request.userId,
                        status: status
                    })
                }
                else {
                    return ResearcherTableRow({
                        id: request.id,
                        description: request.description,
                        requests: request.requests,
                        lastUpdated: DateTime.fromISO(request.lastUpdated).toJSDate(),
                        status: status
                    })
                }
            });
            state.rows = rows;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        listRequestTableError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    listRequestTable,
    listRequestTableSuccess,
    listRequestTableError,
} = listRequestTableSlice.actions

export default listRequestTableSlice.reducer