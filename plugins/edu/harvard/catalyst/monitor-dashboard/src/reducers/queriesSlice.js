import { Query, StatusInfo } from "models";
import {QUERIES} from "../actions";
import {createSlice} from "@reduxjs/toolkit";
import {defaultState} from "../defaultState";
import {DateTime} from "luxon";

export const queriesSlice = createSlice({
    name: QUERIES,
    initialState: defaultState.queries,
    reducers: {
        getAllQueries: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        getAllQueriesSucceeded: (state, { payload: { queryList } }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });

            let queries = [];
            queryList.map((query) => {
                queries.push(Query({
                    id: query.id,
                    queryInstanceId: query.queryInstanceId,
                    name: query.queryName,
                    dataRequests: query.dataRequests,
                    startDate: DateTime.fromISO(query.createDate).toJSDate(),
                    patientCount: query.patientCount,
                    status: query.status,
                    username: query.userId
                }));
            })
            queries.sort((a, b) => a.id - b.id);

            state.queryList = queries;
        },
        getAllQueriesFailed: (state, { payload: { errorMessage } }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getAllQueries,
    getAllQueriesSucceeded,
    getAllQueriesFailed
} = queriesSlice.actions

export default queriesSlice.reducer