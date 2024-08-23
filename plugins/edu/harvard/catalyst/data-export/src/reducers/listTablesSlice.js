import { createSlice } from '@reduxjs/toolkit'
import { TABLE_LISTING } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo} from "../models";
import {TableListing} from "../models";

export const listTablesSlice = createSlice({
    name: TABLE_LISTING,
    initialState: defaultState.tableListing,
    reducers: {
        listTables: state => {
            state = TableListing({
                isFetching: false
            })
        },
        listTablesSuccess: (state, { payload: tableDefs }) => {
            state.sharedRows = tableDefs.sharedRows;
            state.userRows = tableDefs.userRows;
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