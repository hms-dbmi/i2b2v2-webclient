import {
    GET_ALL_PROJECT_PARAMS_ACTION,
    SAVE_PROJECT_ACTION,
    SAVE_PROJECT_PARAM_ACTION,
    DELETE_PROJECT_PARAM_ACTION,
    GET_ALL_PROJECT_DATASOURCES_ACTION,
    GET_ALL_PROJECT_USERS_ACTION, GET_ALL_USER_PARAMS_ACTION
} from "actions";
import { defaultState } from "defaultState";
import {SelectedProject, Param, ProjectDataSource, ProjectUser, SelectedUser} from "models";

export const editProjectReducer = (state = defaultState.selectedProject, action) => {
    switch (action.type) {
        case  GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS: {
            const  {project}  = action.payload;

            return SelectedProject({
                ...state,
                project,
                isFetchingParams: true,
            });
        }
        case  GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS_SUCCEEDED: {
            const  {project, params}  = action.payload;

            let paramsList = [];
            params.map((param) => {
                paramsList.push(Param({
                    id: param.id,
                    internalId: param.internalId,
                    name: param.name,
                    value:param.value,
                    dataType: param.dataType,
                }));
            })

            return SelectedProject({
                ...state,
                project,
                params: paramsList,
                isFetchingParams: false,
            });
        }
        case  GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS_FAILED: {
            return SelectedProject({
                ...state,
                isFetchingParams: false,
            });
        }

        case GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS_STATUS_CONFIRMED: {

            return SelectedUser({
                ...state,
                userParamStatus: null
            });
        }

        case  GET_ALL_PROJECT_DATASOURCES_ACTION.GET_ALL_PROJECT_DATASOURCES: {
            const  {project}  = action.payload;

            return SelectedProject({
                ...state,
                project,
                isFetchingDataSources: true,
            });
        }

        case  GET_ALL_PROJECT_DATASOURCES_ACTION.GET_ALL_PROJECT_DATASOURCES_SUCCEEDED: {
            const  { dataSources }  = action.payload;
            let dsList = {
                ...state.dataSources
            };

            dataSources.forEach((ds) => {
                dsList[ds.cellId] = ProjectDataSource({
                    name: ds.name,
                    dbSchema: ds.dbSchema,
                    jndiDataSource: ds.jndiDataSource,
                    dbServerType: ds.dbServerType,
                    ownerId: ds.ownerId,
                    projectPath: ds.projectPath
                });
            });

            return SelectedProject({
                ...state,
                dataSources: dsList,
                isFetchingDataSources: false,
            });
        }

        case  GET_ALL_PROJECT_USERS_ACTION.GET_ALL_PROJECT_USERS: {
            const  {project}  = action.payload;

            return SelectedProject({
                ...state,
                project,
                isFetchingUserRoles: true,
            });
        }

        case  GET_ALL_PROJECT_USERS_ACTION.GET_ALL_PROJECT_USERS_SUCCEEDED: {
            const  { users }  = action.payload;

            users.map((user) => {
                ProjectUser({
                    username: user.username,
                    adminPath: user.adminPath,
                    dataPath: user.dataPath,
                });
            });

            return SelectedProject({
                ...state,
                users,
                isFetchingUsers: false,
            });
        }

        case  GET_ALL_PROJECT_USERS_ACTION.GET_ALL_PROJECT_USERS_FAILED: {

            return SelectedProject({
                ...state,
                isFetchingUserRoles: false,
            });
        }

        case  SAVE_PROJECT_ACTION.SAVE_PROJECT_SUCCEEDED: {
            const  { project }  = action.payload;

            return SelectedProject({
                ...state,
                project,
                saveStatus: "SUCCESS"
            });
        }

        case  SAVE_PROJECT_ACTION.SAVE_PROJECT_FAILED: {

            return SelectedProject({
                ...state,
                saveStatus: "FAIL"
            });
        }

        case  SAVE_PROJECT_ACTION.SAVE_PROJECT_STATUS_CONFIRMED: {

            return SelectedProject({
                ...state,
                saveStatus: null
            });
        }

        default: {
            return state;
        }
    }
};
