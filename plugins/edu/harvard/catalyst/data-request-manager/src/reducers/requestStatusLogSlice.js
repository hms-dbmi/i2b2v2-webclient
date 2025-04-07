import {createSlice} from "@reduxjs/toolkit";
import {REQUEST_STATUS_LOG} from "../actions";
import {defaultState} from "../defaultState";
import {RequestStatusLog, RequestStatusLogItem, StatusInfo} from "../models";

export const requestStatusLogSlice = createSlice({
    name: REQUEST_STATUS_LOG,
    initialState: defaultState.requestStatusLog,
    reducers: {
        getRequestStatusLog: state => {
            state = RequestStatusLog();
        },
        getRequestStatusLogSuccess: (state, { payload: { requestStatusLog } }) => {
            const statusLogs = requestStatusLog.map(requestStatus => {
                return {
                    description: requestStatus.description,
                    logItems: requestStatus.statusLogs.map(log => {
                        return RequestStatusLogItem({id: log.id, date: log.date, status: log.status});
                    })
                }
            })
            state.statusLogs = statusLogs;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS",
            });
        },
        getRequestStatusLogError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo  = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        getRequestStatusLogStatusConfirmed: (state) => {
            state.statusInfo  = StatusInfo();
        },
    }
})

export const {
    getRequestStatusLog,
    getRequestStatusLogSuccess,
    getRequestStatusLogError,
    getRequestStatusLogStatusConfirmed
} = requestStatusLogSlice.actions

export default requestStatusLogSlice.reducer