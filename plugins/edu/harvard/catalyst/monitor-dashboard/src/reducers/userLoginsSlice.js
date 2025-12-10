import { createSlice } from '@reduxjs/toolkit'
import {
    USER_LOGINS,
} from "../actions";
import { defaultState } from '../defaultState';
import { UserLogin, StatusInfo } from "models";
import {LOGIN_ATTEMPT} from "../models";

export const userLoginsSlice = createSlice({
    name: USER_LOGINS,
    initialState: defaultState.userLogins,
    reducers: {
        getUserLogins: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        getUserLoginsSucceeded: (state, { payload: userLoginList }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });

            let logins = [];
            let loginSuccessCount = 0;
            let loginFailCount = 0;
            let loginTotalCount = 0;

            userLoginList.map((login) => {
                if(login.attempt.toUpperCase() === LOGIN_ATTEMPT.SUCCESS) {
                    loginSuccessCount++;
                }else{
                    loginFailCount++;
                }

                loginTotalCount++;
                logins.push(UserLogin({
                    name: login.name,
                    entryDate: login.entryDate,
                    attempt: LOGIN_ATTEMPT.lookup(login.attempt)
                }));
            })

            state.loginList = logins;
            state.loginTotalCount = loginTotalCount;
            state.loginSuccessCount = loginSuccessCount;
            state.loginFailCount = loginFailCount;
        },
        getUserLoginsFailed: (state, { payload: response }) => {
            state.isFetching = false;
            const errorMessage = response && response.errorMessage ? response.errorMessage: "An error occurred retrieving " +
                "user logins";

            console.log("error msg " + errorMessage);

            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getUserLogins,
    getUserLoginsSucceeded,
    getUserLoginsFailed
} = userLoginsSlice.actions

export default userLoginsSlice.reducer