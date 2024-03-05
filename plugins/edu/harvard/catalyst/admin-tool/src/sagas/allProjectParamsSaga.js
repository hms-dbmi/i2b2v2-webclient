import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_PROJECT_PARAMS_ACTION,
    getAllProjectParamsFailed,
    getAllProjectParamsSucceeded,
} from "actions";

import {Param, DataType} from "models";

//a function that returns a promise
const getAllProjectParamsRequest = (projectId) => {
    let data = {
        table:"project_param",
        param_xml:"",
        id_xml:projectId
    };

    //var recList = i2b2.PM.ajax.getAllParam("PM:Admin", {table:'project', id_xml:proj_data.i2b2NodeKey});

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

export function* doGetAllProjectParameters(action) {
    const { project } = action.payload;

    console.log("getting all parameters for project " + project.name + "...");

    try {
        const response = yield call(getAllProjectParamsRequest, project.name);

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
