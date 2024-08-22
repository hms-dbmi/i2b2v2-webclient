import { createSlice } from '@reduxjs/toolkit'
import { TABLE_LISTING } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo} from "../models";

export const listTablesSlice = createSlice({
    name: TABLE_LISTING,
    initialState: defaultState.tableListing,
    reducers: {
        listTablesAction: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        listTablesSuccessAction: (state, { payload: table }) => {
            state.tables = table;
            state.isFetching = false;
            state.statusInfo = {
                status: "SUCCESS"
            };
        },
        listTablesErrorAction: (state, { payload: errorMessage }) => {
            state.isFetching = false;
            state.statusInfo = {
                status: "FAIL",
                errorMessage: errorMessage
            };
        },
    }
})

export const {
    listTablesAction,
    listTablesSuccessAction,
    listTablesErrorAction
} = listTablesSlice.actions

export default listTablesSlice.reducer