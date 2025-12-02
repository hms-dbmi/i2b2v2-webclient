import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_ALL_PROJECTS,
} from "../actions";

import {
    getAllProjectsFailed,
    getAllProjectsSucceeded,
} from "../reducers/projectsSlice";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getAllProjectsRequest = () => i2b2.ajax.PM.getAllProject({}).then((xmlString) => parseXml(xmlString));

const parseProjectsXml = (projectsXml) => {
    let projects = projectsXml.getElementsByTagName('project');
    let projectsList = [];
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        let id = project.attributes['id'].nodeValue;
        let name = project.getElementsByTagName('name');
        let description = project.getElementsByTagName('description');
        let key = project.getElementsByTagName('key');
        let path = project.getElementsByTagName('path');
        if(name){
            if(name.length !== 0 && name[0].childNodes.length !== 0){
                name = name[0].childNodes[0].nodeValue;

                if(description.length !== 0 && description[0].childNodes.length !== 0) {
                    description = description[0].childNodes[0].nodeValue;
                }
                else{
                    description = "";
                }
                if(key.length !== 0 && key[0].childNodes.length  !== 0) {
                    key = key[0].childNodes[0].nodeValue;
                }
                else{
                    key = "";
                }

                if(path.length !== 0 && path[0].childNodes.length  !== 0) {
                    path = path[0].childNodes[0].nodeValue;
                    projectsList.push({id, name, description, key, path});
                }
            }
        }
    }

    return projectsList;
}

export function* doGetAllProjects(action) {
    console.log("getting all projects...");
    try {
        const response = yield call(getAllProjectsRequest);

        if(response) {
            let projectsList = parseProjectsXml(response);
            yield put(getAllProjectsSucceeded(projectsList));
        }else{
            yield put(getAllProjectsFailed(response));
        }
    } finally {
        const msg = `get all projects thread closed`;
        yield msg;
    }
}

export function* getAllProjectsSaga() {
    yield takeLatest(GET_ALL_PROJECTS, doGetAllProjects);
}
