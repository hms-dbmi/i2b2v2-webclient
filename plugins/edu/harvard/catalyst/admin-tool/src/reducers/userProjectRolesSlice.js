import { createSlice } from '@reduxjs/toolkit'
import {
    USER_PROJECT_ROLES,
} from "../actions";
import { defaultState } from "../defaultState";
import {ADMIN_ROLES, DATA_ROLES, UserProjectRole, UserProjectRoles} from "../models";
import {StatusInfo} from "../models/StatusInfo";

export const userProjectRolesSlice = createSlice({
    name: USER_PROJECT_ROLES,
    initialState: defaultState.userProjectRoles,
    reducers: {
        getUserProjectRoles: state => {
            return UserProjectRoles({
                    isFetching: true
                }
            )
        },
        getUserProjectRolesSucceeded: (state, {payload:  {userProjectRoles, user}  }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });

            let projectRoles = [];
            for(const projectId in userProjectRoles){
                const roles = userProjectRoles[projectId].roles;
                const customRoles = roles.filter(r => !DATA_ROLES[r] && !ADMIN_ROLES[r]);
                let highestDataRole = roles.filter(r => DATA_ROLES[r]);
                const customAndDataAndAdminRoles = [...customRoles];
                if(highestDataRole.length > 0) {
                    highestDataRole = highestDataRole.reduce((prev, current) => {
                        return (DATA_ROLES[prev].order < DATA_ROLES[current].order) ? prev : current;
                    });
                    customAndDataAndAdminRoles.push(highestDataRole);
                }

                let highestAdminRole = roles.filter(r => ADMIN_ROLES[r]);
                if(highestAdminRole.length > 0) {
                    highestAdminRole = highestAdminRole.reduce((prev, current) => {
                        return (ADMIN_ROLES[prev].order < ADMIN_ROLES[current].order) ? prev : current;
                    });

                    if(highestAdminRole === ADMIN_ROLES.MANAGER.name) {
                        customAndDataAndAdminRoles.push(highestAdminRole);
                    }
                }

                projectRoles.push(UserProjectRole({
                    projectLabel: projectId,
                    roles: customAndDataAndAdminRoles,
                    createDate: userProjectRoles[projectId].createDate,
                }));
            }

            state.user = user;
            state.projectRoles = projectRoles;
        },
        getUserProjectRolesFailed:  (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getUserProjectRoles,
    getUserProjectRolesSucceeded,
    getUserProjectRolesFailed,
} = userProjectRolesSlice.actions


export default userProjectRolesSlice.reducer