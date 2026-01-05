import { createSlice } from '@reduxjs/toolkit'
import { DATA_SOURCES } from "../actions";
import { defaultState } from '../defaultState';
import { DataSource, StatusInfo } from "models";

export const dataSourcesSlice = createSlice({
    name: DATA_SOURCES,
    initialState: defaultState.dataSources,
    reducers: {
        getAllDataSources: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        getAllDataSourcesSucceeded:  (state, { payload: { dataSources } }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });

            let dsList = [];

            let index = 0;
            dataSources.forEach((ds) => {
                dsList.push( DataSource({
                    id: index++,
                    dbSchema: ds.dbSchema,
                    jndiDataSource: ds.jndiDataSource,
                    dbServerType: ds.dbServerType,
                    ownerId: ds.ownerId,
                    projectPaths: ds.projectPaths,
                    cellURL: ds.cellURL
                }));
            })

            dsList.sort((a, b) => a.dbSchema.localeCompare(b.dbSchema));
            state.dataSourceList = dsList;
        },
        getAllDataSourcesFailed: (state, { payload: { errorMessage } }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getAllDataSources,
    getAllDataSourcesSucceeded,
    getAllDataSourcesFailed
} = dataSourcesSlice.actions

export default dataSourcesSlice.reducer