import { createAction, createNamedArgsAction } from "../utilities";

export const I2B2_LIB_LOADED_ACTION = "I2B2_LIB_LOADED_ACTION";
export const i2b2LibLoaded =  createAction(I2B2_LIB_LOADED_ACTION);

// -- getUser -- //
export const GET_USER_ACTIONS = {
    GET_USER: "GET_USER",
    GET_USER_SUCCEEDED:  "GET_USER_SUCCEEDED",
    GET_USER_FAILED: "GET_USER_FAILED"
};
export const getUser =  createAction(GET_USER_ACTIONS.GET_USER);
export const getUserSucceeded = createNamedArgsAction(GET_USER_ACTIONS.GET_USER_SUCCEEDED);
export const getUserFailed = createNamedArgsAction(GET_USER_ACTIONS.GET_USER_FAILED);

//================================================================================================== //

export const GET_ALL_USERS_ACTION = {
    GET_ALL_USERS: "GET_ALL_USERS",
    GET_ALL_USERS_SUCCEEDED:  "GET_ALL_USERS_SUCCEEDED",
    GET_ALL_USERS_FAILED: "GET_ALL_USERS_FAILED"
};
export const getAllUsers =  createAction(GET_ALL_USERS_ACTION.GET_ALL_USERS);
export const getAllUsersSucceeded = createAction(GET_ALL_USERS_ACTION.GET_ALL_USERS_SUCCEEDED);
export const getAllUsersFailed = createNamedArgsAction(GET_ALL_USERS_ACTION.GET_ALL_USERS_FAILED);
//================================================================================================== //

export const DELETE_USER_ACTION = {
    DELETE_USER: "DELETE_USER",
    DELETE_USER_SUCCEEDED:  "DELETE_USER_SUCCEEDED",
    DELETE_USER_FAILED: "DELETE_USER_FAILED",
    DELETE_USER_STATUS_CONFIRMED:  "DELETE_USER_STATUS_CONFIRMED",
};
export const deleteUser =  createAction(DELETE_USER_ACTION.DELETE_USER);
export const deleteUserSucceeded = createAction(DELETE_USER_ACTION.DELETE_USER_SUCCEEDED);
export const deleteUserFailed = createNamedArgsAction(DELETE_USER_ACTION.DELETE_USER_FAILED, "username");
export const deleteUserStatusConfirmed = createAction(DELETE_USER_ACTION.DELETE_USER_STATUS_CONFIRMED);

//================================================================================================== //
export const GET_ALL_PROJECTS_ACTION = {
    GET_ALL_PROJECTS: "GET_ALL_PROJECTS",
    GET_ALL_PROJECTS_SUCCEEDED:  "GET_ALL_PROJECTS_SUCCEEDED",
    GET_ALL_PROJECTS_FAILED: "GET_ALL_PROJECTS_FAILED"
};
export const getAllProjects =  createAction(GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS);
export const getAllProjectsSucceeded = createAction(GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS_SUCCEEDED);
export const getAllProjectsFailed = createNamedArgsAction(GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS_FAILED);

//================================================================================================== //

export const GET_ALL_HIVES_ACTION = {
    GET_ALL_HIVES: "GET_ALL_HIVES",
    GET_ALL_HIVES_SUCCEEDED:  "GET_ALL_HIVES_SUCCEEDED",
    GET_ALL_HIVES_FAILED: "GET_ALL_HIVES_FAILED"
};
export const getAllHives =  createAction(GET_ALL_HIVES_ACTION.GET_ALL_HIVES);
export const getAllHivesSucceeded = createAction(GET_ALL_HIVES_ACTION.GET_ALL_HIVES_SUCCEEDED);
export const getAllHivesFailed = createNamedArgsAction(GET_ALL_HIVES_ACTION.GET_ALL_HIVES_FAILED);

//================================================================================================== //

export const GET_ALL_USER_PARAMS_ACTION = {
    GET_ALL_USER_PARAMS: "GET_ALL_USER_PARAMS",
    GET_ALL_USER_PARAMS_SUCCEEDED:  "GET_ALL_USER_PARAMS_SUCCEEDED",
    GET_ALL_USER_PARAMS_FAILED: "GET_ALL_USER_PARAMS_FAILED",
    GET_ALL_USER_PARAMS_STATUS_CONFIRMED: "GET_ALL_USER_PARAMS_STATUS_CONFIRMED"
};
export const getAllUserParams =  createAction(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS);
export const getAllUserParamsSucceeded = createAction(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_SUCCEEDED);
export const getAllUserParamsFailed = createNamedArgsAction(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_FAILED);
export const getAllUserParamsStatusConfirmed = createAction(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_STATUS_CONFIRMED);
//================================================================================================== //

