import { call, takeLatest, put} from "redux-saga/effects";
import {getNewUsersFailed, getNewUsersSucceeded} from "../reducers/newUsersSlice";
import {GET_NEW_USERS} from "../actions";
import {parseXml} from "../utilities/parseXml";
import {DateTime} from "luxon";

//a function that returns a promise
const getAllUsersRequest = (newUsersSinceInDays, projectId) => {
    let data = {};

    if(newUsersSinceInDays !== undefined) {
        const now = DateTime.now();
        const nDaysAgo = now.minus({ days: newUsersSinceInDays });
        data.entry_date_xml = '<entry_date>' + nDaysAgo.toISO() + '</entry_date>';
    }

    if(projectId){
        data.sec_project = projectId;
    }else{
        data.sec_project = "@"
    }

    return i2b2.ajax.PM.getAllUser(data).then((xmlString) => parseXml(xmlString));
}

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

export function* doGetNewUsers(action) {
    console.log("getting new users...");
    const { newUsersSinceInDays, projectId } = action.payload;

    try {
        const response = yield call(getAllUsersRequest, newUsersSinceInDays, projectId);

        if(response) {
            let userList = parseUsersXml(response);
            yield put(getNewUsersSucceeded(userList));
        }else{
            yield put(getNewUsersFailed(response));
        }
    } finally {
        const msg = `get new users thread closed`;
        yield msg;
    }
}

export function* getNewUsersSaga() {
    yield takeLatest(GET_NEW_USERS, doGetNewUsers);
}
