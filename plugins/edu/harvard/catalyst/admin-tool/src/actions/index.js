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
    GET_ALL_USER_PARAMS_FAILED: "GET_ALL_USER_PARAMS_FAILED"
};
export const getAllUserParams =  createAction(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS);
export const getAllUserParamsSucceeded = createAction(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_SUCCEEDED);
export const getAllUserParamsFailed = createNamedArgsAction(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS_FAILED);
//================================================================================================== //

export const SAVE_USER_DETAILS_ACTION = {
    SAVE_USER_DETAILS: "SAVE_USER_DETAILS",
    SAVE_USER_DETAILS_SUCCEEDED:  "SAVE_USER_DETAILS_SUCCEEDED",
    SAVE_USER_DETAILS_FAILED: "SAVE_USER_DETAILS_FAILED",
    SAVE_USER_DETAILS_STATUS_CONFIRMED: "SAVE_USER_DETAILS_STATUS_CONFIRMED"
};
export const saveUserDetails =  createAction(SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS);
export const saveUserDetailsSucceeded = createAction(SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS_SUCCEEDED);
export const saveUserDetailsFailed = createNamedArgsAction(SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS_FAILED);
export const saveUserDetailsStatusConfirmed = createAction(SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS_STATUS_CONFIRMED);



