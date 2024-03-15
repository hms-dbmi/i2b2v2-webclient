import {
    CLEAR_SELECTED_PROJECT_ACTION,
    GET_ALL_PROJECT_PARAMS_ACTION,
    SAVE_PROJECT_ACTION,
    SAVE_PROJECT_PARAM_ACTION,
    DELETE_PROJECT_PARAM_ACTION,
    GET_ALL_PROJECT_DATASOURCES_ACTION,
    GET_ALL_PROJECT_USERS_ACTION,
    GET_ALL_USER_PARAMS_ACTION,
    SAVE_PROJECT_DATASOURCES_ACTION,
    SAVE_PROJECT_USER_ACTION,
    DELETE_PROJECT_USER_ACTION,
    SAVE_PROJECT_USER_PARAM_ACTION,
    DELETE_PROJECT_USER_PARAM_ACTION,

} from "actions";
import { defaultState } from "defaultState";
import {
    SelectedProject,
    Param,
    ProjectDataSource,
    ProjectUser,
    SelectedUser,
    ParamStatusInfo,
    UserStatusInfo
} from "models";

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
                    projectPath: ds.projectPath,
                    cellURL: ds.cellURL
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
                    editorPath: user.editorPath
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

        case  SAVE_PROJECT_DATASOURCES_ACTION.SAVE_PROJECT_DATASOURCES_SUCCEEDED: {
            return SelectedProject({
                ...state,
                saveDSStatus: "SUCCESS"
            });
        }

        case  SAVE_PROJECT_DATASOURCES_ACTION.SAVE_PROJECT_DATASOURCES_FAILED: {

            console.log("reducer datasources failed");
            return SelectedProject({
                ...state,
                saveDSStatus: "FAIL"
            });
        }

        case  SAVE_PROJECT_DATASOURCES_ACTION.SAVE_PROJECT_DATASOURCES_STATUS_CONFIRMED: {

            return SelectedProject({
                ...state,
                saveDSStatus: null
            });
        }

        case  SAVE_PROJECT_USER_ACTION.SAVE_PROJECT_USER: {
            return SelectedProject({
                ...state,
                isFetching: true,
            });
        }

        case  SAVE_PROJECT_USER_ACTION.SAVE_PROJECT_USER_SUCCEEDED: {
            const  { selectedProject, projectUser }  = action.payload;

            const users = selectedProject.users.map((user) => (user.username === projectUser.username ? projectUser : user));

            return SelectedProject({
                ...state,
                users,
                isFetching: false,
                userStatus: UserStatusInfo({
                    status: "SAVE_SUCCESS",
                    username: projectUser.username
                })
            });
        }
        case  SAVE_PROJECT_USER_ACTION.SAVE_PROJECT_USER_FAILED: {
            const  {  projectUser }  = action.payload;

            return SelectedProject({
                ...state,
                isFetching: false,
                userStatus: UserStatusInfo({
                    status: "SAVE_FAIL",
                    username: projectUser.username
                })
            });
        }

        case  DELETE_PROJECT_USER_ACTION.DELETE_PROJECT_USER_STATUS_CONFIRMED: {
            return SelectedProject({
                ...state,
                userStatus: UserStatusInfo()
            });
        }

        case  DELETE_PROJECT_USER_ACTION.DELETE_PROJECT_USER_SUCCEEDED: {
            const  { selectedProject, projectUser }  = action.payload;

            const users = selectedProject.users.map((user) => (user.username === projectUser.username ? projectUser : user));

            return SelectedProject({
                ...state,
                users,
                isFetching: false,
                userStatus: UserStatusInfo({
                    status: "DELETE_SUCCESS",
                    username: projectUser.username
                })
            });
        }
        case  DELETE_PROJECT_USER_ACTION.DELETE_PROJECT_USER_FAILED: {
            const  {  projectUser }  = action.payload;

            return SelectedProject({
                ...state,
                isFetching: false,
                userStatus: UserStatusInfo({
                    status: "DELETE_FAIL",
                    username: projectUser.username
                })
            });
        }

        case  SAVE_PROJECT_USER_ACTION.SAVE_PROJECT_USER_STATUS_CONFIRMED: {
            return SelectedProject({
                ...state,
                userStatus: UserStatusInfo()
            });
        }

        case  SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM:
        case  SAVE_PROJECT_USER_PARAM_ACTION.SAVE_PROJECT_USER_PARAM: {
            return SelectedProject({
                ...state,
            });
        }

        case  SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM_SUCCEEDED:
        case  SAVE_PROJECT_USER_PARAM_ACTION.SAVE_PROJECT_USER_PARAM_SUCCEEDED: {
            const  { param }  = action.payload;

            return SelectedProject({
                ...state,
                paramStatus: ParamStatusInfo({
                    param,
                    status: "SAVE_SUCCESS"
                })
            });
        }

        case  SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM_FAILED:
        case  SAVE_PROJECT_USER_PARAM_ACTION.SAVE_PROJECT_USER_PARAM_FAILED: {
            return SelectedProject({
                ...state,
                paramStatus: ParamStatusInfo({
                    param,
                    status: "SAVE_FAIL"
                })
            });
        }

        case  SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM_STATUS_CONFIRMED:
        case  SAVE_PROJECT_USER_PARAM_ACTION.SAVE_PROJECT_USER_PARAM_STATUS_CONFIRMED: {
            return SelectedProject({
                ...state,
                paramStatus: ParamStatusInfo()
            });
        }

        case  DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM:
        case  DELETE_PROJECT_USER_PARAM_ACTION.DELETE_PROJECT_USER_PARAM: {
            return SelectedProject({
                ...state,
            });
        }

        case  DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM_SUCCEEDED:
        case  DELETE_PROJECT_USER_PARAM_ACTION.DELETE_PROJECT_USER_PARAM_SUCCEEDED: {
            const  { param }  = action.payload;

            return SelectedProject({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "DELETE_SUCCESS",
                    param
                })
            });
        }

        case  DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM_FAILED:
        case  DELETE_PROJECT_USER_PARAM_ACTION.DELETE_PROJECT_USER_PARAM_FAILED: {
            const  { param }  = action.payload;

            return SelectedProject({
                ...state,
                paramStatus: ParamStatusInfo({
                    status: "DELETE_FAIL",
                    param
                })
            });
        }

        case  DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM_STATUS_CONFIRMED:
        case  DELETE_PROJECT_USER_PARAM_ACTION.DELETE_PROJECT_USER_PARAM_STATUS_CONFIRMED: {
            return SelectedProject({
                ...state,
                paramStatus: ParamStatusInfo()
            });
        }

        case  CLEAR_SELECTED_PROJECT_ACTION.CLEAR_SELECTED_PROJECT: {
            return SelectedProject();
        }

        default: {
            return state;
        }
    }
};
