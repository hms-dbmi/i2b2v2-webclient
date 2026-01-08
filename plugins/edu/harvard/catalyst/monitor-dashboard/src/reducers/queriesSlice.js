import { Query, StatusInfo, QueryStatus } from "models";
import {QUERIES} from "../actions";
import {createSlice} from "@reduxjs/toolkit";
import {defaultState} from "../defaultState";
import {DateTime} from "luxon";
import {ExportRequest} from "../models";

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
                const status =QueryStatus.convertI2b2Status(query.status);
                const startDate = DateTime.fromISO(query.startDate);

                let runTime = null;
                if(status === QueryStatus.statuses.ERROR || status === QueryStatus.statuses.FINISHED){
                    const endDate = DateTime.fromISO(query.endDate);
                    runTime = ((endDate - startDate) / 1000).toFixed(1);
                }

                queries.push(Query({
                    id: query.id,
                    queryInstanceId: query.queryInstanceId,
                    name: query.queryName,
                    dataRequests: query.dataRequests.map(request => {
                        return ExportRequest({
                            tableId: request.tableId,
                            resultInstanceId: request.resultInstanceId,
                            description: request.description,
                            isRPDO: request.isRPDO,
                        });
                    }),
                    startDate: startDate.toJSDate(),
                    patientCount: query.patientCount,
                    status: QueryStatus.convertI2b2Status(query.status),
                    username: query.userId,
                    runTime: runTime,
                }));
            })
            queries.sort((a, b) => a.id - b.id);

            state.queryList = queries;
        },
        getAllQueriesFailed: (state, { payload: { errorMessage } }) => {
            state.isFetching = false;
            state.queryList = [];
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