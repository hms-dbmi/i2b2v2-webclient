import {call, put, takeLatest} from "redux-saga/effects";
import {getAllUserRoleCountsFailed, getAllUserRoleCountsSucceeded} from "../reducers/userRoleCountsSlice";
import {GET_ALL_USER_ROLE_COUNTS} from "../actions";
import {parseXml} from "../utilities/parseXml";

const getAllUserRoleCountsListRequest = (projectId) => {
    let data = {
        count_type: "project",
        project_id_xml: ""
    };

    if(projectId){
        data.project_id_xml = "<project_id>" + projectId + "</project_id>"
    }

    return i2b2.ajax.PM.getAllRole(data).then((xmlString) => parseXml(xmlString)).catch((err) => err);
};

const parseUserRoleCountsXml = (userRoleXml) => {
    let roles = userRoleXml.getElementsByTagName('role');

    let userRoleCountsList = [];
    for (let i = 0; i < roles.length; i++) {
        const userRole = roles[i];
        let projectId = userRole.getElementsByTagName('project_id');
        let role = userRole.getElementsByTagName('role');
        let count = userRole.getElementsByTagName('count');

        if(projectId){
            if((projectId.length !== 0 && projectId[0].childNodes.length !== 0)
                && (role.length !== 0 && role[0].childNodes.length !== 0)
                && (count.length !== 0 && count[0].childNodes.length))
            {
                projectId = projectId[0].childNodes[0].nodeValue;
                role = role[0].childNodes[0].nodeValue;
                count = count[0].childNodes[0].nodeValue;
                userRoleCountsList.push({projectId, role, count});
            }
        }
    }

    return userRoleCountsList;
}

export function* doGetAllUserRoleCounts(action) {
    console.log("getting all user role counts...");
    try {
        const response = yield call(getAllUserRoleCountsListRequest);

        if(response) {
            let userRoleCountsList = parseUserRoleCountsXml(response);
            yield put(getAllUserRoleCountsSucceeded(userRoleCountsList));
        }else{
            console.error("Error retrieving user role counts. ");
            yield put(getAllUserRoleCountsFailed(response));
        }
    }catch(e){
        console.error("Error retrieving user role counts. ", e);
        yield put(getAllUserRoleCountsFailed({errorMessage: e}));
    } finally {
        const msg = `get all user role counts thread closed`;
        yield msg;
    }
}

export function* getAllUserRoleCountsSaga() {
    yield takeLatest(GET_ALL_USER_ROLE_COUNTS, doGetAllUserRoleCounts);
}
