import { createSlice } from '@reduxjs/toolkit'
import { REQUEST_DETAILS } from "../actions";
import { defaultState } from '../defaultState';
import {
    RequestStatus,
    ResearcherRequest,
    ResearcherRequestDetails,
    ResearcherTable,
    ResearcherTableRow,
    StatusInfo
} from "../models";
import {DateTime} from "luxon";

export const getRequestDetailsSlice = createSlice({
    name: REQUEST_DETAILS,
    initialState: defaultState.researcherRequest,
    reducers: {
        getRequestDetails: state => {
            return ResearcherTable({
                isFetching: true
            })
        },
        getRequestDetailsSuccess: (state, { payload: researcherRequests }) => {
            let status = RequestStatus._lookupStatus(researcherRequests.status);
            if(status.length > 0){
                status = RequestStatus.statuses[status[0]];
            }else{
                status = RequestStatus.statuses.UNKNOWN;
            }

            const details = ResearcherRequestDetails({
                    id: researcherRequests.id,
                    name: researcherRequests.name,
                    description: researcherRequests.description,
                    requests: researcherRequests.requests,
                    dateSubmitted: DateTime.fromISO(researcherRequests.dateSubmitted).toJSDate(),
                    lastUpdated: DateTime.fromISO(researcherRequests.lastUpdated).toJSDate(),
                    irbNumber: researcherRequests.irbNumber,
                    email: researcherRequests.email,
                    userId: researcherRequests.userId,
                    status:  status,
                    statusLogs: researcherRequests.statusLogs.map((st) => {
                        let lstatus = RequestStatus._lookupStatus(st.status);
                        if(lstatus.length > 0){
                            lstatus = RequestStatus.statuses[lstatus[0]];
                        }else{
                            lstatus = RequestStatus.statuses.UNKNOWN;
                        }

                        return {
                            date: DateTime.fromISO(st.date).toJSDate(),
                            status: lstatus
                        }
                    })
                });
            state.details = details;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getRequestDetailsError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
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
} = getRequestDetailsSlice.actions

export default getRequestDetailsSlice.reducer