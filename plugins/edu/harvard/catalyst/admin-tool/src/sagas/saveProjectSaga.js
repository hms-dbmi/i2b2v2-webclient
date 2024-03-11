import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import md5 from 'md5';
import {
    SAVE_PROJECT_ACTION,
    saveProjectFailed,
    saveProjectSucceeded,
} from "actions";


//a function that returns a promise
const saveProjectRequest = (project) => {
    let key = project.key;
    if(key && key.length > 0){
        key = md5(key);
        key = key.substr(0,3);
    }
    let data = {
        id: project.internalId,
        name:project.name,
        path: project.path,
        key: key,
        wiki: project.wiki,
        description: project.description,
    };

    return i2b2.ajax.PM.setProject(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

export function* doSaveProject(action) {
    const { project } = action.payload;
    console.log("saving project " + project.name + "...");

    try {
        let response = yield call(saveProjectRequest, project);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(saveProjectSucceeded({project}));
        }else{
            yield put(saveProjectFailed(response));
        }
    } finally {
        const msg = `save project details thread closed`;
        yield msg;
    }
}

export function* saveProjectSaga() {
    yield takeLatest(SAVE_PROJECT_ACTION.SAVE_PROJECT, doSaveProject);
}