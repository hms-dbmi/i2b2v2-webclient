import { createSlice } from '@reduxjs/toolkit'
import { RESEARCHER_TABLE } from "../actions";
import { defaultState } from '../defaultState';
import {ResearcherTable, StatusInfo} from "../models";

export const listResearcherTableSlice = createSlice({
    name: RESEARCHER_TABLE,
    initialState: defaultState.researcherTable,
    reducers: {
        listResearcherTable: state => {
            return ResearcherTable({
                isFetching: true
            })
        },
        listResearcherTableSuccess: (state, { payload: researcherRequests }) => {
            state.rows = researcherRequests;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        listResearcherTableError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    listResearcherTable,
    listResearcherTableSuccess,
    listResearcherTableError,
} = listResearcherTableSlice.actions

export default listResearcherTableSlice.reducer