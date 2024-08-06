import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    getAllProjectParams,
    SAVE_PROJECT_PARAM_ACTION,
    saveProjectParamFailed,
    saveProjectParamSucceeded,
} from "actions";
import {encodeHTML} from "../utilities";

const saveParamRequest = (project, param) => {

    const projectIdStr = ' id="'+project.internalId+'" ';

    let paramIdStr="";
    if (param.internalId) {
        paramIdStr = 'id="'+param.internalId+'"';
    }

    let dataValue = encodeHTML(param.value);

    const msg_xml = '<param '
        + paramIdStr +' datatype="'+ param.dataType
        +'" name="'+param.name+'">'
        + dataValue
        +'</param>';

    let data = {
        table: "project_param",
        msg_attrib: projectIdStr,
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.setParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doSaveProjectParam(action) {
    const { project, param } = action.payload;

    console.log("saving project param " + param.name + "...");
    try {
        let response = yield call(saveParamRequest, project, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(getAllProjectParams({project}));
            yield put(saveProjectParamSucceeded({param}));
        }else{
            yield put(saveProjectParamFailed(response));
        }
    } finally {
        const msg = `save project param thread closed`;
        yield msg;
    }
}

export function* saveProjectParamSaga() {
    yield takeLatest(SAVE_PROJECT_PARAM_ACTION.SAVE_PROJECT_PARAM, doSaveProjectParam);
}