import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_PROJECT_PARAMS_ACTION,
    getAllProjectParamsFailed,
    getAllProjectParamsSucceeded,
} from "actions";

import {Param, DataType} from "models";
import {decodeHTML} from "../utilities";

//a function that returns a promise
const getAllProjectParamsRequest = (projectId) => {
    let data = {
        table:"project_param",
        param_xml:"",
        id_xml:projectId
    };

    return i2b2.ajax.PM.getAllParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

const parseParamsXml = (allParamsXml) => {
    let params = allParamsXml.getElementsByTagName('param');
    let paramsParamsList = [];
    let id = 0;
    params.forEach((param) => {
        let internalId = param.attributes['id'];
        let name = param.attributes['name'];
        let value = param.value;
        let dataType = param.attributes['datatype'];

        if(name && dataType) {
            dataType = DataType[dataType];
            if(value.length > 0){
                value = decodeHTML(value);
            }
            paramsParamsList.push({id, internalId, name, value, dataType});
            id = id+1;
        }
    });

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
