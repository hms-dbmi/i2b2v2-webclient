import {StatusInfo, ConfigInfo} from "../models";
import {CONFIG_INFO} from "../actions";
import {defaultState} from "../defaultState";
import {createSlice} from "@reduxjs/toolkit";

export const configInfoSlice = createSlice({
    name: CONFIG_INFO,
    initialState: defaultState.configInfo,
    reducers: {
        getConfigInfo: state => {
            return ConfigInfo({
                isFetching: true
            })
        },
        getConfigInfoSuccess: (state, { payload: config }) => {
            state.obfuscatedDisplayNumber = config.obfuscatedDisplayNumber;
            state.useFloorThreshold = config.useFloorThreshold;
            state.floorThresholdNumber = config.floorThresholdNumber;
            state.floorThresholdText = config.floorThresholdText;
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getConfigInfoError: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMessage
            });
        },
    }
})

export const {
    getConfigInfo,
    getConfigInfoSuccess,
    getConfigInfoError,
} = configInfoSlice.actions

export default configInfoSlice.reducer