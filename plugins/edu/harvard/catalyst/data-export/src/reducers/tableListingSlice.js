import { createSlice } from '@reduxjs/toolkit'
import { TABLE_LISTING } from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo, TableListing, TableListingRow} from "../models";

export const tableListingSlice = createSlice({
    name: TABLE_LISTING,
    initialState: defaultState.tableListing,
    reducers: {
        listTables: state => {
            return TableListing({
                isFetching: true
            })
        },
        listTablesSuccess: (state, { payload: tableDefs }) => {
            state.sharedRows = tableDefs.sharedRows.map(table => {
                return TableListingRow({
                    id: table.id,
                    title: table.title,
                    creator_id: table.creator_id,
                    create_date: table.create_date,
                    column_count: table.column_count,
                    visible: table.visible
                });
            });
            state.userRows = tableDefs.userRows.map(table => {
                return TableListingRow({
                    id: table.id,
                    title: table.title,
                    creator_id: table.creator_id,
                    create_date: table.create_date,
                    column_count: table.column_count,
                    visible: table.visible
                });
            });
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        listTablesError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        deleteTable: state => {
            state.isDeleting = true;
            state.deleteStatusInfo = StatusInfo();
        },

        deleteTableSuccess: (state, { payload: { tableId, isShared } }) => {
            state.isDeleting = false;
            state.deleteStatusInfo = StatusInfo({
                status: "SUCCESS"
            });
            if(isShared){
                state.sharedRows = state.sharedRows.filter((row) => row.id !== tableId);
            }
            else{
                state.userRows = state.userRows.filter((row) => row.id !== tableId);
            }

        },
        deleteTableError: (state, { payload: { errorMessage } }) => {
            state.isDeleting= false;
            state.deleteStatusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        confirmDeleteTableStatus: state => {
            state.deleteStatusInfo = StatusInfo();
        },
    }
})

export const {
    listTables,
    listTablesSuccess,
    listTablesError,
    deleteTable,
    deleteTableSuccess,
    deleteTableError,
    confirmDeleteTableStatus
} = tableListingSlice.actions

export default tableListingSlice.reducer