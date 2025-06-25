import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_ALL_USER_PARAMS_ACTION,
    getAllUserParamsFailed,
    getAllUserParamsSucceeded,
} from "actions";
import {decodeHTML} from "../utilities";

import { DataType } from "models";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getAllUserParamsRequest = (username) => {
    let data = {
        table:"user_param",
        param_xml:"",
        id_xml:"<user_name>"+username+"</user_name>"
    };

    return i2b2.ajax.PM.getAllParam(data).then((xmlString) =>parseXml(xmlString));
};

const parseUserParamsXml = (user, allUserParamsXml) => {
    let params = allUserParamsXml.getElementsByTagName('param');
    let userParamsList = [];
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        let id = i+1;
        let internalId = param.attributes['id'].nodeValue;
        let name = param.attributes['name'].nodeValue;
        let value = param.childNodes[0].nodeValue;
        let dataType = param.attributes['datatype'].nodeValue;

        if(name && dataType) {
            dataType = DataType[dataType];
            if(value.length > 0){
                value = decodeHTML(value);
            }
            userParamsList.push({id, internalId, name, value, dataType});
        }
    }

    return userParamsList;
}

export function* doGetAllUserParameters(action) {
    const { user } = action.payload;

    console.log("getting all parameters for user " + user.username + "...");

    try {
        const response = yield call(getAllUserParamsRequest, user.username);

        if(response) {
            let paramsList = parseUserParamsXml(user, response);
            yield put(getAllUserParamsSucceeded({user: user, params:paramsList}));
        }else{
            yield put(getAllUserParamsFailed(response));
        }
    } finally {
        const msg = `get all user params thread closed`;
        yield msg;
    }
}

export function* allUserParamsSaga() {
    yield takeLatest(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS, doGetAllUserParameters);
}
