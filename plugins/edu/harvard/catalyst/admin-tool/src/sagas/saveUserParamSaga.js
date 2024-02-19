import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    SAVE_USER_PARAM_ACTION,
    saveUserParamFailed,
    saveUserParamSucceeded,
} from "actions";

const saveParamRequest = (username, param) => {

    let paramIdStr="";
    if (param.internalId) {
        paramIdStr = 'id="'+param.internalId+'"';
    }

    const msg_xml = '<user_name>'+username +'</user_name><param '
        + paramIdStr +' datatype="'+ param.dataType
        +'" name="'+param.name+'">'
        +param.value
        +'</param>';

    let data = {
        table: "user_param",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.setParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doSaveUserParam(action) {
    console.log("saving user param...");
    const { user, param } = action.payload;

    console.log("saving user param " + param);
    try {
        let response = yield call(saveParamRequest, user.username, param);
        console.log("response " + JSON.stringify(response));
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(saveUserParamSucceeded({param}));
        }else{
            yield put(saveUserParamFailed(response));
        }
    } finally {
        const msg = `save param thread closed`;
        yield msg;
    }
}

export function* saveUserParamSaga() {
    yield takeLatest(SAVE_USER_PARAM_ACTION.SAVE_USER_PARAM, doSaveUserParam);
}