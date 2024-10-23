import { createSlice } from '@reduxjs/toolkit'
import {MAKE_REQUEST_DETAILS} from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo} from "../models";

export const makeRequestSlice = createSlice({
    name: MAKE_REQUEST_DETAILS,
    initialState: defaultState.makeRequestDetails,
    reducers: {
        updateRequestPatientSet: (state, { payload: sdx }) => {
            state.patientSet.title = sdx.renderData.title;
            state.patientSet.sdx = sdx;
        },
        updateRequestComments: (state, { payload: comments }) => {
            state.comments = comments;
        },
        updateRequestEmail: (state, { payload: email }) => {
            state.email = email;
        },
        makeRequest: state => {
            state.isSubmitting = true;
            state.statusInfo = StatusInfo();
        },
        makeRequestSuccess: (state) => {
            state.isSubmitting = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        makeRequestError: (state, { payload: { errorMessage } }) => {
            state.isSubmitting = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        makeRequestStatusConfirmed: (state) => {
            state.statusInfo = StatusInfo();
        },
    }
})

export const {
    makeRequest,
    makeRequestSuccess,
    makeRequestError,
    makeRequestStatusConfirmed,
    updateRequestPatientSet,
    updateRequestEmail,
    updateRequestComments
} = makeRequestSlice.actions

export default makeRequestSlice.reducer