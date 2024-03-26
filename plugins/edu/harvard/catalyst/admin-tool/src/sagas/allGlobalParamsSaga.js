import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_GLOBAL_PARAMS_ACTION,
    getAllGlobalParamsFailed,
    getAllGlobalParamsSucceeded,
} from "actions";
import {DataType} from "models";

//a function that returns a promise
const getAllGlobalParamsRequest = () => {
    const data = {
        id_xml: "/",
        param_xml: "",
        table: "global"
    }
    return i2b2.ajax.PM.getAllParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

const parseParamsXml = (allGlobalParamsXml) => {
    let params = allGlobalParamsXml.getElementsByTagName('param');
    let globalParamsList = [];
    let id=0;
    params.forEach((param) => {
        let internalId = param.attributes['id'];
        let name = param.attributes['name'];
        let value = param.value;
        let dataType = param.attributes['datatype'];

        if(name && dataType) {
            dataType = DataType[dataType];
            globalParamsList.push({id, internalId, name, value, dataType});
            id = id + 1;
        }
    });

    return globalParamsList;
}

export function* doGetAllGlobalParameters(action) {
    console.log("getting all global parameters ...");

    try {
        const response = yield call(getAllGlobalParamsRequest);

        if(response) {
            let paramsList = parseParamsXml(response);
            yield put(getAllGlobalParamsSucceeded({params:paramsList}));
        }else{
            yield put(getAllGlobalParamsFailed(response));
        }
    } finally {
        const msg = `get all global params thread closed`;
        yield msg;
    }
}

export function* allGlobalParamsSaga() {
    yield takeLatest(GET_ALL_GLOBAL_PARAMS_ACTION.GET_ALL_GLOBAL_PARAMS, doGetAllGlobalParameters);
}
