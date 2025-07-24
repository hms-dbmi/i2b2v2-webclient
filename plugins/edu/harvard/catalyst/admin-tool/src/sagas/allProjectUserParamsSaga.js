import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_ALL_PROJECT_USER_PARAMS_ACTION,
    getAllProjectUserParamsFailed,
    getAllProjectUserParamsSucceeded,
} from "actions";

import {DataType, ParamStatus} from "models";
import {decodeHTML} from "../utilities";
import {parseXml} from "../utilities/parseXml";

const getAllProjectUserParamsRequest = (projectId, user) => {
    let data = {
        table:"project_user_param",
        param_xml:' id="'+projectId+'"',
        hidden: true,
        id_xml:"<user_name>"+user.username+"</user_name>"
    };


    return i2b2.ajax.PM.getAllParam(data).then((xmlString) =>parseXml(xmlString));
};

const parseParamsXml = (allParamsXml) => {
    let params = allParamsXml.getElementsByTagName('param');
    let paramsParamsList = [];
    let id = 0;
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        let internalId = param.attributes['id'].nodeValue;
        let name = param.attributes['name'].nodeValue;
        let value = param.childNodes[0].nodeValue;
        let dataType = param.attributes['datatype'].nodeValue;
        let status = param.attributes['status'].nodeValue;

        if(name && dataType) {
            dataType = DataType[dataType];
            status = ParamStatus[status];
            name = decodeHTML(name);

            if(value.length > 0){
                value = decodeHTML(value);
            }
            paramsParamsList.push({id, internalId, name, value, dataType, status});
            id = id + 1;
        }
    }

    return paramsParamsList;
}

export function* doGetAllProjectUserParameters(action) {
    const { project, user } = action.payload;

    console.log("getting all parameters for user " + user.username + " in project " + project.project.name + "...");

    try {
        const response = yield call(getAllProjectUserParamsRequest, project.project.internalId, user);

        if(!response.error) {
            let paramsList = parseParamsXml(response);
            yield put(getAllProjectUserParamsSucceeded({user, project, params:paramsList}));
        }else{
            yield put(getAllProjectUserParamsFailed(response));
        }
    } catch(e){
        console.error("Error retrieving project user parameters. ", e);
        yield put(getAllProjectUserParamsFailed(e));
    }
    finally {
        const msg = `get all project user params thread closed`;
        yield msg;
    }
}

export function* allProjectUserParamsSaga() {
    yield takeLatest(GET_ALL_PROJECT_USER_PARAMS_ACTION.GET_ALL_PROJECT_USER_PARAMS, doGetAllProjectUserParameters);
}