export const SAVE_USER_ACTION = {
    SAVE_USER: "SAVE_USER_DETAILS",
    SAVE_USER_SUCCEEDED:  "SAVE_USER_SUCCEEDED",
    SAVE_USER_FAILED: "SAVE_USER_FAILED",
    SAVE_USER_STATUS_CONFIRMED: "SAVE_USER_STATUS_CONFIRMED"
};
export const saveUser =  createAction(SAVE_USER_ACTION.SAVE_USER);
export const saveUserSucceeded = createAction(SAVE_USER_ACTION.SAVE_USER_SUCCEEDED);
export const saveUserFailed = createNamedArgsAction(SAVE_USER_ACTION.SAVE_USER_FAILED);
export const saveUserStatusConfirmed = createAction(SAVE_USER_ACTION.SAVE_USER_STATUS_CONFIRMED);

//================================================================================================== //

export const SAVE_USER_PARAM_ACTION = {
    SAVE_USER_PARAM: "SAVE_USER_PARAM",
    SAVE_USER_PARAM_SUCCEEDED:  "SAVE_USER_PARAM_SUCCEEDED",
    SAVE_USER_PARAM_FAILED: "SAVE_USER_PARAM_FAILED",
    SAVE_USER_PARAM_STATUS_CONFIRMED: "SAVE_USER_PARAM_STATUS_CONFIRMED"
};
export const saveUserParam =  createAction(SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM);
export const saveUserParamSucceeded = createAction(SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_SUCCEEDED);
export const saveUserParamFailed = createNamedArgsAction(SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_FAILED);
export const saveUserParamStatusConfirmed = createAction(SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM_STATUS_CONFIRMED);
//================================================================================================== //

export const DELETE_USER_PARAM_ACTION = {
    DELETE_USER_PARAM: "DELETE_USER_PARAM",
    DELETE_USER_PARAM_SUCCEEDED:  "DELETE_USER_PARAM_SUCCEEDED",
    DELETE_USER_PARAM_FAILED: "DELETE_USER_PARAM_FAILED",
    DELETE_USER_PARAM_STATUS_CONFIRMED: "DELETE_USER_PARAM_STATUS_CONFIRMED"
};
export const deleteUserParam =  createAction(DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM);
export const deleteUserParamSucceeded = createAction(DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_SUCCEEDED);
export const deleteUserParamFailed = createNamedArgsAction(DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_FAILED);
export const deleteUserParamStatusConfirmed = createAction(DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM_STATUS_CONFIRMED);

//================================================================================================== //
export const DELETE_PROJECT_ACTION = {
    DELETE_PROJECT: "DELETE_PROJECT",
    DELETE_PROJECT_SUCCEEDED:  "DELETE_PROJECT_SUCCEEDED",
    DELETE_PROJECT_FAILED: "DELETE_PROJECT_FAILED",
    DELETE_PROJECT_STATUS_CONFIRMED:  "DELETE_PROJECT_STATUS_CONFIRMED",
};
export const deleteProject =  createAction(DELETE_PROJECT_ACTION.DELETE_PROJECT);
export const deleteProjectSucceeded = createAction(DELETE_PROJECT_ACTION.DELETE_PROJECT_SUCCEEDED);
export const deleteProjectFailed = createNamedArgsAction(DELETE_PROJECT_ACTION.DELETE_PROJECT_FAILED, "projectName");
export const deleteProjectStatusConfirmed = createAction(DELETE_PROJECT_ACTION.DELETE_PROJECT_STATUS_CONFIRMED);

//================================================================================================== //
export const SAVE_HIVE_DOMAIN_ACTION = {
    SAVE_HIVE_DOMAIN: "SAVE_HIVE_DOMAIN",
    SAVE_HIVE_DOMAIN_SUCCEEDED:  "SAVE_HIVE_DOMAIN_SUCCEEDED",
    SAVE_HIVE_DOMAIN_FAILED: "SAVE_HIVE_DOMAIN_FAILED",
    SAVE_HIVE_DOMAIN_STATUS_CONFIRMED: "SAVE_HIVE_DOMAIN_STATUS_CONFIRMED"
};
export const saveHiveDomain =  createAction(SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN);
export const saveHiveDomainSucceeded = createAction(SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN_SUCCEEDED);
export const saveHiveDomainFailed = createNamedArgsAction(SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN_FAILED);
export const saveHiveDomainStatusConfirmed = createAction(SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN_STATUS_CONFIRMED);

