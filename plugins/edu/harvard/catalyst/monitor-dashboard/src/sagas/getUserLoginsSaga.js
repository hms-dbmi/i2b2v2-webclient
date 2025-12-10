import { call, takeLatest, put} from "redux-saga/effects";
import { DateTime } from "luxon";
import {
    GET_USER_LOGINS,
} from "../actions";
import {
    getUserLoginsFailed,
    getUserLoginsSucceeded,
} from "../reducers/userLoginsSlice";
import {parseXml} from "../utilities/parseXml";

//a function that returns a promise
const getUserLoginsRequest = (loginsSinceInDays) => {
    let data = {};

    if(loginsSinceInDays !== undefined) {
        const now = DateTime.now();
        const nDaysAgo = now.minus({ days: loginsSinceInDays });

        console.log("nDaysAge iso " + nDaysAgo.toISO());
        console.log("nDaysAge " + nDaysAgo.toJSON());
        data.entry_date_xml = '<entry_date>' + nDaysAgo.toISO() + '</entry_date>';
    }

    return i2b2.ajax.PM.getUserLogin(data).then((xmlString) => {return parseXml(xmlString);});
}


const parseUserLoginsXml = (userLoginsXml) => {
    let userLogins = userLoginsXml.getElementsByTagName('user_login');

    let userLoginsList = [];
    for (let i = 0; i < userLogins.length; i++) {
        const userLogin = userLogins[i];
        let name = userLogin.getElementsByTagName('user_name');
        let entryDate = userLogin.getElementsByTagName('entry_date');
        let attempt = userLogin.getElementsByTagName('attempt');

        if(name){
            if((name.length !== 0 && name[0].childNodes.length !== 0)
                && (entryDate.length !== 0 && entryDate[0].childNodes.length !== 0)){
                name = name[0].childNodes[0].nodeValue;

                entryDate = entryDate[0].childNodes[0].nodeValue;
                entryDate = DateTime.fromISO(entryDate).toJSDate();
                if(attempt.length !== 0 && attempt[0].childNodes.length  !== 0) {
                    attempt = attempt[0].childNodes[0].nodeValue;
                }

                userLoginsList.push({name, entryDate, attempt});
            }
        }
    }

    return userLoginsList;
}

export function* doGetUserLogins(action) {
    console.log("getting user logins...");
    const { loginsSinceInDays } = action.payload;

    try {
        const response = yield call(getUserLoginsRequest, loginsSinceInDays);

        if(response) {
            const userLoginList = parseUserLoginsXml(response);
            yield put(getUserLoginsSucceeded(userLoginList));
        }else{
            console.log("failed login " + response);
            yield put(getUserLoginsFailed(response));
        }
    } catch(e) {
        console.error("Error getting user logins! Message: " + error);
        yield put(getUserLoginsFailed({errorMessage: "There was an error getting user logins."}));
    }
    finally {
        const msg = `get user logins thread closed`;
        yield msg;
    }
}

export function* getUserLoginsSaga() {
    yield takeLatest(GET_USER_LOGINS, doGetUserLogins);
}
