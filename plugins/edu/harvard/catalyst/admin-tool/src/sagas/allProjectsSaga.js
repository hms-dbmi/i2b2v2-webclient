import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_PROJECTS_ACTION,
    getAllProjectsFailed,
    getAllProjectsSucceeded,
} from "actions";

//a function that returns a promise
const getAllUsersActions = () => i2b2.ajax.PM.getAllProject({}).then((xmlString) => new XMLParser().parseFromString(xmlString));

const parseProjectsXml = (projectsXml) => {
    let projects = projectsXml.getElementsByTagName('project');
    let projectsList = [];
    projects.map(project => {
        let id = project.attributes['id'];
        let name = project.getElementsByTagName('name');
        let key = project.getElementsByTagName('description');
        let description = project.getElementsByTagName('key');
        let wiki = project.getElementsByTagName('wiki');
        let path = project.getElementsByTagName('path');
        if(id){
            if(name.length !== 0){
                name = name[0].value;

                if(description.length !== 0) {
                    description = description[0].value;
                }
                else{
                    description = "";
                }
                if(key.length !== 0) {
                    key = key[0].value;
                }
                else{
                    key = "";
                }
                if(wiki.length !== 0) {
                    wiki = wiki[0].value;
                }else{
                    wiki = "";
                }
                if(path.length !== 0) {
                    path = path[0].value;
                    projectsList.push({id, name, description, key, wiki, path});
                }
            }
        }
    })

    return projectsList;
}

export function* doGetAllProjects(action) {
    console.log("getting all projects...");
    try {
        const response = yield call(getAllUsersActions);

        if(response) {
            let usersList = parseProjectsXml(response);
            yield put(getAllProjectsSucceeded(usersList));
        }else{
            yield put(getAllProjectsFailed(response));
        }
    } finally {
        const msg = `get all users thread closed`;
        yield msg;
    }
}

export function* allProjectsSaga() {
    yield takeLatest(GET_ALL_PROJECTS_ACTION.GET_ALL_PROJECTS, doGetAllProjects);
}
