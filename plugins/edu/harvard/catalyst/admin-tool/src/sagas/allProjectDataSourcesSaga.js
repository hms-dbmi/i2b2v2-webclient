import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_PROJECT_DATASOURCES_ACTION,
    getAllProjectDataSourcesFailed,
    getAllProjectDataSourcesSucceeded,
    updateAllProjectDataSourcesUrl
} from "actions";
import {CELL_ID} from "../models";

//a function that returns a promise
const getAllCellRequest = (projectPath) => {
    let data = {
        sec_project: projectPath
    };
    return i2b2.ajax.PM.getAllCell({data}).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

//a function that returns a promise
const getDataSourceRequest = (cellId, cellURL, projectPath) => {
    const sec_version = cellId === "IM" ? "" : "1.1/";

    const sec_cell = cellId === CELL_ID.CRC ? cellId.toLowerCase() + "/pdo" : cellId.toLowerCase();

    projectPath = projectPath.substring(1) + "/";
    let data = {
        sec_url: cellURL,
        sec_cell: sec_cell,
        sec_version: sec_version,
        id_xml: projectPath
    };

    return i2b2.ajax.PM.getDBLookup(data).then((xmlString) => {
        return {
            cellId: cellId,
            cellURL: cellURL,
            response: new XMLParser().parseFromString(xmlString)
        }
    }).catch((err) => err);
};

const parseCellXml = (xml) => {
    let cells = xml.getElementsByTagName('cell_data');
    let cellList = [];
    cells.forEach((cell) => {
        let id = cell.attributes['id'].toUpperCase();
        let name = cell.getElementsByTagName('name');
        let url = cell.getElementsByTagName('url');
        let cellProjectPath = cell.getElementsByTagName('project_path');
        if(id === CELL_ID.CRC || id === CELL_ID.ONT || id === CELL_ID.WORK) {
            if(name.length !== 0){
                name = name[0].value;
                if(url.length !== 0){
                    url = url[0].value;
                    if(cellProjectPath.length !== 0){
                        cellProjectPath = cellProjectPath[0].value;
                        cellList.push({
                            id: id,
                            name: name,
                            url: url,
                            projectPath: cellProjectPath
                        });
                    }
                }
            }
        }
    });
    return cellList;
}

const findMatchingCellUrlForProject = (cellList, projectPath) => {

    let matchingCell;
    const projectPathSplit = projectPath.split("/");
    let maxMatchCount = 0;

    cellList.forEach(cell => {
        const cellProjectPathSplit = cell.projectPath.split("/");
        const length = Math.min(cellProjectPathSplit.length, projectPathSplit.length);

        let matchCount = 0;
        for(let i=0;i < length; i++){
            if(cellProjectPathSplit[i] === projectPathSplit[i] && matchCount === i){
                matchCount++;
            }
        }
        if(matchCount > maxMatchCount){
            maxMatchCount = matchCount;
            matchingCell = cell;
        }
    })

    return matchingCell;
}

const parseDataSourceXmlStatus = (xml) => {
    let response_header = xml.getElementsByTagName('response_header');
    let statusValue = "";
    if(response_header.length > 0){
        response_header = response_header[0];
        let result_status = response_header.getElementsByTagName('result_status');
        if(result_status.length > 0){
            result_status = result_status[0];
            let status = result_status.getElementsByTagName('status');
            if(status.length > 0){
                statusValue = status[0].value;
            }
        }
    }

    return statusValue;
}

const parseDataSourceXml = (cellId, cellURL, xml) => {
    let dblookups = xml.getElementsByTagName('dblookup');
    let dataSource = {};

    if(dblookups.length === 0){
        dataSource = {
            cellId: cellId,
            cellURL: cellURL,
        };
    }
    else {
        dblookups.forEach((dblookup) => {
            let dataSourceProjectPath = dblookup.attributes['project_path'];
            let name = dblookup.getElementsByTagName('db_nicename');
            let dbSchema = dblookup.getElementsByTagName('db_fullschema');
            let jndiDataSource = dblookup.getElementsByTagName('db_datasource');
            let dbServerType = dblookup.getElementsByTagName('db_servertype');
            let ownerId = dblookup.getElementsByTagName('owner_id');
            if (dataSourceProjectPath) {
                if (name.length !== 0) {
                    name = name[0].value;
                    if (dbSchema.length !== 0) {
                        dbSchema = dbSchema[0].value;
                        if (jndiDataSource.length !== 0) {
                            jndiDataSource = jndiDataSource[0].value;
                            if (dbServerType.length !== 0) {
                                dbServerType = dbServerType[0].value;
                                if (ownerId.length !== 0) {
                                    ownerId = ownerId[0].value;
                                    dataSource = {
                                        cellId: cellId,
                                        cellURL: cellURL,
                                        name: name,
                                        dbSchema: dbSchema,
                                        jndiDataSource: jndiDataSource,
                                        dbServerType: dbServerType,
                                        ownerId: ownerId,
                                        projectPath: dataSourceProjectPath
                                    };
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    return dataSource;
}

export function* doGetAllProjectDataSources(action) {
    const { project, isNew } = action.payload;
    console.log("getting all data sources for project ..." + project.name);
    try {
        const getCellResponse = yield call(getAllCellRequest, project.path);
        if(getCellResponse) {
            const cellList = parseCellXml(getCellResponse);

            const filteredCellList = [];
            let crcCell = cellList.filter(cell => cell.id === CELL_ID.CRC);
            if(crcCell.length > 0) {
                crcCell = findMatchingCellUrlForProject(crcCell, project.path);
                if(crcCell){
                    filteredCellList.push(crcCell);
                }
            }

            let ontCell = cellList.filter(cell => cell.id === CELL_ID.ONT);
            if(ontCell.length > 0) {
                ontCell = findMatchingCellUrlForProject(ontCell, project.path);
                if(ontCell){
                    filteredCellList.push(ontCell);
                }
            }

            let workCell = cellList.filter(cell => cell.id === CELL_ID.WORK);
            if(workCell.length > 0) {
                workCell = findMatchingCellUrlForProject(workCell, project.path);
                if(workCell){
                    filteredCellList.push(workCell);
                }
            }

            if(filteredCellList.length !== 0){
                yield put(updateAllProjectDataSourcesUrl({dataSources: filteredCellList}));
            }

            const dataSourcesResponse = yield all(filteredCellList.map((cell) => {
                return call(getDataSourceRequest, cell.id, cell.url, "/" + project.path);
            }));

            const dataSourcesResults = dataSourcesResponse.filter(result => result.msgType !== "AJAX_ERROR");
            if(dataSourcesResults.length > 0) {
                let dataSourceList = dataSourcesResults.map((dataSource) => {
                    let dataSourceResult = parseDataSourceXml(dataSource.cellId, dataSource.cellURL, dataSource.response);

                    if(dataSourceResult.cellURL === undefined) {
                        dataSourceResult.statusMsg = parseDataSourceXmlStatus(dataSource.response);
                        console.warn("Received status message ",  dataSourceResult.statusMsg);
                    }
                    return dataSourceResult;
                });

                dataSourceList = dataSourceList.filter((ds) => ds.cellId !== undefined);

                yield put(getAllProjectDataSourcesSucceeded({dataSources: dataSourceList}));
            }
            else{
                yield put(getAllProjectDataSourcesFailed(dataSourcesResponse));
            }
        }else{
            yield put(getAllProjectDataSourcesFailed(response));
        }
    }catch(e) {
        console.error("Unexpected error in get all data sources:", e);
    }
    finally {
        const msg = `get all data sources thread closed`;
        yield msg;
    }
}

export function* allProjectDataSourcesSaga() {
    yield takeLatest(GET_ALL_PROJECT_DATASOURCES_ACTION.GET_ALL_PROJECT_DATASOURCES, doGetAllProjectDataSources);
}
