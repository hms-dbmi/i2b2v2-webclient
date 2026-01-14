import { call, takeLatest, put} from "redux-saga/effects";
import {getAllUsersFailed, getAllUsersSucceeded} from "../reducers/usersSlice";
import {GET_ALL_USERS} from "../actions";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getAllUsersRequest = () => i2b2.ajax.PM.getAllUser({}).then((xmlString) => parseXml(xmlString));

const parseUsersXml = (allUsersXml) => {
    let users = allUsersXml.getElementsByTagName('user');
    let usersList = [];
    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        let username = user.getElementsByTagName('user_name');
        let fullname = user.getElementsByTagName('full_name');
        let email = user.getElementsByTagName('email');
        let isAdmin = user.getElementsByTagName('is_admin');
        if((username.length !== 0 && username[0].childNodes.length !== 0)
            && (fullname.length !== 0 && fullname[0].childNodes.length !== 0)
            && (isAdmin.length !== 0 && isAdmin[0].childNodes.length))
        {
            username = username[0].childNodes[0].nodeValue;
            fullname = fullname[0].childNodes[0].nodeValue;
            isAdmin = isAdmin[0].childNodes[0].nodeValue;
            usersList.push({username, fullname, email, isAdmin});
        }
    }

    return usersList;
}

export function* doGetAllUsers(action) {
    console.log("getting all users...");
    try {
        const response = yield call(getAllUsersRequest);

        if(response) {
            let userList = parseUsersXml(response);
            yield put(getAllUsersSucceeded(userList));
        }else{
            yield put(getAllUsersFailed(response));
        }
    } finally {
        const msg = `get all users thread closed`;
        yield msg;
    }
}

export function* getAllUsersSaga() {
    yield takeLatest(GET_ALL_USERS, doGetAllUsers);
}
