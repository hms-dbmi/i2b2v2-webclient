import { createSlice } from '@reduxjs/toolkit'
import { TABLE_DEF } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo} from "../models";

export const loadTableSlice = createSlice({
    name: TABLE_DEF,
    initialState: defaultState.tableDef,
    reducers: {
        loadTableAction: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        loadTableSuccessAction: (state, { payload: table }) => {
            state.isFetching = false;
            state.table = table;
            state.statusInfo = {
                status: "SUCCESS"
            };
        },
        loadTableErrorAction: (state, { payload: errorMessage }) => {
            state.isFetching = false;
            state.statusInfo = {
                status: "FAIL",
                errorMessage: errorMessage
            };
        },
    }
})

export const {
    loadTableAction,
    loadTableSuccessAction,
    loadTableErrorAction
} = loadTableSlice.actions

export default loadTableSlice.reducer