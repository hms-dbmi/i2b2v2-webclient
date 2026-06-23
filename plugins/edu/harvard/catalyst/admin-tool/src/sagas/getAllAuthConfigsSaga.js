import { call, takeLatest, put} from "redux-saga/effects";
import { ParamStatus} from "models";
import {parseXml} from "../utilities/parseXml";
import {GET_ALL_AUTH_CONFIGS} from "../actions";
import {getAllAuthConfigsFailed, getAllAuthConfigsSucceeded} from "../reducers/allAuthenticationConfigsSlice";
import {AUTH_CONFIG_PARAM_NAME} from "../models";

//a function that returns a promise
const getAllGlobalParamsRequest = () => {
    const data = {
        id_xml: "/",
        param_xml: "",
        hidden: true,
        table: "global"
    }
    return i2b2.ajax.PM.getAllParam(data).then((xmlString) =>parseXml(xmlString));
};

const parseAuthConfigsXml = (allGlobalParamsXml) => {
    let params = allGlobalParamsXml.getElementsByTagName('param');
    let authConfigsList = [];
    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        let name = param.attributes['name'].nodeValue;
        let value = param.childNodes[0].nodeValue;
        let status = 'A';
        if(param.attributes['status']) {
            status = param.attributes['status'].nodeValue;
        }

        if(name === AUTH_CONFIG_PARAM_NAME && status === 'A') {
            status = ParamStatus[status];

            if(value.length > 0){
                value = JSON.parse(value);
                if(value.method) {
                    authConfigsList.push(value);
                }
            }
        }
    }

    return authConfigsList;
}

export function* doGetAllAuthConfigs(action) {
    console.log("getting all authentication configs ...");

    try {
        const response = yield call(getAllGlobalParamsRequest);

        if(!response.error) {
            let authConfigsList = parseAuthConfigsXml(response);
            yield put(getAllAuthConfigsSucceeded({authConfigs: authConfigsList}));
        }else{
            yield put(getAllAuthConfigsFailed(response));
        }
    } catch(e){
        console.error("Error retrieving authentication configs. ", e);
        yield put(getAllAuthConfigsFailed(e));
    }
    finally {
        const msg = `get all authentication configs thread closed`;
        yield msg;
    }
}

export function* getAllAuthConfigsSaga() {
    yield takeLatest(GET_ALL_AUTH_CONFIGS, doGetAllAuthConfigs);
}
