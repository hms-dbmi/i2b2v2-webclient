/* globals i2b2 */

import {all, call, put, takeLatest} from "redux-saga/effects";
import { GET_CONFIG_INFO} from "../actions";
import {getConfigInfoError, getConfigInfoSuccess} from "../reducers/configInfoSlice";

const getObfuscatedDisplayNumberRequest = () => i2b2.authorizedTunnel.variable["i2b2.UI.cfg.obfuscatedDisplayNumber"].then((obfsDisNum) => obfsDisNum);
const getUseFloorThresholdRequest = () => i2b2.authorizedTunnel.variable["i2b2.UI.cfg.useFloorThreshold"].then((useFloorThresh) => useFloorThresh);
const getFloorThresholdNumberRequest = () => i2b2.authorizedTunnel.variable["i2b2.UI.cfg.floorThresholdNumber"].then((floorThreshNum) => floorThreshNum);
const getFloorThresholdTextRequest = () => i2b2.authorizedTunnel.variable["i2b2.UI.cfg.floorThresholdText"].then((floorThreshText) => floorThreshText);

export function* doGetConfigInfo(action) {
    try {

        const [obfuscatedDisplayNumber,
            useFloorThreshold,
            floorThresholdNumber,
            floorThresholdText] = yield all([
            call(getObfuscatedDisplayNumberRequest),
            call(getUseFloorThresholdRequest),
            call(getFloorThresholdNumberRequest),
            call(getFloorThresholdTextRequest)
        ])

        if (obfuscatedDisplayNumber !== undefined ) {
            const config = {
                obfuscatedDisplayNumber,
                useFloorThreshold,
                floorThresholdNumber,
                floorThresholdText
            }
            yield put(getConfigInfoSuccess(config));
        } else {
            yield put(getConfigInfoError({errorMessage: "There was an error getting the config info."}));
        }
    } catch (error) {
        yield put(getConfigInfoError({errorMessage: "There was an error getting the config info."}));
        console.error("There was an error getting the config info. Error: " + error);
    }
}


export function* getConfigInfoSaga() {
    yield takeLatest(GET_CONFIG_INFO, doGetConfigInfo);
}