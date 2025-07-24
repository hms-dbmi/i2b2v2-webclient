import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_ALL_USER_PARAMS_ACTION,
    getAllUserParamsFailed,
    getAllUserParamsSucceeded,
} from "actions";
import {decodeHTML} from "../utilities";

import { DataType } from "models";
import {parseXml} from "../utilities/parseXml";
import {ParamStatus} from "../models";

//a function that returns a promise
const getAllUserParamsRequest = (username) => {
    let data = {
        table:"user_param",
        hidden: true,
        param_xml:"",
        id_xml:"<user_name>"+username+"</user_name>"
    };

    return i2b2.ajax.PM.getAllParam(data).then((xmlString) =>parseXml(xmlString));
};

const parseUserParamsXml = (user, allUserParamsXml) => {
    let params = allUserParamsXml.getElementsByTagName('param');
    let userParamsList = [];
    let id = 0;
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        let internalId = param.attributes['id'].nodeValue;
        let name = param.attributes['name'].nodeValue;
        let value = param.childNodes[0].nodeValue;
        let dataType = param.attributes['datatype'].nodeValue;
        let status = param.attributes['status'].nodeValue;
        status = ParamStatus[status];
        if(name && dataType) {
            dataType = DataType[dataType];
            name = decodeHTML(name);

            if(value.length > 0){
                value = decodeHTML(value);
            }
            userParamsList.push({id, internalId, name, value, dataType, status});
            id = i+1;
        }
    }

    return userParamsList;
}

export function* doGetAllUserParameters(action) {
    const { user } = action.payload;

    console.log("getting all parameters for user " + user.username + "...");

    try {
        const response = yield call(getAllUserParamsRequest, user.username);

        if(!response.error) {
            let paramsList = parseUserParamsXml(user, response);
            yield put(getAllUserParamsSucceeded({user: user, params:paramsList}));
        }else{
            yield put(getAllUserParamsFailed(response));
        }
    } catch(e){
        console.error("Error retrieving user parameters. ", e);
        yield put(getAllUserParamsFailed(e));
    }
    finally {
        const msg = `get all user params thread closed`;
        yield msg;
    }
}

export function* allUserParamsSaga() {
    yield takeLatest(GET_ALL_USER_PARAMS_ACTION.GET_ALL_USER_PARAMS, doGetAllUserParameters);
}
