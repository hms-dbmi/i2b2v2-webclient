import { createSlice } from '@reduxjs/toolkit'
import {MAKE_REQUEST_DETAILS} from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo, MakeRequestDetails} from "../models";

export const makeRequestSlice = createSlice({
    name: MAKE_REQUEST_DETAILS,
    initialState: defaultState.makeRequestDetails,
    reducers: {
        updateRequestComments: (state, { payload: comments }) => {
            state.comments = comments;
        },
        updateRequestEmail: (state, { payload: email }) => {
            state.email = email;
        },
        makeRequest: state => {
            state = MakeRequestDetails({
                isFetching: false
            })
        },
        makeRequestSuccess: (state) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        makeRequestError: (state, { payload: errorMessage }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    makeRequest,
    makeRequestSuccess,
    makeRequestError,
    updateRequestEmail,
    updateRequestComments
} = makeRequestSlice.actions

export default makeRequestSlice.reducer