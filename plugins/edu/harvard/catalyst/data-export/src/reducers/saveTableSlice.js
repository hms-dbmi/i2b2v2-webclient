import { createSlice } from '@reduxjs/toolkit'
import {SAVE_TABLE} from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo} from "../models";

export const saveTableSlice = createSlice({
    name: SAVE_TABLE,
    initialState: defaultState.saveTable,
    reducers: {
        saveTableAction: state => {
            state.isSaving = true;
            state.statusInfo = StatusInfo();
        },
        saveTableSuccessAction: (state, { payload: table }) => {
            state.isSaving = false;
            state.statusInfo = {
                status: "SUCCESS"
            };
        },
        saveTableErrorAction: (state, { payload: errorMessage }) => {
            state.isSaving = false;
            state.statusInfo = {
                status: "FAIL",
                errorMessage: errorMessage
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