//================================================================================================== //
export const GET_ALL_GLOBAL_PARAMS_ACTION = {
    GET_ALL_GLOBAL_PARAMS: "GET_ALL_GLOBAL_PARAMS",
    GET_ALL_GLOBAL_PARAMS_SUCCEEDED:  "GET_ALL_GLOBAL_PARAMS_SUCCEEDED",
    GET_ALL_GLOBAL_PARAMS_FAILED: "GET_ALL_GLOBAL_PARAMS_FAILED",
    GET_ALL_GLOBAL_PARAMS_STATUS_CONFIRMED: "GET_ALL_GLOBAL_PARAMS_STATUS_CONFIRMED"
};
export const getAllGlobalParams =  createAction(GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS);
export const getAllGlobalParamsSucceeded = createAction(GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS_SUCCEEDED);
export const getAllGlobalParamsFailed = createNamedArgsAction(GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS_FAILED);
export const getAllGlobalParamsStatusConfirmed = createAction(GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS_STATUS_CONFIRMED);
//================================================================================================== //
export const SAVE_GLOBAL_PARAM_ACTION = {
    SAVE_GLOBAL_PARAM: "SAVE_GLOBAL_PARAM",
    SAVE_GLOBAL_PARAM_SUCCEEDED:  "SAVE_GLOBAL_PARAM_SUCCEEDED",
    SAVE_GLOBAL_PARAM_FAILED: "SAVE_GLOBAL_PARAM_FAILED",
    SAVE_GLOBAL_PARAM_STATUS_CONFIRMED: "SAVE_GLOBAL_PARAM_STATUS_CONFIRMED"
};
export const saveGlobalParam =  createAction(SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM);
export const saveGlobalParamSucceeded = createAction(SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM_SUCCEEDED);
export const saveGlobalParamFailed = createNamedArgsAction(SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM_FAILED);
export const saveGlobalParamStatusConfirmed = createAction(SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM_STATUS_CONFIRMED);
//================================================================================================== //
export const DELETE_GLOBAL_PARAM_ACTION = {
    DELETE_GLOBAL_PARAM: "DELETE_GLOBAL_PARAM",
    DELETE_GLOBAL_PARAM_SUCCEEDED:  "DELETE_GLOBAL_PARAM_SUCCEEDED",
    DELETE_GLOBAL_PARAM_FAILED: "DELETE_GLOBAL_PARAM_FAILED",
    DELETE_GLOBAL_PARAM_STATUS_CONFIRMED: "DELETE_GLOBAL_PARAM_STATUS_CONFIRMED"
};
export const deleteGlobalParam =  createAction(DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM);
export const deleteGlobalParamSucceeded = createAction(DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM_SUCCEEDED);
export const deleteGlobalParamFailed = createNamedArgsAction(DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM_FAILED);
export const deleteGlobalParamStatusConfirmed = createAction(DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM_STATUS_CONFIRMED);
//================================================================================================== //
export const SAVE_PROJECT_ACTION = {
    SAVE_PROJECT: "SAVE_PROJECT",
    SAVE_PROJECT_SUCCEEDED:  "SAVE_PROJECT_SUCCEEDED",
    SAVE_PROJECT_FAILED: "SAVE_PROJECT_FAILED",
    SAVE_PROJECT_STATUS_CONFIRMED: "SAVE_PROJECT_STATUS_CONFIRMED"
};
export const saveProject =  createAction(SAVE_PROJECT_ACTION.SAVE_PROJECT);
export const saveProjectSucceeded = createAction(SAVE_PROJECT_ACTION.SAVE_PROJECT_SUCCEEDED);
export const saveProjectFailed = createNamedArgsAction(SAVE_PROJECT_ACTION.SAVE_PROJECT_FAILED);
export const saveProjectStatusConfirmed = createAction(SAVE_PROJECT_ACTION.SAVE_PROJECT_STATUS_CONFIRMED);
//================================================================================================== //
export const GET_ALL_PROJECT_PARAMS_ACTION = {
    GET_ALL_PROJECT_PARAMS: "GET_ALL_PROJECT_PARAMS",
    GET_ALL_PROJECT_PARAMS_SUCCEEDED:  "GET_ALL_PROJECT_PARAMS_SUCCEEDED",
    GET_ALL_PROJECT_PARAMS_FAILED: "GET_ALL_PROJECT_PARAMS_FAILED",
    GET_ALL_PROJECT_PARAMS_STATUS_CONFIRMED: "GET_ALL_PROJECT_PARAMS_STATUS_CONFIRMED"
};
export const getAllProjectParams =  createAction(GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS);
export const getAllProjectParamsSucceeded = createAction(GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS_SUCCEEDED);
export const getAllProjectParamsFailed = createNamedArgsAction(GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS_FAILED);
export const getAllProjectParamsStatusConfirmed = createAction(GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS_STATUS_CONFIRMED);
//================================================================================================== //

