import {createSlice} from "@reduxjs/toolkit";
import {USER_ACCESS_LEVEL} from "../actions";
import {defaultState} from "../defaultState";
import {ACCESS_LEVEL, StatusInfo, UserAccessLevel} from "../models";

export const userAccessLevelSlice = createSlice({
    name: USER_ACCESS_LEVEL,
    initialState: defaultState.userAccessLevel,
    reducers: {
        getUserAccessLevel: state => {
            return UserAccessLevel({
                isFetching: true
            })
        },
        getUserAccessLevelSuccess: (state, { payload:isAdmin }) => {
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
        getUserAccessLevelError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getUserAccessLevel,
    getUserAccessLevelSuccess,
    getUserAccessLevelError,
} = userAccessLevelSlice.actions

export default userAccessLevelSlice.reducer