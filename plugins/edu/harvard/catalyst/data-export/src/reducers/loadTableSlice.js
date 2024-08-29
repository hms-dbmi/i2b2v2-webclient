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
        handleRowDelete:(state, { payload: { row } }) => {
            state.rows = state.rows.filter(r => r.id !== row.id);
        },
        handleRowInsert:(state, { payload: {row, sdx} }) => {
            let rowOrder = parseInt(row);
            const newRow = TableDefinitionRow({
                id: sdx.renderData.title,
                order : rowOrder + 1,
                name: sdx.renderData.title,
                display: true,
                locked: false,
                sdxData: sdx,
                dataOptions: "Value",
                required: false
            });
            state.rows.push(newRow);
        },
        handleRowExported: (state, { payload: {row, exported} }) => {
            state.rows = state.rows.map((data) => (data.id === row.id ? ({...data, display: exported}) : data ));
        },
        handleRowInsertSucceeded: (state) => {
            state.isLoadingDataType = false;
        },
        handleRowInsertError: (state) => {
            state.isLoadingDataType = false;
        }
    }
})

export const {
    loadTable,
    loadTableSuccess,
    loadTableError,
    handleRowDelete,
    handleRowInsert,
    handleRowExported,
    handleRowInsertSucceeded,
    handleRowInsertError
} = loadTableSlice.actions

export default loadTableSlice.reducer