export const SAVE_PROJECT_PARAM_ACTION = {
    SAVE_PROJECT_PARAM: "SAVE_PROJECT_PARAM",
    SAVE_PROJECT_PARAM_SUCCEEDED:  "SAVE_PROJECT_PARAM_SUCCEEDED",
    SAVE_PROJECT_PARAM_FAILED: "SAVE_PROJECT_PARAM_FAILED",
    SAVE_PROJECT_PARAM_STATUS_CONFIRMED: "SAVE_PROJECT_PARAM_STATUS_CONFIRMED"
};
export const saveProjectParam =  createAction(SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM);
export const saveProjectParamSucceeded = createAction(SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM_SUCCEEDED);
export const saveProjectParamFailed = createNamedArgsAction(SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM_FAILED);
export const saveProjectParamStatusConfirmed = createAction(SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM_STATUS_CONFIRMED);
//================================================================================================== //
export const DELETE_PROJECT_PARAM_ACTION = {
    DELETE_PROJECT_PARAM: "DELETE_PROJECT_PARAM",
    DELETE_PROJECT_PARAM_SUCCEEDED:  "DELETE_PROJECT_PARAM_SUCCEEDED",
    DELETE_PROJECT_PARAM_FAILED: "DELETE_PROJECT_PARAM_FAILED",
    DELETE_PROJECT_PARAM_STATUS_CONFIRMED: "DELETE_PROJECT_PARAM_STATUS_CONFIRMED"
};
export const deleteProjectParam =  createAction(DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM);
export const deleteProjectParamSucceeded = createAction(DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM_SUCCEEDED);
export const deleteProjectParamFailed = createNamedArgsAction(DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM_FAILED);
export const deleteProjectParamStatusConfirmed = createAction(DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM_STATUS_CONFIRMED);
//================================================================================================== //
export const GET_ALL_PROJECT_DATASOURCES_ACTION = {
    GET_ALL_PROJECT_DATASOURCES: "GET_ALL_PROJECT_DATASOURCES",
    GET_ALL_PROJECT_DATASOURCES_SUCCEEDED:  "GET_ALL_PROJECT_DATASOURCES_SUCCEEDED",
    GET_ALL_PROJECT_DATASOURCES_FAILED: "GET_ALL_PROJECT_DATASOURCES_FAILED",
};
export const getAllProjectDataSources =  createNamedArgsAction(GET_ALL_PROJECT_DATASOURCES_ACTION.GET_ALL_PROJECT_DATASOURCES, "project");
export const getAllProjectDataSourcesSucceeded = createAction(GET_ALL_PROJECT_DATASOURCES_ACTION.GET_ALL_PROJECT_DATASOURCES_SUCCEEDED);
export const getAllProjectDataSourcesFailed = createNamedArgsAction(GET_ALL_PROJECT_DATASOURCES_ACTION.GET_ALL_PROJECT_DATASOURCES_FAILED);
//================================================================================================== //
export const GET_ALL_PROJECT_USERS_ACTION = {
    GET_ALL_PROJECT_USERS: "GET_ALL_PROJECT_USERS",
    GET_ALL_PROJECT_USERS_SUCCEEDED:  "GET_ALL_PROJECT_USERS_SUCCEEDED",
    GET_ALL_PROJECT_USERS_FAILED: "GET_ALL_PROJECT_USERS_FAILED",
};
export const getAllProjectUsers =  createNamedArgsAction(GET_ALL_PROJECT_USERS_ACTION.GET_ALL_PROJECT_USERS, "project");
export const getAllProjectUsersSucceeded = createAction(GET_ALL_PROJECT_USERS_ACTION.GET_ALL_PROJECT_USERS_SUCCEEDED);
export const getAllProjectUsersFailed = createNamedArgsAction(GET_ALL_PROJECT_USERS_ACTION.GET_ALL_PROJECT_USERS_FAILED);



