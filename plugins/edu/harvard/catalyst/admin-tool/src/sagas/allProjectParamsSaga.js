import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_ALL_PROJECT_PARAMS_ACTION,
    getAllProjectParamsFailed,
    getAllProjectParamsSucceeded,
} from "actions";

import {DataType} from "models";
import {decodeHTML} from "../utilities";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getAllProjectParamsRequest = (projectId) => {
    let data = {
        table:"project_param",
        param_xml:"",
        id_xml:projectId
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

        if(name && dataType) {
            dataType = DataType[dataType];
            if(value.length > 0){
                value = decodeHTML(value);
            }
            paramsParamsList.push({id, internalId, name, value, dataType});
            id = id+1;
        }
    }

    return paramsParamsList;
}

export function* doGetAllProjectParameters(action) {
    const { project } = action.payload;

    console.log("getting all parameters for project " + project.name + "...");

    try {
        const response = yield call(getAllProjectParamsRequest, project.internalId);

        if(response) {
            let paramsList = parseParamsXml(response);
            yield put(getAllProjectParamsSucceeded({project: project, params:paramsList}));
        }else{
            yield put(getAllProjectParamsFailed(response));
        }
    } finally {
        const msg = `get all project params thread closed`;
        yield msg;
    }
}

export function* allProjectParamsSaga() {
    yield takeLatest(GET_ALL_PROJECT_PARAMS_ACTION.GET_ALL_PROJECT_PARAMS, doGetAllProjectParameters);
}
