import {createSlice} from "@reduxjs/toolkit";
import {REQUEST_COMMENTS} from "../actions";
import {defaultState} from "../defaultState";
import { RequestComments, StatusInfo} from "../models";

export const requestCommentsSlice = createSlice({
    name: REQUEST_COMMENTS,
    initialState: defaultState.requestComments,
    reducers: {
        getRequestComments: state => {
            return RequestComments({
                isFetching: true
            })
        },
        getRequestCommentsSuccess: (state, { payload: {comments} }) => {
            state.comments = comments
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getRequestCommentsError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        updateRequestComments: state => {
            state.isSaving = true;
            state.saveStatusInfo = StatusInfo();
        },
        updateRequestCommentsSuccess: (state, { payload: {comments} }) => {
            state.comments= comments;
            state.isSaving = false;
            state.saveStatusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        updateRequestCommentsError: (state, { payload: { errorMessage} }) => {
            state.isSaving = false;
            state.saveStatusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        updateRequestCommentsConfirmed: (state) => {
            state.saveStatusInfo  = StatusInfo();
        },
    }
})

export const {
    getRequestComments,
    getRequestCommentsSuccess,
    getRequestCommentsError,
    updateRequestComments,
    updateRequestCommentsSuccess,
    updateRequestCommentsError,
    updateRequestCommentsConfirmed
} = requestCommentsSlice.actions

export default requestCommentsSlice.reducer