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
            // get the range in which we can correctly place the row
            const rowOrdering = state.rows.map((row)=>(row.required ? false : row.order)).filter((a)=>a);
            const rowMin = (rowOrdering.length ? Math.min(...rowOrdering) : state.rows.length + 1);
            const rowMax = (rowOrdering.length ? Math.max(...rowOrdering) : state.rows.length + 1);
            let newRowIndex = 0;
            switch (row) {
                case Number.NEGATIVE_INFINITY:
                    newRowIndex = rowMin;
                    break;
                case Number.POSITIVE_INFINITY:
                    newRowIndex = rowMax + 1;
                    break;
                default:
                    newRowIndex = parseInt(row) + 1;
                    if (newRowIndex < rowMin) newRowIndex = rowMin;
            }
            // change the order attribute of the rows to make space for the current row
            if (newRowIndex <= rowMax) {
                for (let row of state.rows) {
                    if (row.order >= newRowIndex) row.order++;
                }
            }
            // create and insert the row
            const rowId = sdx.sdxInfo.sdxKeyValue + '[' + Math.floor(Math.random() * 1000 + 999) + ']';
            const newRow = TableDefinitionRow({
                id: rowId,
                order : newRowIndex,
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
        }
    }
})

export const {
    loadTable,
    loadTableSuccess,
    loadTableError,
    handleRowDelete,
    handleRowInsert,
    handleRowExported
} = loadTableSlice.actions

export default loadTableSlice.reducer