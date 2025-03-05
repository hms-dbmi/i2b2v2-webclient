/* globals i2b2 */

import {takeLatest, put, call} from "redux-saga/effects";
import {listRequestTableSuccess, listRequestTableError} from "../reducers/requestTableSlice";
import XMLParser from "react-xml-parser";

import {
    LIST_REQUEST_TABLE
} from "../actions";

const getAllExportRequestsListRequest = (username, isAdmin) => {

    let request_type = "CRC_QRY_getQueryMasterList_fromUserId";

    let data = {
        crc_user_type: request_type,
        crc_user_by: username,
        include_query_instance: true,
        master_type_cd_xml: '<master_type_cd>EXPORT</master_type_cd>'
    };
    return i2b2.ajax.CRC.getQueryMasterList_fromUserId(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

const parseAllExportRequestsListXml = (exportRequestListXml) => {
    let exportRequestList = [];

    let queryMasters = exportRequestListXml.getElementsByTagName('query_master');
    queryMasters.forEach(exportRequest => {
        let queryId = exportRequest.getElementsByTagName('query_master_id');
        let queryName = exportRequest.getElementsByTagName('name');
        let dateSubmitted = exportRequest.getElementsByTagName('create_date');
        let userId = exportRequest.getElementsByTagName('user_id');
        let queryInstanceTypeList = exportRequest.getElementsByTagName('query_instance_type');
        if(userId.length > 0 && queryId.length > 0 && queryName.length > 0 && dateSubmitted.length && queryInstanceTypeList.length > 0){
            userId = userId[0].value;
            queryId = queryId[0].value
            queryName = queryName[0].value;
            dateSubmitted = dateSubmitted[0].value;
            let status = '';
            let patientCount = '';
            let lastUpdated = dateSubmitted;
            let requestList = [];
            queryInstanceTypeList.map(queryInstanceType => {
                status = queryInstanceType.getElementsByTagName('batch_mode');
                lastUpdated = queryInstanceType.getElementsByTagName('start_date');
                if(lastUpdated.length === 0){
                    lastUpdated = queryInstanceType.getElementsByTagName('end_date');
                }
                if(lastUpdated.length !== 0){
                    lastUpdated = lastUpdated[0].value;
                }
                let queryResultInstanceTypeList =  queryInstanceType.getElementsByTagName('query_result_instance_type');
                queryResultInstanceTypeList.map(queryResultInstanceType => {
                    patientCount = queryResultInstanceType.getElementsByTagName('set_size');
                   let request = queryResultInstanceType.getElementsByTagName('description');
                   if(request.length > 0){
                       request = request[0].value;
                       request = request.replace('for "' + queryName + '"', "").trim();
                       if(!request.includes("Number of patients")){
                           requestList.push(request);
                       }
                   }
                });
                if(status.length > 0 && patientCount.length > 0){
                    status = status[0].value;
                    patientCount = patientCount[0].value;
                }
            })
            exportRequestList.push({id: queryId, description: queryName, dateSubmitted, lastUpdated, status, patientCount, userId, requests: requestList});
        }
    });

    return exportRequestList;
}

export function* doListRequestTable(action) {
    const { username, isAdmin } = action.payload;

    try {
        let response = yield call(getAllExportRequestsListRequest, username, isAdmin);
        if (!response.error) {
            let dataExportRequestsList = yield parseAllExportRequestsListXml(response);
            let t=0;
            yield put(listRequestTableSuccess({researcherRequests: dataExportRequestsList, isAdmin: isAdmin}));
        }
        else {
            yield put(listRequestTableError({errorMessage: "There was an error getting the list of researcher data export requests"}));
        }
    } catch (error) {
        yield put(listRequestTableError({errorMessage: "There was an error getting the list of researcher data export requests"}));
    }
}


export function* listRequestTableSaga() {
    yield takeLatest(LIST_REQUEST_TABLE, doListRequestTable);
}