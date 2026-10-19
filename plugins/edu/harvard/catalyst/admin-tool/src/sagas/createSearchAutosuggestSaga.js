import {call, put, takeLatest} from "redux-saga/effects";
import {
    createSearchAutosuggestFailed,
    createSearchAutosuggestSucceeded, getSearchAutosuggestDetails
} from "../reducers/editProjectInfoSlice";
import {CREATE_SEARCH_AUTOSUGGEST} from "../actions";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const createSearchAutoSuggestRequest = (project_id, commonDataModel) => {
    let data = {
        project_id,
        cdm: "",
        operation_type: ""
    };

    if(commonDataModel){
        data.operation_type= 'operation_type="synchronize_all"';
        data.cdm = 'cdm="' + commonDataModel + '"';
    }

    return i2b2.ajax.ONT.CreateSearchMetadata(data).then((xmlString) =>parseXml(xmlString));
};

export function* doCreateSearchAutosuggest(action) {
    const { project, commonDataModel } = action.payload;

    console.log("creating search autosuggest for project " + project.name + "...");

    console.log("commonDataModel ", commonDataModel);
    try {
        const response = yield call(createSearchAutoSuggestRequest, project.internalId, commonDataModel);

        if(!response.error) {
            yield put(createSearchAutosuggestSucceeded());
            yield put(getSearchAutosuggestDetails({project}));
        }else{
            yield put(createSearchAutosuggestFailed(response));
        }
    } catch(e){
        console.error("Error creating search autosuggest index. ", e);
        yield put(createSearchAutosuggestFailed(e));
    }
    finally {
        const msg = `create search autosuggest thread closed`;
        yield msg;
    }
}

export function* createSearchAutosuggestSaga() {
    yield takeLatest(CREATE_SEARCH_AUTOSUGGEST, doCreateSearchAutosuggest);
}