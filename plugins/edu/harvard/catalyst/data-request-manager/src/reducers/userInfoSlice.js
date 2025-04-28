import {StatusInfo, UserInfo} from "../models";
import {USER_INFO} from "../actions";
import {defaultState} from "../defaultState";
import {createSlice} from "@reduxjs/toolkit";

export const userInfoSlice = createSlice({
    name: USER_INFO,
    initialState: defaultState.userInfo,
    reducers: {
        getUserInfo: state => {
            return UserInfo({
                isFetching: true
            })
        },
        getUserInfoSuccess: (state, { payload: userInfo }) => {
            state.username = userInfo.username;
            state.isAdmin = userInfo.isAdmin;
            state.isManager = userInfo.isManager;
            state.isObfuscated = userInfo.isObfuscated;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getUserInfoError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getUserInfo,
    getUserInfoSuccess,
    getUserInfoError,
} = userInfoSlice.actions

export default userInfoSlice.reducer