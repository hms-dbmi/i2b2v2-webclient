import {createSlice} from "@reduxjs/toolkit";
import {USER_ACCESS_LEVEL} from "../actions";
import {defaultState} from "../defaultState";
import {ACCESS_LEVEL, StatusInfo, UserAccessLevel} from "../models";

export const retrieveUserAccessLevelSlice = createSlice({
    name: USER_ACCESS_LEVEL,
    initialState: defaultState.userAccessLevel,
    reducers: {
        retrieveUserAccessLevel: state => {
            return UserAccessLevel({
                isFetching: true
            })
        },
        retrieveUserAccessLevelSuccess: (state, { payload:isAdmin }) => {
            if(isAdmin) {
                state.accessLevel = ACCESS_LEVEL.ADMIN;
            } else{
                state.accessLevel = ACCESS_LEVEL.RESEARCHER;
            }
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        retrieveUserAccessLevelError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    retrieveUserAccessLevel,
    retrieveUserAccessLevelSuccess,
    retrieveUserAccessLevelError,
} = retrieveUserAccessLevelSlice.actions

export default retrieveUserAccessLevelSlice.reducer