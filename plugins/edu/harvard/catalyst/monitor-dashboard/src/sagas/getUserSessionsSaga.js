import { call, takeLatest, put} from "redux-saga/effects";
import { DateTime } from "luxon";
import {
    GET_USER_SESSIONS,
} from "../actions";
import {
    getUserSessionsFailed,
    getUserSessionsSucceeded,
} from "../reducers/userSessionsSlice";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getUserSessionsRequest = () => i2b2.ajax.PM.getUserSession({}).then((xmlString) => parseXml(xmlString));

const parseUserSessionsXml = (userSessionsXml) => {
    let sessions = userSessionsXml.getElementsByTagName('user_login');
    let sessionsList = [];
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

                entryDate = entryDate[0].childNodes[0].nodeValue;
                entryDate = DateTime.fromISO(entryDate).toJSDate();
                if(expireDate.length !== 0 && expireDate[0].childNodes.length  !== 0) {
                    expireDate = expireDate[0].childNodes[0].nodeValue;
                    expireDate = DateTime.fromISO(expireDate).toJSDate();
                }
                else{
                    expireDate = "";
                }

                sessionsList.push({id, name, entryDate, expireDate});
            }
        }
    }

    return sessionsList;
}

export function* doGetUserSessions(action) {
    console.log("getting user sessions...");
    try {
        const response = yield call(getUserSessionsRequest);

        if(response) {
            let userSessionList = parseUserSessionsXml(response);
            yield put(getUserSessionsSucceeded(userSessionList));
        }else{
            yield put(getUserSessionsFailed(response));
        }
    } finally {
        const msg = `get user sessions thread closed`;
        yield msg;
    }
}

export function* getUserSessionsSaga() {
    yield takeLatest(GET_USER_SESSIONS, doGetUserSessions);
}
