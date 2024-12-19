import { createSlice } from '@reduxjs/toolkit'
import { REQUEST_DETAILS } from "../actions";
import { defaultState } from '../defaultState';
import {
    RequestStatus, RequestStatusLog,
    ResearcherRequestDetails,
    StatusInfo, AdminRequestDetails, RequestDetails
} from "../models";
import {DateTime} from "luxon";

export const getRequestDetailsSlice = createSlice({
    name: REQUEST_DETAILS,
    initialState: defaultState.requestDetails,
    reducers: {
        getRequestDetails: state => {
            state.details.isFetching = true;
            state.details.statusInfo = StatusInfo();
        },
        getRequestDetailsSuccess: (state, { payload: {requestDetails, isAdmin }}) => {
            let status = RequestStatus._lookupStatus(requestDetails.status);
            if(status.length > 0){
                status = RequestStatus.statuses[status[0]];
            }else{
                status = RequestStatus.statuses.UNKNOWN;
            }
            let details = null;

            if(isAdmin){
                details = AdminRequestDetails({
                    id: requestDetails.id,
                    name: requestDetails.name,
                    description: requestDetails.description,
                    requests: requestDetails.requests,
                    dateSubmitted: DateTime.fromISO(requestDetails.dateSubmitted).toJSDate(),
                    lastUpdated: DateTime.fromISO(requestDetails.lastUpdated).toJSDate(),
                    email: requestDetails.email,
                    userId: requestDetails.userId,
                    status: status,
                    patientCount: requestDetails.patientCount,
                    statusLogs: requestDetails.statusLogs.map((st, index) => {
                        let lstatus = RequestStatus._lookupStatus(st.status);
                        if (lstatus.length > 0) {
                            lstatus = lstatus[0];
                        } else {
                            lstatus = RequestStatus.statuses.UNKNOWN;
                        }

                        return RequestStatusLog({
                            id: index,
                            date: DateTime.fromISO(st.date).toJSDate(),
                            status: lstatus
                        })
                    })
                });
            }
           else {
                details = ResearcherRequestDetails({
                    id: requestDetails.id,
                    name: requestDetails.name,
                    description: requestDetails.description,
                    requests: requestDetails.requests,
                    dateSubmitted: DateTime.fromISO(requestDetails.dateSubmitted).toJSDate(),
                    lastUpdated: DateTime.fromISO(requestDetails.lastUpdated).toJSDate(),
                    email: requestDetails.email,
                    userId: requestDetails.userId,
                    status: status,
                    statusLogs: requestDetails.statusLogs.map((st, index) => {
                        let lstatus = RequestStatus._lookupStatus(st.status);
                        if (lstatus.length > 0) {
                            lstatus = lstatus[0];
                        } else {
                            lstatus = RequestStatus.statuses.UNKNOWN;
                        }

                        return RequestStatusLog({
                            id: index,
                            date: DateTime.fromISO(st.date).toJSDate(),
                            status: lstatus
                        })
                    })
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
    }
})

export const {
    getRequestDetails,
    getRequestDetailsSuccess,
    getRequestDetailsError,
    generateDataFile,
    generateDataFileSuccess,
    generateDataFileError
} = getRequestDetailsSlice.actions

export default getRequestDetailsSlice.reducer