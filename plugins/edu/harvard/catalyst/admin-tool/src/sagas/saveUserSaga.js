import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    SAVE_USER_ACTION,
    saveUserFailed,
    saveUserSucceeded,
} from "actions";


//a function that returns a promise
const saveUserRequest = (user) => {
    let data = {
        user_name:user.username,
        full_name: user.fullname,
        email: user.email,
        is_admin: user.isAdmin,
    };

    if(user.password && user.password.length > 0){
        data.password = "<password>"+user.password+"</password>";
    }
    return i2b2.ajax.PM.setUser(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

export function* doSaveUser(action) {
    console.log("saving user...");
    const { user } = action.payload;
    console.log("saving user..." + JSON.stringify(user));

    try {
        let response = yield call(saveUserRequest, user);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(saveUserSucceeded({user}));
        }else{
            yield put(saveUserFailed(response));
        }
    } finally {
        const msg = `save user details thread closed`;
        yield msg;
    }
}

export function* saveUserSaga() {
    yield takeLatest(SAVE_USER_ACTION.SAVE_USER, doSaveUser);
}