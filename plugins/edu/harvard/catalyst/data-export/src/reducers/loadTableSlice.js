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
            // handle reindexing the order attribute for all items
            state.rows.sort((a,b) => a.order - b.order).forEach((x,i)=> { x.order = i + 1 });
        },
        handleRowInsert:(state, { payload: {rowIndex, sdx} }) => {
            state.isLoadingDataType = true;

            // get the range in which we can correctly place the row
            const rowOrdering = state.rows.map((row)=>(row.required ? false : row.order)).filter((a)=>a);
            const rowMax = (rowOrdering.length ? Math.max(...rowOrdering) : state.rows.length + 1);

            // change the order attribute of the rows to make space for the current row
            if (rowIndex <= rowMax) {
                for (let row of state.rows) {
                    if (row.order >= rowIndex) row.order++;
                }
            }
            // create and insert the row
            const rowId = sdx.sdxInfo.sdxKeyValue + '[' + Math.floor(Math.random() * 1000 + 999) + ']';
            const newRow = TableDefinitionRow({
                id: rowId,
                order : rowIndex,
                name: sdx.renderData.title,
                display: true,
                locked: false,
                sdxData: sdx,
                dataOptions: "Value",
                required: false
            });
            state.rows.push(newRow);
            // handle reindexing the order attribute for all items (just to make sure our numbering is correct)
            state.rows.sort((a,b) => a.order - b.order).forEach((x,i)=> { x.order = i + 1 });
        },
        handleRowExported: (state, { payload: {row, exported} }) => {
            state.rows = state.rows.map((data) => (data.id === row.id ? ({...data, display: exported}) : data ));
        },
        handleRowInsertSucceeded: (state, { payload: {rowIndex, dataType, origXml} }) => {
            state.isLoadingDataType = false;

            state.rows.map((row, index) => {
                if(index === (rowIndex-1)){
                    console.log("Updating index " + (rowIndex-1));
                    row.dataType = dataType;
                    row.sdxData.origXml = origXml;
                }

                return row;
            })
        },
        handleRowInsertError: (state) => {
            state.isLoadingDataType = false;
        },
        handleRowAggregation: (state, { payload: {row, value} }) => {
            for (let temp of state.rows) {
                if (temp.id === row.id) {
                    temp.dataOptions = value;
                    break;
                }
            }
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
    handleRowInsertError,
    handleRowAggregation
} = loadTableSlice.actions

export default loadTableSlice.reducer