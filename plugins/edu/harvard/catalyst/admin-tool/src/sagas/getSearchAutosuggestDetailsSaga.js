import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_SEARCH_AUTOSUGGEST_DETAILS
} from "actions";

import {
    getSearchAutosuggestDetailsFailed, getSearchAutosuggestDetailsSucceeded
} from "../reducers/editProjectInfoSlice";

import {decodeHTML} from "../utilities";
import {parseXml} from "../utilities/parseXml";

const getAllProjectParamsRequest = (projectId) => {
    let data = {
        table:"project_param",
        hidden: true,
        param_xml:"",
        id_xml:projectId
    };

    return i2b2.ajax.PM.getAllParam(data).then((xmlString) =>parseXml(xmlString));
};

const parseParamsXml = (allParamsXml) => {
    let params = allParamsXml.getElementsByTagName('param');

    let searchAutoSuggestDetails = {
        eventLogs: []
    };
    const processSearchAutoSuggestDetails = function(paramName, paramValue, createDateTime){
        switch (paramName) {
            case 'AUTOSUGGEST_INDEX_STATUS':
                searchAutoSuggestDetails.status = paramValue;
                break;
            case 'TOTAL_NUM_WORKING_ON':
                if(paramValue !== "FINISHED") {
                    searchAutoSuggestDetails.progressMsg = paramValue;
                }
                break;
            case 'AUTOSUGGEST_WORKING_ON':
                searchAutoSuggestDetails.progressMsg = paramValue;
                break;
            case 'AUTOSUGGEST_DIRECTORY_INDEX':
                searchAutoSuggestDetails.autosuggestIndexLocation = paramValue;
                break;
            case 'AUTOSUGGEST_OLD_DIRECTORY_INDEX':
                searchAutoSuggestDetails.oldAutosuggestIndexLocation = paramValue;
                break;
            case 'AUTOSUGGEST_STARTED_INDEX':
                searchAutoSuggestDetails.startDateTime = paramValue;
                break;
            case 'AUTOSUGGEST_FINISHED_INDEX':
                searchAutoSuggestDetails.endDateTime = paramValue;
                break;
            case 'AUTOSUGGEST_CALCULATE_TOTALNUM':
                searchAutoSuggestDetails.calculateTotalNum = paramValue;
                break;
            case 'AUTOSUGGEST_ERROR':
                searchAutoSuggestDetails.eventLogs.push({
                    createDateTime: createDateTime,
                    msg: paramValue
                });
                break;
        }
    }

    for (let i = 0; i < params.length; i++) {
        const param = params[i];
        let name = param.attributes['name'].nodeValue;
        let createDateTime = null;
        let value = '';
        if(param.childNodes[0]){
            value = param.childNodes[0].nodeValue;
        }

        if(param.attributes['create_date']){
            createDateTime = param.attributes['create_date'].nodeValue;
        }

        let status = null;
        if(param.attributes['status']) {
            status = param.attributes['status'].nodeValue;
        }

        if(name && (status === 'A' || status === 'S' || status === null)) {
            name = decodeHTML(name);
            if(value.length > 0){
                value = decodeHTML(value);
            }
            processSearchAutoSuggestDetails(name, value, createDateTime);
        }
    }

    return searchAutoSuggestDetails;
}

export function* doGetSearchAutosuggestDetails(action) {
    const { project } = action.payload;

    console.log("getting search auto suggest details for project " + project.name + "...");

    try {
        const response = yield call(getAllProjectParamsRequest, project.internalId);

        if(!response.error) {
            let autosuggestDetails = parseParamsXml(response);
            yield put(getSearchAutosuggestDetailsSucceeded({project, autosuggestDetails}));
        }else{
            yield put(getSearchAutosuggestDetailsFailed(response));
        }
    } catch(e){
        console.error("Error retrieving search autosuggest details. ", e);
        yield put(getSearchAutosuggestDetailsFailed(e));
    }
    finally {
        const msg = `get search autosuggest details thread closed`;
        yield msg;
    }
}

export function* getSearchAutosuggestDetailsSaga() {
    yield takeLatest(GET_SEARCH_AUTOSUGGEST_DETAILS, doGetSearchAutosuggestDetails);
}