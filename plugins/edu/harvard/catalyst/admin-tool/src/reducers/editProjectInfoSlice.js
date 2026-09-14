import { createSlice } from '@reduxjs/toolkit'
import {
    EDIT_PROJECT,
} from "../actions";
import { defaultState } from "../defaultState";
import {
    Param, ParamStatusInfo,
    ProjectDataSource,
    ProjectUser, SelectedProject,
    UserStatusInfo
} from "../models";

export const editProjectInfoSlice = createSlice({
    name: EDIT_PROJECT,
    initialState: defaultState.selectedProject,
    reducers: {
        getAllProjectParams: (state, {payload: {project}}) => {
            state.allParamStatus = null;
            state.isFetchingParams = true;
            state.project = project;
        },
        getAllProjectParamsSucceeded: (state, {payload: {project, params}}) => {
            let paramsList = [];

            params.map((param) => {
                paramsList.push(Param({
                    id: param.id,
                    internalId: param.internalId,
                    name: param.name,
                    value: param.value,
                    dataType: param.dataType,
                    status: param.status
                }));
            });

            state.project = project;
            state.params = paramsList;
            state.isFetchingParams = false;
            state.allParamStatus = "SUCCESS";
        },
        getAllProjectParamsFailed: state => {
            state.isFetchingParams = false;
            state.allParamStatus = "FAIL";
        },
        getAllProjectParamsStatusConfirmed: state => {
            state.allParamStatus = null;
        },
        getAllProjectDataSources: (state, {payload: {project}}) => {
            let dsList = {
                CRC: ProjectDataSource(),
                ONT: ProjectDataSource(),
                WORK: ProjectDataSource(),
            };

            state.project = project;
            state.dataSources = dsList;
            state.isFetchingDataSources = true;
        },
        getAllProjectDataSourcesSucceeded: (state, {payload: {dataSources}}) => {
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

            state.dataSources = dsList;
            state.isFetchingDataSources = false;
        },
        getAllProjectDataSourcesFailed: state => {
            let dsList = {
                ...state.dataSources
            };

            state.dataSources = dsList;
            state.isFetchingDataSources = false;
        },
        updateAllProjectDataSourcesUrl: (state, {payload: {dataSources}}) => {
            let dsList = {
                ...state.dataSources
            };

            dataSources.forEach((ds) => {
                dsList[ds.id] = ProjectDataSource({
                    ...dsList[ds.id],
                    cellURL: ds.url
                });
            });

            state.dataSources = dsList;
        },
        getAllProjectUsers: (state, {payload: {project}}) => {
            state.users= [];
            state.project = project;
            state.isFetchingUsers= true;
        },
        getAllProjectUsersSucceeded: (state, {payload: {project, users}}) => {
            let customRoles = [];
            users.map((user) => {
                ProjectUser({
                    username: user.username,
                    adminPath: user.adminPath,
                    dataPath: user.dataPath,
                    editorPath: user.editorPath,
                    customRoles: user.customRoles
                });

                customRoles =[...customRoles, ...user.customRoles];
            });

            state.users = users;
            state.customRoles= [...new Set(customRoles)];
            state.isFetchingUsers= false;
        },
        getAllProjectUsersFailed: state => {
            state.isFetchingUsers= false;
        },
        saveProject: state => {},
        saveProjectSucceeded: (state, {payload: {project}}) => {
            state.project = project;
            state.saveStatus= "SUCCESS";
        },
        saveProjectFailed: state => {
            state.saveStatus= "FAIL";
        },
        saveProjectStatusConfirmed: state => {
            state.saveStatus= null;
        },
        saveProjectDataSources: state => {},
        saveProjectDataSourcesSucceeded: state => {
            state.saveDSStatus= "SUCCESS"
        },
        saveProjectDataSourcesFailed: state => {
            state.saveDSStatus= "FAIL";
        },
        saveProjectDataSourcesStatusConfirmed : state => {
            state.saveDSStatus= null;
        },
        saveProjectUser: state => {
            state.isFetching= true;
        },
        saveProjectUserSucceeded: (state, {payload: {selectedProject, projectUser, newCustomRoles}}) => {
            const existingUser = selectedProject.users.filter((user) => user.username === projectUser.username).length > 0;
            let users = [...selectedProject.users];

            if (existingUser) {
                users.map((user) => (user.username === projectUser.username ? projectUser : user));
            } else {
                users.push(projectUser);
            }

            let customRoles = state.customRoles;
            if (newCustomRoles){
                customRoles = [...customRoles, ...newCustomRoles];
            }

            state.users = users;
            state.customRoles = customRoles;
            state.isFetching= false;
            state.userStatus= UserStatusInfo({
                status: "SAVE_SUCCESS",
                username: projectUser.username
            });
        },
        saveProjectUserFailed:  (state, {payload: {projectUser}}) => {
           state.isFetching= false;
            state.userStatus= UserStatusInfo({
                status: "SAVE_FAIL",
                username: projectUser.username
            });
        },
        saveProjectUserStatusConfirmed:  state => {
            state.userStatus= UserStatusInfo();
        },
        deleteProjectUser:  state => {},
        deleteProjectUserSucceeded:  (state, {payload: {selectedProject, projectUser}}) => {
            state.users = selectedProject.users.map((user) => (user.username === projectUser.username ? projectUser : user));
            state.isFetching= false;
            state.userStatus= UserStatusInfo({
                status: "DELETE_SUCCESS",
                username: projectUser.username
            });
        },
        deleteProjectUserFailed:  (state, {payload: {projectUser}}) => {
            state.isFetching= false;
            state.userStatus= UserStatusInfo({
                status: "DELETE_FAIL",
                username: projectUser.username
            });
        },
        deleteProjectUserStatusConfirmed:  state => {
            state.userStatus= UserStatusInfo();
        },
        saveProjectParam:  state => {},
        saveProjectParamSucceeded:  (state, {payload: {param}}) => {
            state.paramStatus = ParamStatusInfo({
                param,
                status: "SAVE_SUCCESS"
            });
        },
        saveProjectParamFailed:  (state, {payload: {param}}) => {
            state.paramStatus= ParamStatusInfo({
                param,
                status: "SAVE_FAIL"
            });
        },
        saveProjectParamStatusConfirmed:  state => {
            state.paramStatus= ParamStatusInfo();
        },
        saveProjectUserParam:  state => {},
        saveProjectUserParamSucceeded:  (state, {payload: {param}}) => {
            state.paramStatus = ParamStatusInfo({
                param,
                status: "SAVE_SUCCESS"
            });
        },
        saveProjectUserParamFailed:  (state, {payload: {param}}) => {
            state.paramStatus= ParamStatusInfo({
                param,
                status: "SAVE_FAIL"
            });
        },
        saveProjectUserParamStatusConfirmed:  state => {
            state.paramStatus= ParamStatusInfo();
        },
        deleteProjectParam:  state => {},
        deleteProjectParamSucceeded:  (state, {payload: {param}}) => {
            state.paramStatus= ParamStatusInfo({
                status: "DELETE_SUCCESS",
                param
            });
        },
        deleteProjectParamFailed:  (state, {payload: {param}}) => {
            state.paramStatus= ParamStatusInfo({
                status: "DELETE_FAIL",
                param
            });
        },
        deleteProjectParamStatusConfirmed:  state => {
            state.paramStatus= ParamStatusInfo();
        },

        deleteProjectUserParam:  state => {},
        deleteProjectUserParamSucceeded:  (state, {payload: {param}}) => {
            state.paramStatus= ParamStatusInfo({
                status: "DELETE_SUCCESS",
                param
            });
        },
        deleteProjectUserParamFailed:  (state, {payload: {param}}) => {
            state.paramStatus= ParamStatusInfo({
                status: "DELETE_FAIL",
                param
            });
        },
        deleteProjectUserParamStatusConfirmed:  state => {
            state.paramStatus= ParamStatusInfo();
        },

        clearSelectedProject: state => {
            return SelectedProject();
        }
    }
})

