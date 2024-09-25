import { createSlice } from '@reduxjs/toolkit'
import { TABLE_DEF } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo, TableDefinitionRow} from "../models";
import {DATATYPE, generateTableDefRowId} from "../models/TableDefinitionRow";
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
            let index=1;
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
                    });
                    tableDefRows.push(tableDefRow);
                    index++;
                })
            }

            table.concepts.forEach(concept => {
                let tableDefRow = TableDefinitionRow({
                    id: generateTableDefRowId(concept.sdxData.sdxInfo.sdxKeyValue),
                    order: index,
                    name: concept.textDisplay,
                    locked: concept.locked,
                    dataOption: concept.dataOption,
                    sdxData: concept.sdxData
                });

                if(concept.sdxData.origData?.xmlOrig?.length > 0){
                    try{
                        const xmlParser = new XMLParser();
                        const parseXmlOrig = xmlParser.parseFromString(concept.sdxData.origData.xmlOrig);
                        if(parseXmlOrig) {
                            let conceptXml = parseXmlOrig.getElementsByTagName('concept');
                            if(conceptXml.length !== 0) {
                                let metadataXml = conceptXml[0].getElementsByTagName('metadataxml');
                                if(metadataXml.length !== 0) {
                                    let dataType = metadataXml[0].getElementsByTagName('DataType');
                                    if(dataType.length !== 0 && DATATYPE[dataType[0].value.toUpperCase()]) {
                                        tableDefRow.dataType = DATATYPE[dataType[0].value.toUpperCase()];
                                    }
                                }
                            }
                        }
                    }
                    catch(e){
                        console.log("No value metadata xml found for concept " + concept.textDisplay);
                    }
                }
                tableDefRows.push(tableDefRow);
                index++;
            });

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
        handleRowInsert:(state, { payload: {rowIndex, rowId, sdx} }) => {
            state.isLoadingDataType = true;

            // get the range in which we can correctly place the row
            const rowOrdering = state.rows.map((row)=>(row.required ? false : row.order)).filter((a)=>a);
            const rowMin = (rowOrdering.length ? Math.min(...rowOrdering) : state.rows.length + 1);
            const rowMax = (rowOrdering.length ? Math.max(...rowOrdering) : state.rows.length + 1);
            let newRowIndex = 0;
            switch (rowIndex) {
                case Number.NEGATIVE_INFINITY:  // this is required, in-band signal sent from drop controller
                    newRowIndex = rowMin;
                    break;
                case Number.POSITIVE_INFINITY:  // this is required, in-band signal sent from drop controller
                    newRowIndex = rowMax + 1;
                    break;
                default:
                    newRowIndex = parseInt(rowIndex) + 1;
                    if (newRowIndex < rowMin) newRowIndex = rowMin;
            }

            // change the order attribute of the rows to make space for the current row
            if (newRowIndex <= rowMax) {
                for (let row of state.rows) {
                    if (row.order >= newRowIndex) row.order++;
                }
            }
            // create and insert the row
            const newRow = TableDefinitionRow({
                id: rowId,
                order : newRowIndex,
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
        handleRowInsertSucceeded: (state, { payload: {rowId, dataType, xmlOrig} }) => {
            state.isLoadingDataType = false;

            state.rows.map((row, index) => {
                if(row.id === rowId){
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
        handleRowAggregation: (state, { payload: {id, value} }) => {
            for (let temp of state.rows) {
                if (temp.id === id) {
                    temp.dataOption = value;
                    break;
                }
            }
        },
        handleRowName: (state, { payload: {id, value} }) => {
            for (let temp of state.rows) {
                if (temp.id === id) {
                    temp.name = value;
                    break;
                }
            }
        },
        handleRowSdx: (state, { payload: {id, sdx} }) => {
            for (let temp of state.rows) {
                if (temp.id === id) {
                    temp.sdxData = sdx;
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
    handleRowAggregation,
    handleRowName,
    handleRowSdx
} = loadTableSlice.actions

export default loadTableSlice.reducer