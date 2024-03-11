import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    getAllProjectUserParams,
    SAVE_PROJECT_USER_PARAM_ACTION,
    saveProjectUserParamFailed,
    saveProjectUserParamSucceeded,
} from "actions";

const saveParamRequest = (project, user, param) => {

    const projectIdStr = ' id="'+project.internalId+'" ';

    let paramIdStr="";
    if (param.internalId) {
        paramIdStr = 'id="'+param.internalId+'"';
    }

    const userXml = '<user_name>'+user.username+'</user_name>';
    const msg_xml = userXml + '<param '
        + paramIdStr +' datatype="'+ param.dataType
        +'" name="'+param.name+'">'
        +param.value
        +'</param>';

    let data = {
        table: "project_user_param",
        msg_attrib: projectIdStr,
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.setParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doSaveProjectUserParam(action) {
    const { project, projectUser, param } = action.payload;

    console.log("saving param " + param + " for user " + projectUser.username + " in project " + project.project.name + "..." );
    try {
        let response = yield call(saveParamRequest, project.project, projectUser, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(getAllProjectUserParams({user: projectUser, project}));
            yield put(saveProjectUserParamSucceeded({param}));
        }else{
            yield put(saveProjectUserParamFailed(response));
        }
    } finally {
        const msg = `save project user param thread closed`;
        yield msg;
    }
}

export function* saveProjectUserParamSaga() {
    yield takeLatest(SAVE_PROJECT_USER_PARAM_ACTION.SAVE_PROJECT_USER_PARAM, doSaveProjectUserParam);
}