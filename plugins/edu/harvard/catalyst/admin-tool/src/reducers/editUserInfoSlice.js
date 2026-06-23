import { createSlice } from '@reduxjs/toolkit'
import {
    EDIT_USER,
} from "../actions";
import { defaultState } from "../defaultState";
import {
    AUTHENTICATION_METHODS,
    Param,
    ParamStatus, ParamStatusInfo,
    SelectedUser,
} from "../models";

export const editUserInfoSlice = createSlice({
    name: EDIT_USER,
    initialState: defaultState.selectedUser,
    reducers: {
        getAllUserParams: (state, {payload:  {user}  }) => {
            state.user = user;
            state.isFetching = true;
            state.allUserParamStatus = null;
        },
        getAllUserParamsSucceeded: (state, {payload:  {user, params}  }) => {
            const updateUser = {
                ...user,
                authMethod: AUTHENTICATION_METHODS.I2B2.value
            };

            //Extract each user param data into Param model and return an array of Params
            let paramsList = [];
            params.map((param) => {
                paramsList.push(Param({
                    id: param.id,
                    internalId: param.internalId,
                    name: param.name,
                    value:param.value,
                    dataType: param.dataType,
                    status: param.status
                }));
                if(param.name === "authentication_method" && param.status === ParamStatus.A){
                    if(param.value === AUTHENTICATION_METHODS.LDAP.value) {
                        updateUser.authMethod = AUTHENTICATION_METHODS.LDAP.value;
                    }
                    if(param.value === AUTHENTICATION_METHODS.SAML.value) {
                        updateUser.authMethod = AUTHENTICATION_METHODS.SAML.value;
                    }
                    if(param.value === AUTHENTICATION_METHODS.OKTA.value) {
                        updateUser.authMethod = AUTHENTICATION_METHODS.OKTA.value;
                    }
                    if(param.value === AUTHENTICATION_METHODS.NTLM.value) {
                        updateUser.authMethod = AUTHENTICATION_METHODS.NTLM.value;
                    }
                    if(param.value === AUTHENTICATION_METHODS.NTLM2.value) {
                        updateUser.authMethod = AUTHENTICATION_METHODS.NTLM2.value;
                    }
                }
            })

            state.user = updateUser;
            state.params = paramsList;
            state.isFetching = false;
            state.allUserParamStatus = 'SUCCESS';
        },
        getAllUserParamsFailed: state => {
            state.isFetching = false;
            state.allUserParamStatus= 'FAIL';
        },
        getAllUserParamsStatusConfirmed: state => {
            state.allUserParamStatus= null;
        },
        saveUser: state => {
            return state;
        },
        saveUserSucceeded: (state, {payload:  {user}  }) => {
            state.user = user;
            state.saveStatus= "SUCCESS";
        },
        saveUserFailed: state => {
            state.saveStatus= "FAIL"
        },
        saveUserStatusConfirmed: state => {
            state.saveStatus= null;
        },
        saveUserParam: state => {
            return state;
        },
        saveUserParamSucceeded: (state, {payload:  {param}  }) => {
            state.paramStatus= ParamStatusInfo({
                status: "SAVE_SUCCESS",
                param
            })
        },
        saveUserParamFailed:  (state, {payload:  {param}  }) => {
            state.paramStatus= ParamStatusInfo({
                status: "SAVE_FAIL",
                param
            })
        },
        saveUserParamStatusConfirmed: state => {
            state.paramStatus= ParamStatusInfo();
        },
        deleteUserParam: state => {
            return state;
        },
        deleteUserParamSucceeded: (state, {payload:  {user, param}  }) => {
            let newParams = [
                ...state.params
            ];
            newParams = newParams.filter((pm) => pm.id  !== param.id);
            //reset the row ids which are based on index
            newParams.forEach((pm, index) => {
                pm.id = index;
            });

            state.params = newParams;
            state.paramStatus= ParamStatusInfo({
                status: "DELETE_SUCCESS",
                param
            })
        },
        deleteUserParamFailed:  (state, {payload:  {param}  }) => {
            state.paramStatus= ParamStatusInfo({
                status: "DELETE_FAIL",
                param
            });
        },
        deleteUserParamStatusConfirmed: state => {
            state.paramStatus= ParamStatusInfo();
        },
        getAllProjectUserParams: (state, {payload:  {user}  }) => {
            state.user = user;
            state.isFetching = true;
            state.allUserParamStatus = null
        },
        getAllProjectUserParamsSucceeded: (state, {payload:  {user, params}  }) => {
            //Extract each user param data into Param model and return an array of Params
            let paramsList = [];
            params.map((param) => {
                paramsList.push(Param({
                    id: param.id,
                    internalId: param.internalId,
                    name: param.name,
                    value:param.value,
                    dataType: param.dataType,
                    status: param.status
                }));
            })

            state.user = user;
            state.params= paramsList;
            state.isFetching= false;
            state.allUserParamStatus= "SUCCESS";
        },
        getAllProjectUserParamsFailed: state => {
            state.isFetching= false;
            state.allUserParamStatus= "FAIL";
        },
        getAllProjectUserParamsStatusConfirmed: state => {
            state.allUserParamStatus= null;
        },
        clearSelectedUser : state => {
            return SelectedUser();
        }
    }
});

export const {
    getAllUserParams,
    getAllUserParamsSucceeded,
    getAllUserParamsFailed,
    getAllUserParamsStatusConfirmed,
    saveUser,
    saveUserSucceeded,
    saveUserFailed,
    saveUserStatusConfirmed,
    saveUserParam,
    saveUserParamSucceeded,
    saveUserParamFailed,
    saveUserParamStatusConfirmed,
    deleteUserParam,
    deleteUserParamSucceeded,
    deleteUserParamFailed,
    deleteUserParamStatusConfirmed,
    getAllProjectUserParams,
    getAllProjectUserParamsSucceeded,
    getAllProjectUserParamsFailed,
    getAllProjectUserParamsStatusConfirmed,
    clearSelectedUser
} = editUserInfoSlice.actions


export default editUserInfoSlice.reducer