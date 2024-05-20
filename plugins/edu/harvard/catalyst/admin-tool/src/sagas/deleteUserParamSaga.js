import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    DELETE_USER_PARAM_ACTION,
    deleteUserParamFailed,
    deleteUserParamSucceeded, getAllUserParams,
} from "actions";

const deleteParamRequest = (param) => {

    const msg_xml = param.internalId;

    let data = {
        table: "user_param",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.deleteParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doDeleteUserParam(action) {
    const { user, param } = action.payload;

    console.log("deleting user param" + param.name + "..." );

    try {
        let response = yield call(deleteParamRequest, param);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            //yield put(getAllUserParams({user}));
            yield put(deleteUserParamSucceeded({param}));
        }else{
            yield put(deleteUserParamFailed({param}));
        }
    } finally {
        const msg = `delete user param thread closed`;
        yield msg;
    }
}

export function* deleteUserParamSaga() {
    yield takeLatest(DELETE_USER_PARAM_ACTION.DELETE_USER_PARAM, doDeleteUserParam);
}