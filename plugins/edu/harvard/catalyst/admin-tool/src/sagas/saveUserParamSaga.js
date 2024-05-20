import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    getAllUserParams,
    SAVE_USER_PARAM_ACTION,
    saveUserParamFailed,
    saveUserParamSucceeded,
} from "actions";
import {encodeHTML} from "../utilities";

const saveParamRequest = (username, param) => {

    let paramIdStr="";
    if (param.internalId) {
        paramIdStr = 'id="'+param.internalId+'"';
    }

    let dataValue = encodeHTML(param.value);

    const msg_xml = '<user_name>'+username +'</user_name><param '
        + paramIdStr +' datatype="'+ param.dataType
        +'" name="'+param.name+'">'
        + dataValue
        +'</param>';

    let data = {
        table: "user_param",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.setParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doSaveUserParam(action) {
    const { user, param } = action.payload;

    console.log("saving user param " + param + "...");
    try {
        let response = yield call(saveParamRequest, user.username, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(getAllUserParams({user}));
            yield put(saveUserParamSucceeded({param}));
        }else{
            yield put(saveUserParamFailed({param}));
        }
    } finally {
        const msg = `save user param thread closed`;
        yield msg;
    }
}

export function* saveUserParamSaga() {
    yield takeLatest(SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM, doSaveUserParam);
}