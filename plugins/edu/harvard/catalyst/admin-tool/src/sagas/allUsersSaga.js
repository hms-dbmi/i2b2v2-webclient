import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_USERS_ACTION,
    getAllUsersFailed,
    getAllUsersSucceeded,
} from "actions";

//a function that returns a promise
const getAllUsersActions = () => i2b2.ajax.PM.getAllUser({}).then((xmlString) => new XMLParser().parseFromString(xmlString));

const parseUsersXml = (allUsersXml) => {
    let users = allUsersXml.getElementsByTagName('user');
    let usersList = [];
    users.map(user => {
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
                    usersList.push({username, fullname, email, isAdmin});
                }
            }
        }
    })

    return usersList;
}

export function* doGetAllUsers(action) {
    console.log("getting all users...");
    try {
        const response = yield call(getAllUsersActions);

        if(response) {
            let usersList = parseUsersXml(response);
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
    yield takeLatest(GET_ALL_USERS_ACTION.GET_ALL_USERS, doGetAllUsers);
}
