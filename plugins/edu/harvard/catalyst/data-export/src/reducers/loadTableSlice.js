import { createSlice } from '@reduxjs/toolkit'
import { TABLE_DEF } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo, TableDefinitionRow} from "../models";

export const loadTableSlice = createSlice({
    name: TABLE_DEF,
    initialState: defaultState.tableDef,
    reducers: {
        loadTable: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        loadTableSuccess: (state, { payload: table }) => {
            state.isFetching = false;
            state.rows = table;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        loadTableError: (state, { payload: errorMessage }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        insertConcept:(state, { payload: {row, sdx} }) => {
            const newRow = TableDefinitionRow({
                id: sdx.renderData.title,
                order : row,
                name: sdx.renderData.title,
                display: true,
                locked: false,
                sdxData: sdx,
                dataOptions: "Value",
                required: false
            });

            state.rows  = [
                ...state.rows.slice(0, row),
                newRow,
                ...state.rows.slice(row)
            ];
        }
    }
})

export const {
    loadTable,
    loadTableSuccess,
    loadTableError,
    insertConcept
} = loadTableSlice.actions

export default loadTableSlice.reducer