import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    DELETE_PROJECT_ACTION,
    deleteProjectFailed,
    deleteProjectSucceeded,
} from "actions";

const deleteProjectRequest = (project) => {

    const data = {
        project_id: project.internalId,
        project_path: project.path
    };

    return i2b2.ajax.PM.deleteProject(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

export function* doDeleteProject(action) {
    const { project } = action.payload;
    console.log("deleting project " + project.name + "..." );
    try {
        const response = yield call(deleteProjectRequest, project);

        if(!response.toString().includes("AJAX_ERROR")) {
            yield put(deleteProjectSucceeded({project}));
        }else{
            yield put(deleteProjectFailed(response));
        }
    } finally {
        const msg = `delete user thread closed`;
        yield msg;
    }
}

export function* deleteProjectSaga() {
    yield takeLatest(DELETE_PROJECT_ACTION.DELETE_PROJECT, doDeleteProject);
}
