import { createSlice } from '@reduxjs/toolkit'
import { DATA_TABLE } from "../actions";
import { defaultState } from '../defaultState';

export const saveTableSlice = createSlice({
    name: DATA_TABLE,
    initialState: defaultState.saveTable,
    reducers: {
        loadTableAction: state => {
            state.isSaving = true;
            state.errors = '';
        },
        loadTableSuccessAction: (state, { payload: table }) => {
            state.isSaving = false;
            state.statusInfo = {
                status: "SUCCESS"
            };
        },
        loadTableErrorAction: (state, { payload: error }) => {
            state.isSaving = false;
            state.statusInfo = {
                status: "FAIL",
                errorMessage: error
            };
        },
    }
})

export const {
    saveTableAction,
    saveTableSuccessAction,
    saveTableErrorAction
} = saveTableSlice.actions

export default saveTableSlice.reducer