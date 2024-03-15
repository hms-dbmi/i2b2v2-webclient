import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    DELETE_PROJECT_USER_PARAM_ACTION,
    deleteProjectUserParamFailed,
    deleteProjectUserParamSucceeded, getAllProjectUserParams,
} from "actions";

const deleteParamRequest = (param) => {

    const msg_xml = param.internalId;

    let data = {
        table: "project_user_param",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.deleteParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doDeleteProjectUserParam(action) {
    const { selectedProject, projectUser, param } = action.payload;

    console.log("deleting param " + param.name + " for user " + projectUser.username +  " in project " + selectedProject.project.internalId + "..." );

    try {
        let response = yield call(deleteParamRequest, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(getAllProjectUserParams({project:selectedProject, user: projectUser}));
            yield put(deleteProjectUserParamSucceeded({param}));
        }else{
            yield put(deleteProjectUserParamFailed({param}));
        }
    } finally {
        const msg = `delete user param thread closed`;
        yield msg;
    }
}

export function* deleteProjectUserParamSaga() {
    yield takeLatest(DELETE_PROJECT_USER_PARAM_ACTION.DELETE_PROJECT_USER_PARAM, doDeleteProjectUserParam);
}