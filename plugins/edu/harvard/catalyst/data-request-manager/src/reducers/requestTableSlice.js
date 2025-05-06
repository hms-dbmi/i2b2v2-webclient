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
        listRequestTableSuccess: (state, { payload: {researcherRequests, isManager, isAdmin} }) => {
            const rows = researcherRequests.map((request) => {
                let status = RequestStatus._convertI2b2Status(request.status);
                const patientCount = request.patientCount.length > 0 ? request.patientCount.toLocaleString() : request.patientCount;

                if(isManager ||isAdmin){
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
                        userId: request.userId,
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
        refreshRequestRowStatus: (state, { payload: { queryInstanceId, status } }) => {
            state.rows  = state.rows.map(row => {
                if(row.queryInstanceId === queryInstanceId){
                    row.status = status;
                }
                return row;
            });
        },
        getRequestStatus: (state, { payload: { queryMasterId, status } }) => {
            state.rows  = state.rows.map(row => {
                if(row.id === queryMasterId){
                    row.status = status;
                    if( row.isFetchingStatus !== undefined) {
                        row.isFetchingStatus = true;
                    }
                }
                return row;
            });
        },
        getRequestStatusSuccess: (state, { payload: { queryMasterId, requestStatus } }) => {
            state.rows = state.rows.map(row => {
                if(row.id === queryMasterId){
                    let status = RequestStatus._convertI2b2Status(requestStatus);
                    row.status = status;
                    if( row.isFetchingStatus !== undefined) {
                        row.isFetchingStatus = false;
                    }
                }
                return row;
            });
        },
        getRequestStatusError: (state, { payload: { queryMasterId, errorMessage} }) => {
            state.rows = state.rows.map(row => {
                if(row.id === queryMasterId){
                    if( row.isFetchingStatus !== undefined) {
                        row.isFetchingStatus = false;
                    }
                }
                return row;
            });
        },
        generateDataFile: (state, { payload: { queryInstanceId} }) => {
            state.rows = state.rows.map(row => {
                if(row.queryInstanceId === queryInstanceId){
                    if( row.dataFileGeneration !== undefined) {
                        row.dataFileGeneration.isGeneratingFile = true;
                        row.dataFileGeneration.statusInfo = StatusInfo();
                    }
                }
                return row;
            });
        },
        generateDataFileSuccess: (state, { payload: { queryInstanceId} }) => {
            state.rows = state.rows.map(row => {
                if(row.queryInstanceId === queryInstanceId){
                    if( row.dataFileGeneration !== undefined) {
                        row.dataFileGeneration.isGeneratingFile = false;
                        row.dataFileGeneration.statusInfo = StatusInfo({
                            status: "SUCCESS",
                        });
                    }
                }
                return row;
            });
        },
        generateDataFileError: (state, { payload: { queryInstanceId, errorMessage} }) => {
            state.rows = state.rows.map(row => {
                if(row.queryInstanceId === queryInstanceId){
                    if( row.dataFileGeneration !== undefined) {
                        row.dataFileGeneration.isGeneratingFile = false;
                        row.dataFileGeneration.statusInfo  = StatusInfo({
                            status: "FAIL",
                            errorMessage: errorMessage
                        });
                    }
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
    refreshRequestRowStatus,
    getRequestStatus,
    getRequestStatusSuccess,
    getRequestStatusError,
    generateDataFile,
    generateDataFileSuccess,
    generateDataFileError,
} = requestTableSlice.actions

export default requestTableSlice.reducer