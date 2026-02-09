import { QueryRequestDetails, StatusInfo } from "models";
import {QUERY_REQUEST_DETAILS} from "../actions";
import {createSlice} from "@reduxjs/toolkit";
import {defaultState} from "../defaultState";

export const queryRequestDetailsSlice = createSlice({
    name: QUERY_REQUEST_DETAILS,
    initialState: defaultState.queryRequestDetails,
    reducers: {
        getQueryRequestDetails: state => {
            return QueryRequestDetails({
                isFetching: true
            });
        },
        getQueryRequestDetailsSucceeded: (state, { payload:  queryRequest  }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
            state.queryMasterId = queryRequest.queryMasterId;
            state.queryName = queryRequest.queryName;
            state.queryRequestXml = queryRequest.queryRequestXml;
            console.log("query request xml ", queryRequest.queryRequestXml);
        },

        getQueryRequestDetailsFailed: (state, { payload: { errorMessage } }) => {
            return QueryRequestDetails({
                isFetching: false,
                statusInfo: StatusInfo({
                    status: "FAIL",
                    errorMessage: errorMessage
                })
            });
        }
    }
})

export const {
    getQueryRequestDetails,
    getQueryRequestDetailsSucceeded,
    getQueryRequestDetailsFailed,
} = queryRequestDetailsSlice.actions

export default queryRequestDetailsSlice.reducer