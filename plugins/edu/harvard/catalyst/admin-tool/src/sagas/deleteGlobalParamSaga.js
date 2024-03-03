import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    DELETE_GLOBAL_PARAM_ACTION,
    deleteGlobalParamFailed,
    deleteGlobalParamSucceeded, getAllGlobalParams,
} from "actions";

const deleteParamRequest = (param) => {

    const msg_xml = param.internalId;

    let data = {
        table: "global",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.deleteParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doDeleteGlobalParam(action) {
    const { user, param } = action.payload;

    console.log("deleting global param..." + param.name);

    try {
        let response = yield call(deleteParamRequest, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(getAllGlobalParams({user}));
            yield put(deleteGlobalParamSucceeded({param}));
        }else{
            yield put(deleteGlobalParamFailed(response));
        }
    } finally {
        const msg = `delete global param thread closed`;
        yield msg;
    }
}

export function* deleteGlobalParamSaga() {
    yield takeLatest(DELETE_GLOBAL_PARAM_ACTION.DELETE_GLOBAL_PARAM, doDeleteGlobalParam);
}