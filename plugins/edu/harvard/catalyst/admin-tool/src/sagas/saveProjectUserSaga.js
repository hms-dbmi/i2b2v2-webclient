import {call, takeLatest, put, all} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    getAllProjectParams, getAllProjectUsers,
    SAVE_PROJECT_USER_ACTION, saveProjectDataSourcesFailed, saveProjectDataSourcesSucceeded,
    saveProjectUserFailed,
    saveProjectUserSucceeded,
} from "actions";
import {EDITOR_ROLE} from "../models";

const saveProjectUserRoleRequest = (projectId, username, role) => {

    let data = {
        user_id: username,
        user_role: role,
        project_id: projectId
    };

    return i2b2.ajax.PM.setRole(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

const deleteProjectUserRoleRequest = (projectId, username, role) => {

    let data = {
        user_id: username,
        user_role: role,
        project_id: projectId
    };

    return i2b2.ajax.PM.deleteRole(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doSaveProjectUser(action) {
    const { selectedProject, user, previousRoles } = action.payload;

    console.log("saving user " + user.username + " in project " + selectedProject.project.name + "...");
    try {
        let rolesToSave = [user.adminPath.name, user.dataPath.name];
        if(user.editorPath){
            rolesToSave.push(EDITOR_ROLE);
        }

        const filterRolesToSave = rolesToSave.filter((role) => !previousRoles.includes(role));

        const filteredPreviousRoles = previousRoles.filter((role) => !rolesToSave.includes(role));

        //delete current user roles
        let deletedProjectUserRoleResponse="";
        if(filteredPreviousRoles) {
            deletedProjectUserRoleResponse = yield all(filteredPreviousRoles.map((role) => {
                return call(deleteProjectUserRoleRequest, selectedProject.project.internalId, user.username, role);
            }));
        }
        const deletedProjectUserRolesResults = deletedProjectUserRoleResponse.filter(result => result.msgType === "AJAX_ERROR");
        if(deletedProjectUserRolesResults.length === 0){
            const projectUserRoleResponse = yield all(filterRolesToSave.map((role) => {
                return call(saveProjectUserRoleRequest, selectedProject.project.internalId, user.username, role);
            }));

            const projectUserRolesResults = projectUserRoleResponse.filter(result => result.msgType === "AJAX_ERROR");
            if(projectUserRolesResults.length === 0) {
                yield put(saveProjectUserSucceeded({projectUser: user, selectedProject}));
            }
            else{
                yield put(saveProjectUserFailed(projectUserRoleResponse));
            }
        }else{
            yield put(saveProjectUserFailed(deletedProjectUserRoleResponse));
        }
    } finally {
        const msg = `save project user thread closed`;
        yield msg;
    }
}

export function* saveProjectUserSaga() {
    yield takeLatest(SAVE_PROJECT_USER_ACTION.SAVE_PROJECT_USER, doSaveProjectUser);
}