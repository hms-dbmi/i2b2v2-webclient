import { createSlice } from '@reduxjs/toolkit'
import { REQUEST_TABLE } from "../actions";
import { defaultState } from '../defaultState';
import {AdminTableRow, ExportRequest, RequestStatus, RequestTable, ResearcherTableRow, StatusInfo} from "../models";
import {DateTime} from "luxon";

export const requestTableSlice = createSlice({
    name: REQUEST_TABLE,
    initialState: defaultState.requestTable,
    reducers: {
        listRequestTable: state => {
            return RequestTable({
                isFetching: true
            })
        },
        listRequestTableSuccess: (state, { payload: {researcherRequests, isManager} }) => {
            const rows = researcherRequests.map((request) => {
                let status = RequestStatus._convertI2b2Status(request.status);
                const patientCount = request.patientCount.length > 0 ? request.patientCount.toLocaleString() : request.patientCount;

                if(isManager){
                    return AdminTableRow({
                        id: request.id,
                        queryInstanceId: request.queryInstanceId,
                        description: request.description,
                        requests: request.requests.map(req => {
                            return ExportRequest({
                                tableId: req.tableId,
                                resultInstanceId: req.resultInstanceId,
                                description: req.description
                            })
                        }),
                        dateSubmitted: DateTime.fromISO(request.dateSubmitted).toJSDate(),
                        patientCount: patientCount,
                        userId: request.userId,
                        status: status
                    })
                }
                else {
                    return ResearcherTableRow({
                        id: request.id,
                        queryInstanceId: request.queryInstanceId,
                        description: request.description,
                        requests: request.requests.map(req => {
                            return ExportRequest({
                                tableId: req.tableId,
                                resultInstanceId: req.resultInstanceId,
                                description: req.description
                            })
                        }),
                        dateSubmitted: DateTime.fromISO(request.dateSubmitted).toJSDate(),
                        patientCount: patientCount,
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
        updateRequestRowStatus: (state, { payload: { queryInstanceId, status } }) => {
            state.rows  = state.rows.map(row => {
                if(row.queryInstanceId === queryInstanceId){
                    row.status = status;
                }
                return row;
            });
        },
    }
})

export const {
    listRequestTable,
    listRequestTableSuccess,
    listRequestTableError,
    updateRequestRowStatus
} = requestTableSlice.actions

export default requestTableSlice.reducer