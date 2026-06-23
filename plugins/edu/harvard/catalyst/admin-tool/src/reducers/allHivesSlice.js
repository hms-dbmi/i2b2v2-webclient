import { createSlice } from '@reduxjs/toolkit'
import {
    ALL_HIVES,
} from "../actions";
import { defaultState } from "../defaultState";
import {HiveDomain, Param, ParamStatusInfo} from "../models";

export const allHivesSlice = createSlice({
    name: ALL_HIVES,
    initialState: defaultState.allHives,
    reducers: {
        getAllHives: state => {
            state.isFetching = true;
        },
        getAllHivesSucceeded: (state, {payload: { allHives } }) => {
            let hiveDomains = [];
            allHives.map((hive) => {
                hiveDomains.push(HiveDomain({
                    environment: hive.environment,
                    helpURL: hive.helpURL,
                    domainId: hive.domainId,
                    domainName: hive.domainName,
                    isActive: hive.isActive
                }));
            })
            state.hiveDomains = hiveDomains;
            state.isFetching = false;
        },
        getAllHivesFailed: state => {
            state.isFetching = false;
        },
        saveHiveDomain: state => {
            state.saveStatus = null;
        },
        saveHiveDomainSucceeded: (state, {payload: { hiveDomains } }) => {
            state.hiveDomains = hiveDomains;
            state.saveStatus = "SUCCESS";
        },
        saveHiveDomainFailed: state => {
            state.saveStatus = "FAIL";
        },
        saveHiveDomainStatusConfirmed: state => {
            state.saveStatus = null;
        },
        getAllGlobalParams: state => {
            state.isFetchingParams = true;
            state.allGlobalParamStatus = null;
        },
        getAllGlobalParamsSucceeded: (state, {payload:  { params } }) => {
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

            state.params = paramsList;
            state.isFetchingParams = false;
            state.allGlobalParamStatus = "SUCCESS";
        },
        getAllGlobalParamsFailed: state => {
            state.isFetchingParams = false;
            state.allGlobalParamStatus = 'FAIL';
        },
        getAllGlobalParamsStatusConfirmed: state => {
            state.allGlobalParamStatus = null;
        },
        saveGlobalParam: state => {
            state.paramStatus = ParamStatusInfo();
        },
        saveGlobalParamSucceeded: (state, {payload: { param } }) => {
            state.paramStatus = ParamStatusInfo({
                status: "SAVE_SUCCESS",
                param
            });
        },
        saveGlobalParamFailed: (state, {payload: { param } }) => {
            state.paramStatus = ParamStatusInfo({
                status: "SAVE_FAIL",
                param
            });
        },
        saveGlobalParamStatusConfirmed: state => {
            state.paramStatus = ParamStatusInfo();
        },
        deleteGlobalParamSucceeded: (state, {payload: {param} }) => {
            state.paramStatus = ParamStatusInfo({
                status: "DELETE_SUCCESS",
                param
            });
        },
        deleteGlobalParamFailed: (state, {payload: {param} }) => {
            state.paramStatus = ParamStatusInfo({
                status: "DELETE_FAIL",
                param
            });
        },
        deleteGlobalParamStatusConfirmed: state => {
            state.paramStatus = ParamStatusInfo();
        }
    }
})

export const {
    getAllHives,
    getAllHivesSucceeded,
    getAllHivesFailed,
    saveHiveDomain,
    saveHiveDomainSucceeded,
    saveHiveDomainFailed,
    saveHiveDomainStatusConfirmed,
    getAllGlobalParams,
    getAllGlobalParamsSucceeded,
    getAllGlobalParamsFailed,
    getAllGlobalParamsStatusConfirmed,
    saveGlobalParam,
    saveGlobalParamSucceeded,
    saveGlobalParamFailed,
    saveGlobalParamStatusConfirmed,
    deleteGlobalParamSucceeded,
    deleteGlobalParamFailed,
    deleteGlobalParamStatusConfirmed
} = allHivesSlice.actions


export default allHivesSlice.reducer