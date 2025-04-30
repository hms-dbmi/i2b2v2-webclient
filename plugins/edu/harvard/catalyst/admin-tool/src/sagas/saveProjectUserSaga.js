import {call, takeLatest, put, all} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    getAllProjectUsers,
    SAVE_PROJECT_USER_ACTION,
    saveProjectUserFailed,
    saveProjectUserSucceeded,
} from "actions";
import {ADMIN_ROLES, DATA_ROLES, EDITOR_ROLE} from "../models";

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
    const { user, selectedProject, isNew } = action.payload;

    console.log("saving user " + user.username + " in project " + selectedProject.project.name + "...");
    try {
        let rolesToSave = [user.adminPath.name, user.dataPath.name];
        let rolesToDelete = [ADMIN_ROLES.USER.name, DATA_ROLES.DATA_OBFSC.name];
        if(user.editorPath === "true"){
            rolesToSave.push(EDITOR_ROLE);
        }else{
            rolesToDelete.push(EDITOR_ROLE);
        }

        //delete current user roles
        let deletedProjectUserRoleResponse = [];
        if(!isNew) {
            deletedProjectUserRoleResponse = yield all(rolesToDelete.map((role) => {
                return call(deleteProjectUserRoleRequest, selectedProject.project.internalId, user.username, role);
            }));
        }

        const deletedProjectUserRolesErrors = deletedProjectUserRoleResponse.filter(result => result.msgType === "AJAX_ERROR");

        if(isNew || deletedProjectUserRolesErrors.length === 0){
            const projectUserRoleResponse = yield all(rolesToSave.map((role) => {
                return call(saveProjectUserRoleRequest, selectedProject.project.internalId, user.username, role);
            }));

            const projectUserRolesResults = projectUserRoleResponse.filter(result => result.msgType === "AJAX_ERROR");
            if(projectUserRolesResults.length === 0) {
                yield put(getAllProjectUsers({project: selectedProject.project}));
                yield put(saveProjectUserSucceeded({projectUser: user, selectedProject}));
            }
            else{
                yield put(saveProjectUserFailed({projectUser: user, selectedProject}));
            }
        }else{
            yield put(saveProjectUserFailed({projectUser: user}));
        }
    } finally {
        const msg = `save project user thread closed`;
        yield msg;
    }
}

export function* saveProjectUserSaga() {
    yield takeLatest(SAVE_PROJECT_USER_ACTION.SAVE_PROJECT_USER, doSaveProjectUser);
}