export const {
    getAllProjectParams,
    getAllProjectParamsSucceeded,
    getAllProjectParamsFailed,
    getAllProjectParamsStatusConfirmed,
    getAllProjectDataSources,
    getAllProjectDataSourcesSucceeded,
    getAllProjectDataSourcesFailed,
    updateAllProjectDataSourcesUrl,
    getAllProjectUsers,
    getAllProjectUsersSucceeded,
    getAllProjectUsersFailed,
    saveProject,
    saveProjectFailed,
    saveProjectSucceeded,
    saveProjectStatusConfirmed,
    saveProjectDataSources,
    saveProjectDataSourcesSucceeded,
    saveProjectDataSourcesFailed,
    saveProjectDataSourcesStatusConfirmed,
    saveProjectUser,
    saveProjectUserSucceeded,
    saveProjectUserFailed,
    saveProjectUserStatusConfirmed,
    deleteProjectUser,
    deleteProjectUserSucceeded,
    deleteProjectUserFailed,
    deleteProjectUserStatusConfirmed,
    saveProjectParam,
    saveProjectParamSucceeded,
    saveProjectParamFailed,
    saveProjectParamStatusConfirmed,
    saveProjectUserParam,
    saveProjectUserParamSucceeded,
    saveProjectUserParamFailed,
    saveProjectUserParamStatusConfirmed,
    deleteProjectParam,
    deleteProjectParamSucceeded,
    deleteProjectParamFailed,
    deleteProjectParamStatusConfirmed,
    deleteProjectUserParam,
    deleteProjectUserParamSucceeded,
    deleteProjectUserParamFailed,
    deleteProjectUserParamStatusConfirmed,
    clearSelectedProject
} = editProjectInfoSlice.actions


export default editProjectInfoSlice.reducer