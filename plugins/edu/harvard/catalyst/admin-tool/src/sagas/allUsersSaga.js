import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {GET_ALL_USERS} from "../actions"
import {
    getAllUsersFailed,
    getAllUsersSucceeded,
} from "../reducers/allUsersSlice";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getAllUsersRequest = () => i2b2.ajax.PM.getAllUser({}).then((xmlString) => new XMLParser().parseFromString(xmlString));

const parseUsersXml = (allUsersXml, usersSessions) => {
    let users = allUsersXml.getElementsByTagName('user');
    let usersList = [];
    users.forEach(user => {
        let username = user.getElementsByTagName('user_name');
        let fullname = user.getElementsByTagName('full_name');
        let email = user.getElementsByTagName('email');
        let isAdmin = user.getElementsByTagName('is_admin');
        if(fullname.length !== 0){
            fullname = fullname[0].value;
            if(email.length !== 0){
                email = email[0].value;
            }else{
                email = "";
            }
            if(username.length !== 0){
                username = username[0].value;
                if(isAdmin.length !== 0){
                    isAdmin = isAdmin[0].value === "true";
                    const isActive = usersSessions[username] !== undefined;
                    usersList.push({username, fullname, email, isAdmin, isActive});
                }
            }
        }
    })

    return usersList;
}

const getUserSessionsRequest = () => i2b2.ajax.PM.getUserSession({}).then((xmlString) => parseXml(xmlString));

const parseUserSessionsXml = (userSessionsXml) => {
    let sessions = userSessionsXml.getElementsByTagName('user_login');
    let sessionsObj = {};
    for (let i = 0; i < sessions.length; i++) {
        const session = sessions[i];
        let id = session.attributes['id'].nodeValue;
        let name = session.getElementsByTagName('user_name');
        let entryDate = session.getElementsByTagName('entry_date');
        let expireDate = session.getElementsByTagName('expire_date');
        if(name){
            if((name.length !== 0 && name[0].childNodes.length !== 0)
                && (entryDate.length !== 0 && entryDate[0].childNodes.length !== 0)){
                name = name[0].childNodes[0].nodeValue;

                if(sessionsObj[name]) {
                    sessionsObj[name].push({id});
                }else{
                    sessionsObj[name] = [{id}];
                }
            }
        }
    }

    return sessionsObj;
}

export function* doGetAllUsers(action) {
    console.log("getting all users...");
    try {
        const [allUsersResponse, allUserSessionsResponse] = yield all([
            call(getAllUsersRequest),
            call(getUserSessionsRequest),
        ]);

        if(allUsersResponse && allUserSessionsResponse) {
            let userSessions = parseUserSessionsXml(allUserSessionsResponse);
            let usersList = parseUsersXml(allUsersResponse, userSessions);

            yield put(getAllUsersSucceeded(usersList));
        }else{
            yield put(getAllUsersFailed(response));
        }
    } finally {
        const msg = `get all users thread closed`;
        yield msg;
    }
}

export function* allUsersSaga() {
    yield takeLatest(GET_ALL_USERS, doGetAllUsers);
}
