import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    SAVE_HIVE_DOMAIN_ACTION,
    SAVE_USER_ACTION, saveHiveDomainFailed, saveHiveDomainSucceeded,
    saveUserFailed,
    saveUserSucceeded,
} from "actions";


//a function that returns a promise
const saveDomainSettingsRequest = (hiveDomain) => {
   // i2b2.PM.ajax.setHive("PM:Admin", {domain_id:updateRow.domain_id, domain_name:updateRow.domain_name, environment:updateRow.environment, helpURL:updateRow.helpURL}, i2b2.PM.view.admin.refreshScreen);

    let data = {
        domain_id:hiveDomain.domainId,
        domain_name: hiveDomain.domainName,
        environment: hiveDomain.environment,
        helpURL: hiveDomain.helpURL,
    };

    return i2b2.ajax.PM.setHive(data).then((xmlString) => new XMLParser().parseFromString(xmlString));
};

export function* doSaveHiveDomainSettings(action) {
    const { hiveDomain } = action.payload;
    console.log("saving hive domain settings...");

    try {
        let response = yield call(saveDomainSettingsRequest, hiveDomain);
        response = JSON.stringify(response);

        if(!response.includes("AJAX_ERROR")) {
            yield put(saveHiveDomainSucceeded({hiveDomains: [hiveDomain]}));
        }else{
            yield put(saveHiveDomainFailed(response));
        }
    } finally {
        const msg = `save hive domain settings thread closed`;
        yield msg;
    }
}

export function* saveHiveDomainSettingsSaga() {
    yield takeLatest(SAVE_HIVE_DOMAIN_ACTION.SAVE_HIVE_DOMAIN, doSaveHiveDomainSettings);
}