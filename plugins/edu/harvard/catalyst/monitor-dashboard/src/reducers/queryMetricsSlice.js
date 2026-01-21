import {createSlice} from "@reduxjs/toolkit";
import {QueryMetrics, QueryActivityInDays, StatusInfo} from "../models";
import {QUERY_METRICS} from "../actions";
import {defaultState} from "../defaultState";

export const queryMetricsSlice = createSlice({
    name: QUERY_METRICS,
    initialState: defaultState.queryMetrics,
    reducers: {
        getQueryMetrics: state => {
            return QueryMetrics({
                isFetching: true,
                statusInfo: StatusInfo()
            })
        },
        getQueryMetricsSucceeded: (state, { payload: queryMetrics }) => {
            const queryActivityInDays = QueryActivityInDays({
                totalQuery: queryMetrics.totalQuery,
                totalQuery1Days: queryMetrics.totalQuery1Days,
                totalQuery7Days: queryMetrics.totalQuery7Days,
                totalQuery30Days: queryMetrics.totalQuery30Days,
            });

            state.queryActivityInDays = queryActivityInDays;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getQueryMetricsFailed: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            const errorMsg = errorMessage ? errorMessage: "An error occurred retrieving new " +
                "users";

            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMsg
            });
        },
    }
})

export const {
    getQueryMetrics,
    getQueryMetricsSucceeded,
    getQueryMetricsFailed,
} = queryMetricsSlice.actions

export default queryMetricsSlice.reducer