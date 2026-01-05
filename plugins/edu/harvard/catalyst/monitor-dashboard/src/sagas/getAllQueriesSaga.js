/* globals i2b2 */
import {takeLatest, put, call} from "redux-saga/effects";
import {getAllQueriesSucceeded, getAllQueriesFailed} from "../reducers/queriesSlice";
import {decode} from 'html-entities';

import {
    GET_ALL_QUERIES
} from "../actions";
import {parseXml} from "../utilities/parseXml";

const getAllQueryListRequest = (projectId) => {
    let request_type = "CRC_QRY_getQueryMasterList_fromGroupId";

    let data = {
        crc_max_records: -1,
        crc_user_type: request_type,
        sec_project: projectId,
        crc_user_by: '',
        include_query_instance: true,
       master_type_cd_xml: ''
    };

    return i2b2.ajax.CRC.getQueryMasterList_fromUserId(data).then((xmlString) => parseXml(xmlString)).catch((err) => err);
};

const parseAllQueryListXml = (queryListXml) => {
    let exportRequestList = [];

    let queryMasters = queryListXml.getElementsByTagName('query_master');
    for (let i = 0; i < queryMasters.length; i++) {
        const query = queryMasters[i];
        let queryId = query.getElementsByTagName('query_master_id');
        let queryName = query.getElementsByTagName('name');
        let createDate = query.getElementsByTagName('create_date');
        let userId = query.getElementsByTagName('user_id');
        let queryInstanceTypeList = query.getElementsByTagName('query_instance_type');
        if(userId.length > 0 && userId[0].childNodes.length !== 0
            && queryId.length > 0 &&  queryId[0].childNodes.length !== 0
            && queryName.length > 0 && queryName[0].childNodes.length !== 0
            && createDate.length && createDate[0].childNodes.length !== 0
            && queryInstanceTypeList.length > 0 && queryInstanceTypeList[0].childNodes.length !== 0){
            userId = userId[0].childNodes[0].nodeValue;
            queryId = queryId[0].childNodes[0].nodeValue;
            queryName = decode(queryName[0].childNodes[0].nodeValue);
            createDate = createDate[0].childNodes[0].nodeValue;
            let status = '';
            let patientCount = null;
            let requestList = [];
            let resultInstanceId = null;
            let queryInstanceId = null;
            for (let i = 0; i < queryInstanceTypeList.length; i++) {
                const queryInstanceType = queryInstanceTypeList[0];
                queryInstanceId = queryInstanceType.getElementsByTagName('query_instance_id');
                queryInstanceId = queryInstanceId.length > 0 && queryInstanceId[0].childNodes.length !== 0 ? queryInstanceId[0].childNodes[0].nodeValue : null;
                status = queryInstanceType.getElementsByTagName('batch_mode');
                status = status.length > 0 && status[0].childNodes.length !== 0 ? status[0].childNodes[0].nodeValue : '';
                let queryResultInstanceTypeList =  queryInstanceType.getElementsByTagName('query_result_instance_type');
                for (let i = 0; i < queryResultInstanceTypeList.length; i++) {
                    const queryResultInstanceType = queryResultInstanceTypeList[0];
                    let resultInstanceId =  queryResultInstanceType.getElementsByTagName('result_instance_id');
                    resultInstanceId = resultInstanceId.length > 0 ? resultInstanceId[0].childNodes[0].nodeValue: null;
                    let queryResultType = queryResultInstanceType.getElementsByTagName('query_result_type');

                    let visualAttributeType = null;
                    if(queryResultType.length > 0){
                        queryResultType =  queryResultType[0];
                        visualAttributeType = queryResultType.getElementsByTagName('visual_attribute_type');
                        visualAttributeType = visualAttributeType.length > 0 && visualAttributeType[0].childNodes.length !== 0 ? visualAttributeType[0].childNodes[0].nodeValue : null;
                        let requestId = queryResultType.getElementsByTagName('name');
                        if(requestId.length > 0 && requestId[0].childNodes.length !== 0) {
                            requestId = requestId[0].childNodes[0].nodeValue;
                        }
                        if(requestId === "PATIENT_COUNT_XML"){
                            patientCount = queryResultInstanceType.getElementsByTagName('set_size');
                            patientCount = patientCount.length > 0 && patientCount[0].childNodes.length !== 0 ? patientCount[0].childNodes[0].nodeValue : '';
                        }

                        if(visualAttributeType.toUpperCase() === "LU" || visualAttributeType.toUpperCase() === "LP"
                            || visualAttributeType.toUpperCase() === "LR") {
                            let request = {resultInstanceId};

                            let requestDescription = queryResultType.getElementsByTagName('description');
                            if(requestId.length > 0) {
                                const tableId = parseInt(requestId.replace("RPDO_", ""));
                                if(!isNaN(tableId)){
                                    request.tableId = tableId;
                                    request.isRPDO = requestId.toUpperCase().includes("RPDO_");
                                }
                            }
                            if(requestDescription.length > 0 && requestDescription[0].childNodes.length !== 0) {
                                request.description = decode(requestDescription[0].childNodes[0].nodeValue);
                                requestList.push(request);
                            }
                        }
                    }
                }
            }
            exportRequestList.push({id: queryId, queryName, queryInstanceId, createDate, status, patientCount, userId, requests: requestList, resultInstanceId});
        }
    }

    return exportRequestList;
}

export function* doGetAllQueries(action) {
    const { projectId } = action.payload;

    try {
        let response = yield call(getAllQueryListRequest, projectId);
        if (!response.error) {
            let queryList = yield parseAllQueryListXml(response);
            yield put(getAllQueriesSucceeded({queryList}));
        }
        else {
            yield put(getAllQueriesFailed({errorMessage: "There was an error getting the list of queries for project ", projectId}));
            console.error("There was an error getting the list queries for project ", projectId);
        }
    } catch (error) {
        yield put(getAllQueriesFailed({errorMessage: "There was an error getting the list of queries for project ", projectId}));
        console.error("There was an error getting the list of queries for project ", projectId, " Error: " , error);
    }
}


export function* getAllQueriesSaga() {
    yield takeLatest(GET_ALL_QUERIES, doGetAllQueries);
}