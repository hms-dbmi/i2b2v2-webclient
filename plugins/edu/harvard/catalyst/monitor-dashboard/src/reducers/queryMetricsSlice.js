import {createSlice} from "@reduxjs/toolkit";
import {
    QueryMetrics,
    QueryActivityInDays,
    StatusInfo,
    TopUsersByQuery,
    UserTotalQuery,
    QueryActivityByMonth, QueryActivityAndDate
} from "../models";
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

            let topUsersByQuery = TopUsersByQuery();
            //only users with total queries > 0
            let filteredUsersAndTotalQueries = queryMetrics.topUsers.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
            topUsersByQuery.usersAndTotalQueries = filteredUsersAndTotalQueries;

            filteredUsersAndTotalQueries =  queryMetrics.topUsers1Day.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
            topUsersByQuery.usersAndTotalQueries1Day= filteredUsersAndTotalQueries;

            filteredUsersAndTotalQueries =  queryMetrics.topUsers7Days.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
            topUsersByQuery.usersAndTotalQueries7Days= filteredUsersAndTotalQueries;

            filteredUsersAndTotalQueries =  queryMetrics.topUsers30Days.filter(d => d.value > 0).sort((a, b) => b.value - a.value);
            topUsersByQuery.usersAndTotalQueries30Days= filteredUsersAndTotalQueries;

            const queryActivityByMonth = QueryActivityByMonth({
                activityByMonthList : queryMetrics.queryActivityByMonth.map(q => {
                    return QueryActivityAndDate({
                        date: q.date,
                        queryActivity: q.value
                    });
                })
            });

            state.queryActivityInDays = queryActivityInDays;
            state.topUsersByQuery = topUsersByQuery;
            state.queryActivityByMonth = queryActivityByMonth;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getQueryMetricsFailed: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            const errorMsg = errorMessage ? errorMessage: "An error occurred retrieving query " +
                "metrics";

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