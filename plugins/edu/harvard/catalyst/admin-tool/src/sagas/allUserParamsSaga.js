import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_USER_PARAMS_ACTION,
    getAllUserParamsFailed,
    getAllUserParamsSucceeded,
} from "actions";

import {Param, DataType} from "models";

//a function that returns a promise
const getAllUserParamsRequest = (username) => {
    let data = {
        table:"user_param",
        param_xml:"",
        id_xml:"<user_name>"+username+"</user_name>"
    };

    return i2b2.ajax.PM.getAllParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

const parseUserParamsXml = (user, allUserParamsXml) => {
    let params = allUserParamsXml.getElementsByTagName('param');
    let userParamsList = [];
    params.forEach((param, index) => {
        let id = index;
        let internalId = param.attributes['id'];
        let name = param.attributes['name'];
        let value = param.value;
        let dataType = param.attributes['datatype'];

        if(name && value && dataType) {
            dataType = DataType[dataType];
            userParamsList.push({id, internalId, name, value, dataType});
        }
    });

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
