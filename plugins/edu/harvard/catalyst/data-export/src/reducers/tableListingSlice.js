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
            state.globalRows = tableDefs.globalRows.map(table => {
                return TableListingRow({
                    id: table.id,
                    title: table.title,
                    creator_id: table.creator_id,
                    create_date: table.create_date,
                    update_date: table.update_date,
                    column_count: table.column_count,
                    visible: table.visible
                });
            });
            state.projectRows = tableDefs.projectRows.map(table => {
                return TableListingRow({
                    id: table.id,
                    title: table.title,
                    creator_id: table.creator_id,
                    create_date: table.create_date,
                    update_date: table.update_date,
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
                    update_date: table.update_date,
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

        deleteTableSuccess: (state, { payload: { tableId, isProjectShared, isGlobalShared } }) => {
            state.isDeleting = false;
            state.deleteStatusInfo = StatusInfo({
                status: "SUCCESS"
            });
            if(isGlobalShared){
                state.globalRows = state.globalRows.filter((row) => row.id !== tableId);
            }
            else if(isProjectShared){
                state.projectRows = state.projectRows.filter((row) => row.id !== tableId);
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
        renameTable: state => {
            state.isRenaming = true;
            state.renameStatusInfo = StatusInfo();
        },
        renameTableSuccess: (state, { payload: { id, title, isProjectShared, isGlobalShared } }) => {
            state.isRenaming = false;
            state.renameStatusInfo = StatusInfo({
                status: "SUCCESS"
            });
            if(isGlobalShared){
                state.globalRows = state.globalRows.map((row) => {
                    if(row.id === id){
                        row.title = title;
                    }
                    return row;
                });
            }
            else if(isProjectShared){
                state.projectRows = state.projectRows.map((row) => {
                    if(row.id === id){
                        row.title = title;
                    }
                    return row;
                });
            }
            else{
                state.userRows = state.userRows.map((row) => {
                    if(row.id === id){
                        row.title = title;
                    }
                    return row;
                });
            }
        },
        renameTableError: (state, { payload: { errorMessage } }) => {
            state.isRenaming= false;
            state.renameStatusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        confirmRenameTableStatus: state => {
            state.renameStatusInfo = StatusInfo();
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
    confirmDeleteTableStatus,
    renameTable,
    renameTableSuccess,
    renameTableError,
    confirmRenameTableStatus,
} = tableListingSlice.actions

export default tableListingSlice.reducer