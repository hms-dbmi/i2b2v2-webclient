import { createNamedArgsAction } from "../utilities";

// -- getUser -- //
export const GET_USER_ACTIONS = {
    GET_USER: "GET_USER",
    GET_USER_SUCCEEDED:  "GET_USER_SUCCEEDED",
    GET_USER_FAILED: "GET_USER_FAILED"
};
export const getUser =  createNamedArgsAction(GET_USER_ACTIONS.GET_USER);
export const getUserSucceeded = createNamedArgsAction(GET_USER_ACTIONS.GET_USER_SUCCEEDED);
export const getUserFailed = createNamedArgsAction(GET_USER_ACTIONS.GET_USER_FAILED);

export const GET_ALL_USERS_ACTION = {
    GET_ALL_USERS: "GET_ALL_USERS",
    GET_ALL_USERS_SUCCEEDED:  "GET_ALL_USERS_SUCCEEDED",
    GET_ALL_USERS_FAILED: "GET_ALL_USERS_FAILED"
};
export const getAllUsers =  createNamedArgsAction(GET_ALL_USERS_ACTION.GET_ALL_USERS);
export const getAllUsersSucceeded = createNamedArgsAction(GET_ALL_USERS_ACTION.GET_ALL_USERS_SUCCEEDED);
export const getAllUsersFailed = createNamedArgsAction(GET_ALL_USERS_ACTION.GET_ALL_USERS_FAILED);

export const I2B2_LIB_LOADED_ACTION = "I2B2_LIB_LOADED_ACTION";
export const i2b2LibLoaded =  createNamedArgsAction(I2B2_LIB_LOADED_ACTION);
