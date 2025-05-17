/* globals i2b2 */

import {takeLatest, put, call} from "redux-saga/effects";
import {listRequestTableSuccess, listRequestTableError} from "../reducers/requestTableSlice";
import XMLParser from "react-xml-parser";
import {decode} from 'html-entities';

import {
    LIST_REQUEST_TABLE
} from "../actions";

const getAllExportRequestsListRequest = (username, isManager, isAdmin) => {

    let request_type = "CRC_QRY_getQueryMasterList_fromUserId";

    if(isManager || isAdmin){
        request_type = "CRC_QRY_getQueryMasterList_fromGroupId";
    }

    let data = {
        crc_max_records: -1,
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
            queryId = queryId[0].value;
            queryName = decode(queryName[0].value);
            dateSubmitted = dateSubmitted[0].value;
            let status = '';
            let patientCount = null;
            let requestList = [];
            let resultInstanceId = null;
            let queryInstanceId = null;
            queryInstanceTypeList.forEach(queryInstanceType => {
                queryInstanceId = queryInstanceType.getElementsByTagName('query_instance_id');
                queryInstanceId = queryInstanceId.length > 0 ? queryInstanceId[0].value : null;
                status = queryInstanceType.getElementsByTagName('batch_mode');
                status = status.length > 0 ? status[0].value : '';
                let queryResultInstanceTypeList =  queryInstanceType.getElementsByTagName('query_result_instance_type');
                queryResultInstanceTypeList.forEach(queryResultInstanceType => {
                    let resultInstanceId =  queryResultInstanceType.getElementsByTagName('result_instance_id');
                    resultInstanceId = resultInstanceId.length > 0 ? resultInstanceId[0].value: null;
                    patientCount = queryResultInstanceType.getElementsByTagName('set_size');
                    patientCount = patientCount.length > 0 ? patientCount[0].value : '';
                    let queryResultType = queryResultInstanceType.getElementsByTagName('query_result_type');

                    let visualAttributeType = null;
                    if(queryResultType.length > 0){
                        queryResultType =  queryResultType[0];
                        visualAttributeType = queryResultType.getElementsByTagName('visual_attribute_type');
                        visualAttributeType = visualAttributeType.length > 0 ? visualAttributeType[0].value : null;
                        if(visualAttributeType.toUpperCase() === "LU" || visualAttributeType.toUpperCase() === "LP"
                         || visualAttributeType.toUpperCase() === "LR") {
                            let request = {resultInstanceId};
                            const requestId = queryResultType.getElementsByTagName('name');
                            let requestDescription = queryResultType.getElementsByTagName('description');
                            if(requestId.length > 0 ) {
                                const tableId = parseInt(requestId[0].value.replace("RPDO_", ""));
                                if(!isNaN(tableId)){
                                    request.tableId = tableId;
                                }
                            }
                            if(requestDescription.length > 0) {
                                request.description = decode(requestDescription[0].value);
                                requestList.push(request);
                            }
                        }
                    }
                });
            });

            exportRequestList.push({id: queryId, description: queryName, queryInstanceId, dateSubmitted, status, patientCount, userId, requests: requestList, resultInstanceId});
        }
    });

    return exportRequestList;
}

export function* doListRequestTable(action) {
    const { username, isManager, isAdmin } = action.payload;

    try {
        let response = yield call(getAllExportRequestsListRequest, username, isManager, isAdmin);
        if (!response.error) {
            let dataExportRequestsList = yield parseAllExportRequestsListXml(response);
            yield put(listRequestTableSuccess({researcherRequests: dataExportRequestsList, isManager, isAdmin}));
        }
        else {
            yield put(listRequestTableError({errorMessage: "There was an error getting the list of researcher data export requests"}));
            console.error("There was an error getting the list of researcher data export requests");
        }
    } catch (error) {
        yield put(listRequestTableError({errorMessage: "There was an error getting the list of researcher data export requests"}));
        console.error("There was an error getting the list of researcher data export requests");
    }
}


export function* listRequestTableSaga() {
    yield takeLatest(LIST_REQUEST_TABLE, doListRequestTable);
}