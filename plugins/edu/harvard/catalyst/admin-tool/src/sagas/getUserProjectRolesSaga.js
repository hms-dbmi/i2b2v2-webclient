import {call, put, takeLatest} from "redux-saga/effects";
import { DateTime } from "luxon";
import {GET_USER_PROJECT_ROLES} from "../actions";
import {parseXml} from "../utilities/parseXml";
import {getUserProjectRolesFailed, getUserProjectRolesSucceeded} from "../reducers/userProjectRolesSlice";

const getUserProjectRolesRequest = (username) => {
    let data = {
        user_name: username,
    };

    return i2b2.ajax.PM.getAllUserProjectRole(data).then((xmlString) => parseXml(xmlString)).catch((err) => err);
};

const parseUserProjectRolesXml = (userRoleXml, username) => {
    let roles = userRoleXml.getElementsByTagName('role');

    let userRoleObj = {};
    for (let i = 0; i < roles.length; i++) {
        const userRole = roles[i];
        let projectId = userRole.getElementsByTagName('project_id');
        let usernameElem = userRole.getElementsByTagName('user_name');
        let role = userRole.getElementsByTagName('role');
        let createDate = userRole.getElementsByTagName('create_date');

        if(usernameElem && projectId){
            if((usernameElem.length !== 0 && usernameElem[0].childNodes.length !== 0)
                && (projectId.length !== 0 && projectId[0].childNodes.length !== 0)
                && (role.length !== 0 && role[0].childNodes.length !== 0)
            ){
                projectId = projectId[0].childNodes[0].nodeValue;
                role = role[0].childNodes[0].nodeValue;

                if(!userRoleObj[projectId]){
                    userRoleObj[projectId] = {
                        roles: []
                    };
                }

                if(createDate.length !== 0 && createDate[0].childNodes.length !== 0) {
                    createDate = createDate[0].childNodes[0].nodeValue;
                    createDate = DateTime.fromISO(createDate).toJSDate();

                    if(role.toUpperCase() === "DATA_OBFSC"){
                        userRoleObj[projectId].createDate = createDate;
                    }
                }

                userRoleObj[projectId].roles.push(role);
            }
        }
    }

    return userRoleObj;
}

export function* doGetUserProjectRoles(action) {
    console.log("getting user project roles...");
    const { user } = action.payload;

    try {
        const response = yield call(getUserProjectRolesRequest, user.username);

        if(response) {
            let userProjectRoles = parseUserProjectRolesXml(response, user.username);
            yield put(getUserProjectRolesSucceeded({ userProjectRoles, user}));
        }else{
            console.error("Error retrieving user project roles. ");
            yield put(getUserProjectRolesFailed(response));
        }
    }catch(e){
        console.error("Error retrieving user project roles. ", e);
        yield put(getUserProjectRolesFailed({errorMessage: e}));
    } finally {
        const msg = `get user project roles thread closed`;
        yield msg;
    }
}

export function* getUserProjectRolesSaga() {
    yield takeLatest(GET_USER_PROJECT_ROLES, doGetUserProjectRoles);
}
