import { createAction, createNamedArgsAction } from "../utilities";

export const I2B2_LIB_LOADED_ACTION = "I2B2_LIB_LOADED_ACTION";
export const i2b2LibLoaded =  createAction(I2B2_LIB_LOADED_ACTION);

// -- getUser -- //
export const GET_USER_ACTIONS = {
    GET_USER: "GET_USER",
    GET_USER_SUCCEEDED:  "GET_USER_SUCCEEDED",
    GET_USER_FAILED: "GET_USER_FAILED"
};
export const getUser =  createNamedArgsAction(GET_USER_ACTIONS.GET_USER);
export const getUserSucceeded = createAction(GET_USER_ACTIONS.GET_USER_SUCCEEDED);
export const getUserFailed = createNamedArgsAction(GET_USER_ACTIONS.GET_USER_FAILED);

export const GET_ALL_USERS_ACTION = {
    GET_ALL_USERS: "GET_ALL_USERS",
    GET_ALL_USERS_SUCCEEDED:  "GET_ALL_USERS_SUCCEEDED",
    GET_ALL_USERS_FAILED: "GET_ALL_USERS_FAILED"
};
export const getAllUsers =  createNamedArgsAction(GET_ALL_USERS_ACTION.GET_ALL_USERS);
export const getAllUsersSucceeded = createAction(GET_ALL_USERS_ACTION.GET_ALL_USERS_SUCCEEDED);
export const getAllUsersFailed = createNamedArgsAction(GET_ALL_USERS_ACTION.GET_ALL_USERS_FAILED);

export const GET_ALL_PROJECTS_ACTION = {
    GET_ALL_PROJECTS: "GET_ALL_PROJECTS",
    GET_ALL_PROJECTS_SUCCEEDED:  "GET_ALL_PROJECTS_SUCCEEDED",
    GET_ALL_PROJECTS_FAILED: "GET_ALL_PROJECTS_FAILED"
};
export const getAllProjects =  createNamedArgsAction(GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS);
export const getAllProjectsSucceeded = createAction(GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS_SUCCEEDED);
export const getAllProjectsFailed = createNamedArgsAction(GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS_FAILED);

