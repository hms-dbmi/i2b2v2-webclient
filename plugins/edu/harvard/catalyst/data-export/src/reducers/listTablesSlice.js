import { createSlice } from '@reduxjs/toolkit'
import { TABLE_LISTING } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo} from "../models";

export const listTablesSlice = createSlice({
    name: TABLE_LISTING,
    initialState: defaultState.tableListing,
    reducers: {
        listTables: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        listTablesSuccess: (state, { payload: table }) => {
            state.tables = table;
            state.isFetching = false;
            state.statusInfo = {
                status: "SUCCESS"
            };
        },
        listTablesError: (state, { payload: errorMessage }) => {
            state.isFetching = false;
            state.statusInfo = {
                status: "FAIL",
                errorMessage: errorMessage
            };
        },
    }
})

export const {
    listTables,
    listTablesSuccess,
    listTablesError
} = listTablesSlice.actions

export default listTablesSlice.reducer