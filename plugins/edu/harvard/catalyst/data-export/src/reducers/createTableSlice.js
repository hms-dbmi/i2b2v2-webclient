import { createSlice } from '@reduxjs/toolkit'
import { DATA_TABLE } from "../actions";
import { defaultState } from '../defaultState';

export const dataTableSlice = createSlice({
    name: DATA_TABLE,
    initialState: defaultState.dataTable,
    reducers: {
        loadTableAction: state => {
            state.isFetching = true;
            state.errors = '';
        },
        loadTableSuccessAction: (state, { payload: table }) => {
            state.isFetching = false;
            state.table = table;
        },
        loadTableErrorAction: (state, { payload: error }) => {
            state.isFetching = true;
            state.errors = error;
        },
    }
})

// Action creators are generated for each case reducer function
export const {
    loadTableAction,
    loadTableSuccessAction,
    loadTableErrorAction
} = dataTableSlice.actions

export default dataTableSlice.reducer