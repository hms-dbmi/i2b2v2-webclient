import {call, takeLatest, put, all} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';

import {
    getAllUsers,
} from "../reducers/allUsersSlice";

import {AUTHENTICATION_METHODS} from "../models";
import {saveParamRequest} from "./saveUserParamSaga";
import {deleteParamRequest} from "./deleteUserParamSaga";
import {SAVE_USER} from "../actions";
import {getAllUserParams, saveUserFailed, saveUserSucceeded} from "../reducers/editUserInfoSlice";


//a function that returns a promise
const saveUserRequest = (user) => {
    let data = {
        user_name:user.username,
        full_name: user.fullname,
        email: user.email,
        is_admin: user.isAdmin,
    };

    if(user.password !== null && user.password !== undefined){
        data.password = "<password>"+user.password+"</password>";
    }
    return i2b2.ajax.PM.setUser(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};


const getAllUserAuthConfigParams = (user, authConfig) => {
    const authParamsList = [];

    const authParams = {
        name: "authentication_method",
        value: authConfig.method,
        dataType: "TEXT",
        status: "A"
    };

    authParamsList.push(authParams);

    if(authConfig.method === AUTHENTICATION_METHODS.LDAP.value){
        if(authConfig.authConfigOptions.connection_url) {
            const connectionUrlOption = {
                name: "connection_url",
                value: authConfig.authConfigOptions.connection_url,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(connectionUrlOption);
        }

        if(authConfig.authConfigOptions.search_base) {
            const searchBaseOption = {
                name: "search_base",
                value: authConfig.authConfigOptions.search_base,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(searchBaseOption);
        }

        if(authConfig.authConfigOptions.distinguished_name) {
            const distNameOption = {
                name: "distinguished_name",
                value: authConfig.authConfigOptions.distinguished_name,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(distNameOption);
        }

        if(authConfig.authConfigOptions.security_authentication) {
            const securityAuthOption = {
                name: "security_authentication",
                value: authConfig.authConfigOptions.security_authentication,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(securityAuthOption);
        }

        if(authConfig.authConfigOptions.ssl) {
            const sslAuthOption = {
                name: "ssl",
                value: authConfig.authConfigOptions.ssl,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(sslAuthOption);
        }

        if(authConfig.authConfigOptions.security_layer) {
            const securityLayerOption = {
                name: "security_layer",
                value: authConfig.authConfigOptions.security_layer,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(securityLayerOption);
        }

        if(authConfig.authConfigOptions.privacy_strength) {
            const privacyStrengthOption = {
                name: "privacy_strength",
                value: authConfig.authConfigOptions.privacy_strength,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(privacyStrengthOption);
        }

        if(authConfig.authConfigOptions.max_buffer) {
            const maxBufferOption = {
                name: "max_buffer",
                value: authConfig.authConfigOptions.max_buffer,
                dataType: "TEXT",
                status: "A"
            }
            authParamsList.push(maxBufferOption);
        }
    }
    else if(authConfig.method === AUTHENTICATION_METHODS.NTLM.value
        ||  authConfig.method === AUTHENTICATION_METHODS.NTLM2.value
        ||  authConfig.method === AUTHENTICATION_METHODS.OKTA.value){

        const domainOption = {
            name: "domain",
            value: authConfig.authConfigOptions.domain,
            dataType: "TEXT",
            status: "A"
        };
        authParamsList.push(domainOption);

        const domainControllerOption = {
            name: "domain_controller",
            value: authConfig.authConfigOptions.domain_controller,
            dataType: "TEXT",
            status: "A"
        };
        authParamsList.push(domainControllerOption);
    }

    return authParamsList;
}

const extractAuthParams = (params) => {
    const authParamsName = [
        "authentication_method",
        "domain",
        "domain_controller",
        "connection_url",
        "search_base",
        "distinguished_name",
        "security_authentication",
        "security_layer",
        "privacy_strength",
        "ssl",
        "max_buffer"
    ];
    return params.filter((param) => authParamsName.includes(param.name));
}

export function* doSaveUser(action) {
    const { user, authConfig, userParams } = action.payload;
    console.log("saving user "+ user.username + "...");

    try {
        let response = yield call(saveUserRequest, user);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            //save the auth params now
            if(authConfig || user.password) {
                const deleteAuthParamsList = extractAuthParams(userParams);

                const deleteAuthParamsResponse = yield all(deleteAuthParamsList.map((deleteAuthParam) => {
                    return call(deleteParamRequest, deleteAuthParam);
                }));
                const deleteAuthParamsResults = deleteAuthParamsResponse.filter(result => result.msgType === "AJAX_ERROR");
                if (deleteAuthParamsResults.length === 0) {
                    if (authConfig){
                        //save new auth params
                        const saveAuthParamsList = getAllUserAuthConfigParams(user, authConfig);
                        const saveAuthParamsResponse = yield all(saveAuthParamsList.map((authParam) => {
                            return call(saveParamRequest, user.username, authParam);
                        }));
                        const saveAuthParamsResults = saveAuthParamsResponse.filter(result => result.msgType === "AJAX_ERROR");
                        if (saveAuthParamsResults.length === 0) {
                            yield put(getAllUserParams({user}));
                            yield put(saveUserSucceeded({user}));
                            yield put(getAllUsers({}));
                        } else {
                            yield put(saveUserFailed("An error occurred while updating user authentication parameters"));
                        }
                    }else {
                        yield put(getAllUserParams({user}));
                        yield put(saveUserSucceeded({user}));
                        yield put(getAllUsers({}));
                    }
                } else {
                    yield put(saveUserFailed("An error occurred while updating user authentication parameters"));
                }
            }else{
                yield put(getAllUserParams({user}));
                yield put(saveUserSucceeded({user}));
            }
        }else{
            yield put(saveUserFailed(response));
        }
    } catch(e) {
        console.error("Error saving user: ", e);
    }
    finally {
        const msg = `save user details thread closed`;
        yield msg;
    }
}

export function* saveUserSaga() {
    yield takeLatest(SAVE_USER, doSaveUser);
}