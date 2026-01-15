import { createSlice } from '@reduxjs/toolkit'
import {
    USER_ROLE_COUNTS,
} from "../actions";
import { defaultState } from '../defaultState';
import { UserRoleCount, StatusInfo } from "models";
import {USER_DATA_ROLES} from "../models";

export const userRoleCountsSlice = createSlice({
    name: USER_ROLE_COUNTS,
    initialState: defaultState.userRoleCounts,
    reducers: {
        getAllUserRoleCounts: state => {
            state.isFetching = true;
            state.statusInfo = StatusInfo();
        },
        getAllUserRoleCountsSucceeded: (state, { payload: {userRoleCountsList, projectId} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });

            let userRoleCounts = [];

            let adminUserCount = 0;
            let managerUserCount = 0;

            userRoleCountsList.map((userRoleCount) => {
                let role = USER_DATA_ROLES[userRoleCount.role];
                role = role ? role : USER_DATA_ROLES.UNKNOWN;

                userRoleCounts.push(UserRoleCount({
                    projectId: userRoleCount.projectId,
                    role: role,
                    count: userRoleCount.count,
                }));

                if(userRoleCount.projectId === "@" && userRoleCount.role === "ADMIN"){
                    adminUserCount = userRoleCount.count;
                }

                if(userRoleCount.projectId === projectId && userRoleCount.role === "MANAGER"){
                    managerUserCount = userRoleCount.count;
                }
            });

            state.userRoleCountsList = userRoleCounts;
            state.adminUserCount = adminUserCount;
            state.managerUserCount = managerUserCount;
        },
        getAllUserRoleCountsFailed: (state, { payload: response }) => {
            state.isFetching = false;
            const errorMessage = response && response.errorMessage ? response.errorMessage: "An error occurred retrieving " +
                "user role counts";

            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getAllUserRoleCounts,
    getAllUserRoleCountsSucceeded,
    getAllUserRoleCountsFailed
} = userRoleCountsSlice.actions

export default userRoleCountsSlice.reducer