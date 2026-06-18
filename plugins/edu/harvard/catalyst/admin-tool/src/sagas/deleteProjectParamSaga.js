import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    DELETE_PROJECT_PARAM_ACTION,
    deleteProjectParamFailed,
    deleteProjectParamSucceeded, getAllProjectParams,
} from "actions";

const deleteParamRequest = (param) => {

    const msg_xml = param.internalId;

    let data = {
        table: "project_param",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.deleteParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doDeleteProjectParam(action) {
    const { project, param } = action.payload;

    console.log("deleting param " + param.name + " in project " + project.internalId + "..." );

    try {
        let response = yield call(deleteParamRequest, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(getAllProjectParams({project}));
            yield put(deleteProjectParamSucceeded({param}));
        }else{
            yield put(deleteProjectParamFailed(response));
        }
    } finally {
        const msg = `delete user param thread closed`;
        yield msg;
    }
}

export function* deleteProjectParamSaga() {
    yield takeLatest(DELETE_PROJECT_PARAM_ACTION.DELETE_PROJECT_PARAM, doDeleteProjectParam);
}