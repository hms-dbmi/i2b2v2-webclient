import { createSlice } from '@reduxjs/toolkit'
import {SAVE_TABLE} from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo} from "../models";

export const saveTableSlice = createSlice({
    name: SAVE_TABLE,
    initialState: defaultState.saveTable,
    reducers: {
        saveTable: state => {
            state.isSaving = true;
            state.statusInfo = StatusInfo();
        },
        saveTableSuccess: (state, { payload: table }) => {
            state.isSaving = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        saveTableError: (state, { payload: errorMessage }) => {
            state.isSaving = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    saveTable,
    saveTableSuccess,
    saveTableError
} = saveTableSlice.actions

export default saveTableSlice.reducer