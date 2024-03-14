import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    getAllGlobalParams,
    SAVE_GLOBAL_PARAM_ACTION,
    saveGlobalParamFailed,
    saveGlobalParamSucceeded,
} from "actions";

const saveParamRequest = (param) => {
    let paramIdStr="";
    if (param.internalId) {
        paramIdStr = 'id="'+param.internalId+'"';
    }
    const msg_xml = '<project_path>/</project_path><can_override>Y</can_override>' +
            '<param datatype="'+param.dataType+ paramIdStr +'" name="'+param.name+'">'+param.value+"</param>";


    let data = {
        table: "global",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.setParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doSaveGlobalParam(action) {
    const { param } = action.payload;

    console.log("saving global param " + param + "...");
    try {
        let response = yield call(saveParamRequest, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(getAllGlobalParams({}));
            yield put(saveGlobalParamSucceeded({param}));
        }else{
            yield put(saveGlobalParamFailed({param}));
        }
    } finally {
        const msg = `save global param thread closed`;
        yield msg;
    }
}

export function* saveGlobalParamSaga() {
    yield takeLatest(SAVE_GLOBAL_PARAM_ACTION.SAVE_GLOBAL_PARAM, doSaveGlobalParam);
}