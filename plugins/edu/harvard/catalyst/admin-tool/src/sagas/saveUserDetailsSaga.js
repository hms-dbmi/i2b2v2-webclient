import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    SAVE_USER_DETAILS_ACTION,
    saveUserDetailsFailed,
    saveUserDetailsSucceeded,
} from "actions";

const saveParamRequest = (username, param) => {

    let t="";
    /*if (updateRow.id) {
        var t = 'id="'+updateRow.id+'"';
    } else {
        var t = "";
    }*/

    const msg_xml = '<user_name>'+username
        +'</user_name><param '
        +t+' datatype="'+ param.dataType
        +'" name="'+param.name+'">'
        +param.value
        +'</param>';

    let data = {
        table: "user_param",
        msg_attrib: "",
        msg_xml: msg_xml
    };

    return i2b2.ajax.PM.setParam(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

//a function that returns a promise
const saveUserRequest = (user) => {
    let data = {
        user_name:user.username,
        full_name: user.fullname,
        email: user.email,
        is_admin: user.isAdmin,
    };

    if(user.password && user.password.length > 0){
        data.push(user.password);
    }
    return i2b2.ajax.PM.setUser(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

export function* doSaveUserDetails(action) {
    console.log("saving user details...");
    const { user } = action.payload;
    console.log("saving user details..." + JSON.stringify(action));

    try {
        const response = yield call(saveUserRequest, user.user);

        if(response) {
            //save user data then save params data
            let saveParamsResponse;
            if(user.params.length > 0) {

                const saveParamsResults = yield all(user.params.map((param) => {
                    return call(saveParamRequest, user.username, param);
                }));

                const paramErrorResults = saveParamsResults.filter(result => result.msgType === "AJAX_ERROR");
                if(paramErrorResults.length === 0){
                    yield put(saveUserDetailsSucceeded());
                }else{
                    yield put(saveUserDetailsFailed());
                }

            }else{
                yield put(saveUserDetailsSucceeded());
            }
        }else{
            yield put(saveUserDetailsFailed(response));
        }
    } finally {
        const msg = `save user details thread closed`;
        yield msg;
    }
}

export function* saveUserDetailsSaga() {
    yield takeLatest(SAVE_USER_DETAILS_ACTION.SAVE_USER_DETAILS, doSaveUserDetails);
}