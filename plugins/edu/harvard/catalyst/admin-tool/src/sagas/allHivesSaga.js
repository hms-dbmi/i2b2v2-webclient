import { call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_HIVES_ACTION,
    getAllHivesFailed,
    getAllHivesSucceeded,
} from "actions";

//a function that returns a promise
const getAllHivesRequest = () => i2b2.ajax.PM.getAllHive({}).then((xmlString) => new XMLParser().parseFromString(xmlString));

const parseHivesXml = (hivesXml) => {
    let hives = hivesXml.getElementsByTagName('hive');
    let hivesList = [];
    hives.map(hive => {
        let environment = hive.getElementsByTagName('environment');
        let helpUrl = hive.getElementsByTagName('helpURL');
        let domainName = hive.getElementsByTagName('domain_name');
        let domainId = hive.getElementsByTagName('domain_id');
        let active = hive.getElementsByTagName('active');

        if(environment.length !== 0){
            environment = environment[0].value;

            if(helpUrl.length !== 0) {
                helpUrl = helpUrl[0].value;
            }else{
                helpUrl = "";
            }
            if(domainName.length !== 0) {
                domainName = domainName[0].value;

                if(domainId.length !== 0) {
                    domainId = domainId[0].value;
                    if(active.length !== 0) {
                        active = active[0].value === "true";
                        hivesList.push({environment, helpUrl, domainName, domainId, active});
                    }
                }
            }
        }
    })

    return hivesList;
}

export function* doGetAllHives(action) {
    console.log("getting all hives...");
    try {
        const response = yield call(getAllHivesRequest);

        if(response) {
            let hivesList = parseHivesXml(response);
            yield put(getAllHivesSucceeded(hivesList));
        }else{
            yield put(getAllHivesFailed(response));
        }
    } finally {
        const msg = `get all hives thread closed`;
        yield msg;
    }
}

export function* allHivesSaga() {
    yield takeLatest(GET_ALL_HIVES_ACTION.GET_ALL_HIVES, doGetAllHives);
}
