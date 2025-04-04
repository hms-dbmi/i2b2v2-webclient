import { createSlice } from '@reduxjs/toolkit'
import { REQUEST_DETAILS } from "../actions";
import { defaultState } from '../defaultState';
import {
    RequestStatus,
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
        getRequestDetailsSuccess: (state, { payload: {requestDetails, isManager }}) => {
            let status = RequestStatus._lookupStatus(requestDetails.status);
            if(status.length > 0){
                status = RequestStatus.statuses[status[0]];
            }else{
                status = RequestStatus.statuses.UNKNOWN;
            }
            let details = null;

            if(isManager){
                details = AdminRequestDetails({
                    id: requestDetails.id,
                    name: requestDetails.description,
                    requests: requestDetails.requests,
                    dateSubmitted: requestDetails.dateSubmitted,
                    email: requestDetails.email,
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
                    userId: requestDetails.userId,
                    status: status,
                    patientCount: requestDetails.patientCount,
                });
            }
            state.details = details;
            //state.details.isFetching = false;
            state.details.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getRequestDetailsError: (state, { payload: { errorMessage} }) => {
            //state.details.isFetching = false;
            state.details.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        generateDataFile: state => {
            state.dataFileGeneration.isGeneratingFile = false;
            state.dataFileGeneration.statusInfo = StatusInfo();
        },
        generateDataFileSuccess: (state, { payload: { errorMessage} }) => {
            state.dataFileGeneration.isGeneratingFile = false;
            state.dataFileGeneration.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
        generateDataFileError: (state, { payload: { errorMessage} }) => {
            state.dataFileGeneration.isGeneratingFile = false;
            state.dataFileGeneration.statusInfo  = StatusInfo({
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
        }
    }
})

export const {
    getRequestDetails,
    getRequestDetailsSuccess,
    getRequestDetailsError,
    generateDataFile,
    generateDataFileSuccess,
    generateDataFileError,
    reloadQuery,
    reloadQueryError
} = requestDetailsSlice.actions

export default requestDetailsSlice.reducer