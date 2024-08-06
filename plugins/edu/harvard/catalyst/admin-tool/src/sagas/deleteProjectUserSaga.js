import {call, takeLatest, put, all} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    getAllProjectUsers,
    DELETE_PROJECT_USER_ACTION,
    deleteProjectUserFailed,
    deleteProjectUserSucceeded,
} from "actions";
import {EDITOR_ROLE} from "../models";

const deleteProjectUserRoleRequest = (projectId, username, role) => {

    let data = {
        user_id: username,
        user_role: role,
        project_id: projectId
    };

    return i2b2.ajax.PM.deleteRole(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doDeleteProjectUser(action) {
    const { selectedProject, user } = action.payload;

    console.log("saving user " + user.username + " in project " + selectedProject.project.name + "...");
    try {
        let rolesToDelete = [user.adminPath.name, user.dataPath.name];
        if(user.editorPath){
            rolesToDelete.push(EDITOR_ROLE);
        }

        //delete current user roles
        let deletedProjectUserRoleResponse= yield all(rolesToDelete.map((role) => {
            return call(deleteProjectUserRoleRequest, selectedProject.project.internalId, user.username, role);
        }));

        const deletedProjectUserRolesResults = deletedProjectUserRoleResponse.filter(result => result.msgType === "AJAX_ERROR");
        if(deletedProjectUserRolesResults.length === 0){
            yield put(getAllProjectUsers({project: selectedProject.project}));
            yield put(deleteProjectUserSucceeded({projectUser: user, selectedProject}));
        }else{
            yield put(deleteProjectUserFailed(deletedProjectUserRoleResponse));
        }
    } finally {
        const msg = `delete project user thread closed`;
        yield msg;
    }
}

export function* deleteProjectUserSaga() {
    yield takeLatest(DELETE_PROJECT_USER_ACTION.DELETE_PROJECT_USER, doDeleteProjectUser);
}