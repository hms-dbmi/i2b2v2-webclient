import { createSlice } from '@reduxjs/toolkit'
import { TABLE_DEFINITION } from "../actions";
import { defaultState } from '../defaultState';
import {
    TableDefinition,
    TableDefinitionRow,
    StatusInfo,
} from "../models";
import {DATA_OPTION_LOOKUP} from "../models/TableDefinitionRow";

export const tableDefSlice = createSlice({
    name: TABLE_DEFINITION,
    initialState: defaultState.tableDef,
    reducers: {
        getTableDefinition: state => {
            state = TableDefinition();
        },
        getTableDefinitionSuccess: (state, { payload: { tableDef } }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS",
            });
            state.title = tableDef.title;
            state.concepts = tableDef.rows.map((tdef, index) => {
                let dataOption = DATA_OPTION_LOOKUP[tdef.dataOption];
                dataOption = dataOption !== undefined ? dataOption : "";
                return TableDefinitionRow({
                    id: index,
                    name: tdef.name,
                    sdxData: tdef.sdxData,
                    dataOption: dataOption,
                    display: tdef.display
                });
            });
        },
        getTableDefinitionError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo  = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        getTableDefinitionStatusConfirmed: (state) => {
            state.statusInfo  = StatusInfo();
        },
    }
})

export const {
    getTableDefinition,
    getTableDefinitionSuccess,
    getTableDefinitionError,
    getTableDefinitionStatusConfirmed
} = tableDefSlice.actions

export default tableDefSlice.reducer