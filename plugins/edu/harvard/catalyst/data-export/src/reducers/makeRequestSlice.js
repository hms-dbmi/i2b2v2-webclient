import { createSlice } from '@reduxjs/toolkit'
import {MAKE_REQUEST_DETAILS} from "../actions";
import { defaultState } from '../defaultState';
import {StatusInfo, MakeRequestDetails} from "../models";

export const makeRequestSlice = createSlice({
    name: MAKE_REQUEST_DETAILS,
    initialState: defaultState.makeRequestDetails,
    reducers: {
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
    makeRequestError
} = makeRequestSlice.actions

export default makeRequestSlice.reducer