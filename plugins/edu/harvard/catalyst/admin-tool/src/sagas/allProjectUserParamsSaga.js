import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_PROJECT_USER_PARAMS_ACTION,
    getAllProjectUserParamsFailed,
    getAllProjectUserParamsSucceeded,
} from "actions";

import {Param, DataType} from "models";

//a function that returns a promise
const getAllProjectUserParamsRequest = (projectId, user) => {
    //	var recList = i2b2.PM.ajax.getAllParam("PM:Admin", {table:"project_user", param_xml:' id="'+project+'"', id_xml:"<user_name>"+username+"</user_name>"});
    let data = {
        table:"project_user_param",
        param_xml:"",
        id_xml:"<path>"+projectId+"</path><user_name>"+user.username+"</user_name>"
    };


    return i2b2.ajax.PM.getAllParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

const parseParamsXml = (allParamsXml) => {
    let params = allParamsXml.getElementsByTagName('param');
    let paramsParamsList = [];
    params.forEach((param, index) => {
        let id = index;
        let internalId = param.attributes['id'];
        let name = param.attributes['name'];
        let value = param.value;
        let dataType = param.attributes['datatype'];

        if(name && value && dataType) {
            dataType = DataType[dataType];
            paramsParamsList.push({id, internalId, name, value, dataType});
        }
    });

    return paramsParamsList;
}

export function* doGetAllProjectUserParameters(action) {
    const { project, user } = action.payload;

    console.log("getting all parameters for user " + user.username + " in project " + project.project.name + "...");

    try {
        const response = yield call(getAllProjectUserParamsRequest, project.internalId, user);

        if(response) {
            let paramsList = parseParamsXml(response);
            yield put(getAllProjectUserParamsSucceeded({user, project, params:paramsList}));
        }else{
            yield put(getAllProjectUserParamsFailed(response));
        }
    } finally {
        const msg = `get all project user params thread closed`;
        yield msg;
    }
}

export function* allProjectUserParamsSaga() {
    yield takeLatest(GET_ALL_PROJECT_USER_PARAMS_ACTION.GET_ALL_PROJECT_USER_PARAMS, doGetAllProjectUserParameters);
}
