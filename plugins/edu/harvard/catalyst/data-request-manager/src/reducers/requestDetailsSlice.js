import { createSlice } from '@reduxjs/toolkit'
import { REQUEST_DETAILS } from "../actions";
import { defaultState } from '../defaultState';
import {
    ResearcherRequestDetails,
    StatusInfo, AdminRequestDetails
} from "../models";

export const requestDetailsSlice = createSlice({
    name: REQUEST_DETAILS,
    initialState: defaultState.requestDetails,
    reducers: {
        getRequestDetails: state => {
            state.details = ResearcherRequestDetails();
            state.details.isFetching = true;
            state.details.statusInfo = StatusInfo();
        },
        getRequestDetailsSuccess: (state, { payload: {requestDetails, isManager, isAdmin }}) => {
            let status = requestDetails.status;
            let details = null;

            if(isManager || isAdmin){
                details = AdminRequestDetails({
                    id: requestDetails.id,
                    name: requestDetails.description,
                    requests: requestDetails.requests,
                    dateSubmitted: requestDetails.dateSubmitted,
                    email: requestDetails.email,
                    approvedBy: requestDetails.approvedBy,
                    exportDirectory: requestDetails.exportDirectory,
                    userId: requestDetails.userId,
                    status: status,
                    patientCount: requestDetails.patientCount,
                });
            }
           else {
                details = ResearcherRequestDetails({
                    id: requestDetails.id,
                    name: requestDetails.description,
                    requests: requestDetails.requests,
                    dateSubmitted: requestDetails.dateSubmitted,
                    email: requestDetails.email,
                    approvedBy: requestDetails.approvedBy,
                    userId: requestDetails.userId,
                    status: status,
                    patientCount: requestDetails.patientCount,
                });
            }
            state.details = details;
            state.details.isFetching = false;
            state.details.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getRequestDetailsError: (state, { payload: { errorMessage} }) => {
            state.details.isFetching = false;
            state.details.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        reloadQuery: (state) => {
            state.reloadQueryStatus = StatusInfo();
        },
        reloadQueryError: (state, { payload: { errorMessage} }) => {
            state.reloadQueryStatus = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        updateRequestStatus: state => {
            state.details.isUpdatingStatus = true;
            state.details.statusUpdateStatusInfo = StatusInfo();
        },
        updateRequestStatusSuccess: (state, { payload: {status} }) => {
            state.details.status = status;
            state.details.isUpdatingStatus = false;
            state.details.statusUpdateStatusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        updateRequestStatusError: (state, { payload: { errorMessage} }) => {
            state.details.isUpdatingStatus = false;
            state.details.statusUpdateStatusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getRequestDetails,
    getRequestDetailsSuccess,
    getRequestDetailsError,
    reloadQuery,
    reloadQueryError,
    updateRequestStatus,
    updateRequestStatusSuccess,
    updateRequestStatusError
} = requestDetailsSlice.actions

export default requestDetailsSlice.reducer