import { createSlice } from '@reduxjs/toolkit'
import {
    USER_SESSIONS,
} from "../actions";
import { defaultState } from '../defaultState';
import { UserSession, StatusInfo } from "models";

export const userSessionsSlice = createSlice({
    name: USER_SESSIONS,
    initialState: defaultState.userSessions,
    reducers: {
        getUserSessions: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        getUserSessionsSucceeded: (state, { payload: userSessionList }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });

            let sessions = [];
            userSessionList.map((session) => {
                sessions.push(UserSession({
                    id: session.id,
                    name: session.name,
                    entryDate: session.entryDate,
                    expireDate: session.expireDate
                }));
            })

            state.sessionList = sessions;
            state.sessionCount = sessions.length;
        },
        getUserSessionsFailed: (state, { payload: { errorMessage } }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getUserSessions,
    getUserSessionsSucceeded,
    getUserSessionsFailed
} = userSessionsSlice.actions

export default userSessionsSlice.reducer