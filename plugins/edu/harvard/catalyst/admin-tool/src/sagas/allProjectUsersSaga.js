import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_PROJECT_USERS_ACTION,
    getAllProjectUsersFailed,
    getAllProjectUsersSucceeded,
} from "actions";

import {ADMIN_ROLE, DATA_ROLE} from "models";

//a function that returns a promise
const getAllProjectUsersRequest = (projectId) => {
    let data = {
        id:projectId
    };

    return i2b2.ajax.PM.getAllRole(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

const parseUserRolesXml = (xml) => {
    let roles = xml.getElementsByTagName('role');
    let userRolesMap  = {};

    roles.forEach((userRole) => {
        let username = userRole.getElementsByTagName('user_name');
        let role = userRole.getElementsByTagName('role');
        if(username.length !== 0 ) {
            username = username[0].value;
            if (userRolesMap[username] === undefined){
                userRolesMap[username] = {} ;
            }
            if (role.length > 1) {
                role = role[1].value;
                if(role === ADMIN_ROLE.USER.name || role === ADMIN_ROLE.MANAGER.name) {
                    if (userRolesMap[username].adminRole ===  undefined
                        ||(userRolesMap[username].adminRole.order > ADMIN_ROLE[role].order)) {
                        userRolesMap[username].adminRole = ADMIN_ROLE[role];
                    }
                }

                if(role === DATA_ROLE.DATA_PROT.name
                    ||  role === DATA_ROLE.DATA_DEID.name
                    ||  role === DATA_ROLE.DATA_LDS.name
                    ||  role === DATA_ROLE.DATA_AGG.name
                    ||  role === DATA_ROLE.DATA_OBFSC.name) {
                    if (!userRolesMap[username].dataRole
                    || userRolesMap[username].dataRole.order > DATA_ROLE[role].order) {
                        userRolesMap[username].dataRole = DATA_ROLE[role];
                    }
                }
            }
        }
    });

    let userRolesList = Object.entries(userRolesMap).map(([username, roles]) => {
       return {
           username: username,
           adminPath: roles.adminRole,
           dataPath: roles.dataRole
       }
    });

    return userRolesList;
}

export function* doGetAllProjectUsers(action) {
    const { project } = action.payload;

    console.log("getting all users for project " + project.name + "...");

    try {
        const response = yield call(getAllProjectUsersRequest, project.internalId);

        if(response) {
            let userRolesList = parseUserRolesXml(response);
            yield put(getAllProjectUsersSucceeded({project: project, users: userRolesList}));
        }else{
            yield put(getAllProjectUsersFailed(response));
        }
    } finally {
        const msg = `get all project params thread closed`;
        yield msg;
    }
}

export function* allProjectUsersSaga() {
    yield takeLatest(GET_ALL_PROJECT_USERS_ACTION.GET_ALL_PROJECT_USERS, doGetAllProjectUsers);
}
