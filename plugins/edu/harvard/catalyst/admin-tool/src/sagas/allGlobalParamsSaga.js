import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_ALL_GLOBAL_PARAMS_ACTION,
    getAllGlobalParamsFailed,
    getAllGlobalParamsSucceeded,
} from "actions";
import {DataType, ParamStatus} from "models";
import {decodeHTML} from "../utilities";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getAllGlobalParamsRequest = () => {
    const data = {
        id_xml: "/",
        param_xml: "",
        table: "global"
    }
    return i2b2.ajax.PM.getAllParam(data).then((xmlString) =>parseXml(xmlString));
};

const parseParamsXml = (allGlobalParamsXml) => {
    let params = allGlobalParamsXml.getElementsByTagName('param');
    let globalParamsList = [];
    let id=0;
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
            if(value.length > 0){
                value = decodeHTML(value);
            }
            globalParamsList.push({id, internalId, name, value, dataType, status});
            id = id + 1;
        }
    }

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
