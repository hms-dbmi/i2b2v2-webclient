import { createSlice } from '@reduxjs/toolkit'
import { TABLE_DEF } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo, TableDefinition, TableDefinitionRow} from "../models";
import {DATATYPE} from "../models/TableDefinitionRow";
import XMLParser from 'react-xml-parser';

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

            let tableDefRows = [];
            let index=0;
            if(table.required){
                Object.entries(table.required).forEach(([key, value]) => {
                    let tableDefRow = TableDefinitionRow({
                        id: key,
                        order: index,
                        name: value.name,
                        display: value.display,
                        locked: value.locked,
                        dataOption: "Value",
                        required: true,
                        dataType: DATATYPE.STRING,
                    });
                    tableDefRows.push(tableDefRow);
                })
                index++;
            }

            table.concepts.forEach(concept => {
                let tableDefRow = TableDefinitionRow({
                    id: generateTableDefRowId(concept.sdxData.sdxInfo.sdxKeyValue),
                    order: index,
                    name: concept.textDisplay,
                    locked: concept.locked,
                    dataOption: concept.dataOption,
                    dataType: DATATYPE.STRING,
                });

                if(table.origData?.xmlOrig?.length > 0){
                    const parseXmlOrig = new XMLParser().parseFromString(table.oriData.xmlOrig);
                    if(parseXmlOrig.length !== 0) {
                        let dataType = parseXmlOrig[0].getElementsByTagName('DataType');
                        if(dataType.length !== 0 && DATATYPE[dataType[0].toUpperCase]) {
                            tableDefRow.dataType = DATATYPE[dataType[0].value.toUpperCase()];
                        }
                    }
                }

                tableDefRows.push(tableDefRow);
            });

            console.log("table defrows: " + JSON.stringify(tableDefRows));
            state.rows = tableDefRows;
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
            const rowId = generateTableDefRowId(sdx.sdxInfo.sdxKeyValue);
            const newRow = TableDefinitionRow({
                id: rowId,
                order : rowIndex,
                name: sdx.renderData.title,
                display: true,
                locked: false,
                sdxData: sdx,
                dataOption: "Exists",
                required: false
            });
            state.rows.push(newRow);
            // handle reindexing the order attribute for all items (just to make sure our numbering is correct)
            state.rows.sort((a,b) => a.order - b.order).forEach((x,i)=> { x.order = i + 1 });
        },
        handleRowExported: (state, { payload: {row, exported} }) => {
            state.rows = state.rows.map((data) => (data.id === row.id ? ({...data, display: exported}) : data ));
        },
        handleRowInsertSucceeded: (state, { payload: {rowIndex, dataType, xmlOrig} }) => {
            state.isLoadingDataType = false;

            state.rows.map((row, index) => {
                if(index === (rowIndex-1)){
                    row.dataType = dataType;

                    if(row.sdxData.origData === undefined){
                        row.sdxData.origData = {};
                    }
                    row.sdxData.origData.xmlOrig = xmlOrig;
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
                    temp.dataOption = value;
                    break;
                }
            }
        }
    }
})

const generateTableDefRowId = (key) => {
    return key + '[' + Math.floor(Math.random() * 1000 + 999) + ']';
}
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