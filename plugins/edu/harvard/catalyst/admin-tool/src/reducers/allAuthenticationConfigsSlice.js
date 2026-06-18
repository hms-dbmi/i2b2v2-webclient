import { createSlice } from '@reduxjs/toolkit'
import {AUTHENTICATION_CONFIG_INFO} from "../actions";
import { defaultState } from '../defaultState';
import {
    AuthenticationConfig,
    AuthenticationConfigDomainOptions,
    AuthenticationConfigLDAPOptions,
    ParamStatusInfo
} from "../models";


export const allAuthenticationConfigsSlice = createSlice({
    name: AUTHENTICATION_CONFIG_INFO,
    initialState: defaultState.allAuthenticationConfigs,
    reducers: {
        getAllAuthConfigs: state => {
            state.isFetching = true;
        },
        getAllAuthConfigsSucceeded: (state, { payload: { authConfigs } }) => {
            let authConfigsList = [];

            authConfigs.map((authConfig) => {
                let authConfigOptions = {};
                const authConfigOpts = authConfig.authConfigOptions;
                if(authConfigOpts?.domain) {
                     authConfigOptions= AuthenticationConfigDomainOptions({
                        domain: authConfigOpts.domain,
                        domain_controller: authConfigOpts.domain_controller,
                    })
                }
                if(authConfigOpts?.connection_url) {
                    authConfigOptions= AuthenticationConfigLDAPOptions({
                        connection_url: authConfigOpts.connection_url,
                        search_base: authConfigOpts.search_base,
                        distinguished_name: authConfigOpts.distinguished_name,
                        security_authentication: authConfigOpts.security_authentication,
                        ssl: authConfigOpts.ssl,
                        security_layer: authConfigOpts.security_layer,
                        privacy_strength: authConfigOpts.privacy_strength,
                        max_buffer: authConfigOpts.max_buffer
                    })
                }
                authConfigsList.push(AuthenticationConfig({
                    name: authConfig.name,
                    method: authConfig.method,
                    authConfigOptions: authConfigOptions
                }));
            })

            state.authConfigs = authConfigsList;
            state.isFetching = false;
            state.authConfigsStatus = ParamStatusInfo({
                status: "SUCCESS",
                param: "ADMIN_UI_DEFAULT_AUTH_TYPE"
            });
        },
        getAllAuthConfigsFailed: state => {
            state.isFetching = false;
            state.authConfigsStatus = ParamStatusInfo({
                status: "FAIL",
                param: "ADMIN_UI_DEFAULT_AUTH_TYPE"
            });
        },
        getAllAuthConfigsStatusConfirmed: state => {
            state.authConfigsStatus = ParamStatusInfo();
        }
    }
})

export const {
    getAllAuthConfigs,
    getAllAuthConfigsSucceeded,
    getAllAuthConfigsFailed,
    getAllAuthConfigsStatusConfirmed
} = allAuthenticationConfigsSlice.actions

export default allAuthenticationConfigsSlice.reducer