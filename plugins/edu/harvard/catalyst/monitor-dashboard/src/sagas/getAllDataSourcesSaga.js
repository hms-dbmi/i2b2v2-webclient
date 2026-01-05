import { call, takeLatest, put} from "redux-saga/effects";
import {
    GET_ALL_DATA_SOURCES,
} from "../actions";
import {
    getAllDataSourcesFailed,
    getAllDataSourcesSucceeded,
} from "../reducers/dataSourcesSlice";
import {parseXml} from "../utilities/parseXml";
import {CELL_ID} from "../models";

//a function that returns a promise
const getAllCellRequest = () => {
    return i2b2.ajax.PM.getAllCell().then((xmlString) =>parseXml(xmlString)).catch((err) => err);
};

//a function that returns a promise
const getAllDataSourcesRequest = (cellId, cellURL) => {
    const sec_version = cellId === "IM" ? "" : "1.1/";

    const sec_cell = CELL_ID.CRC;
    let data = {
        sec_url: cellURL,
        sec_cell: sec_cell,
        sec_version: sec_version,
    };

    return i2b2.ajax.PM.getAllDBLookup(data).then((xmlString) => {
        return {
            cellId: cellId,
            cellURL: cellURL,
            response: parseXml(xmlString)
        }
    }).catch((err) => err);
};

const parseCellXml = (xml) => {
    let cells = xml.getElementsByTagName('cell_data');
    let cellList = [];
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];

        let id = cell.attributes['id'].nodeValue.toUpperCase();
        let name = cell.getElementsByTagName('name');
        let url = cell.getElementsByTagName('url');
        let cellProjectPath = cell.getElementsByTagName('project_path');
        if(id === CELL_ID.CRC) {
            if(name.length !== 0){
                name = name[0].childNodes[0].nodeValue;
                if(url.length !== 0){
                    url = url[0].childNodes[0].nodeValue;
                    if(cellProjectPath.length !== 0){
                        cellProjectPath = cellProjectPath[0].childNodes[0].nodeValue;
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
    }
    return cellList;
}

const findMatchingCellUrlForProject = (cellList, projectPath) => {

    let matchingCell;
    const projectPathSplit = projectPath.split("/");
    let maxMatchCount = 0;

    for (let i = 0; i < cellList.length; i++) {
        const cell = cellList[i];
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
    }

    return matchingCell;
}

const parseDataSourceXml = (cellId, cellURL, xml) => {
    let dblookups = xml.getElementsByTagName('dblookup');
    let dataSources =[];

    for (let i = 0; i < dblookups.length; i++) {
        const dblookup = dblookups[i];
        let dataSourceProjectPath = dblookup.attributes['project_path'].nodeValue;
        let name = dblookup.getElementsByTagName('db_nicename');
        let dbSchema = dblookup.getElementsByTagName('db_fullschema');
        let jndiDataSource = dblookup.getElementsByTagName('db_datasource');
        let dbServerType = dblookup.getElementsByTagName('db_servertype');
        let ownerId = dblookup.getElementsByTagName('owner_id');
        if (dataSourceProjectPath) {
            if (name.length !== 0) {
                name = name[0].childNodes[0].nodeValue;
                if (dbSchema.length !== 0) {
                    dbSchema = dbSchema[0].childNodes[0].nodeValue;
                    if (jndiDataSource.length !== 0) {
                        jndiDataSource = jndiDataSource[0].childNodes[0].nodeValue;
                        if (dbServerType.length !== 0) {
                            dbServerType = dbServerType[0].childNodes[0].nodeValue;
                            if (ownerId.length !== 0) {
                                ownerId = ownerId[0].childNodes[0].nodeValue;
                                //check if data source already exists
                                const existingDs = dataSources.find(d => d.dbSchema === dbSchema);
                                if(existingDs){
                                    existingDs.projectPaths.push(dataSourceProjectPath);
                                }
                                else {
                                    dataSources.push({
                                        cellURL: cellURL,
                                        dbSchema: dbSchema,
                                        jndiDataSource: jndiDataSource,
                                        dbServerType: dbServerType,
                                        ownerId: ownerId,
                                        projectPaths: [dataSourceProjectPath]
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return dataSources;
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
                statusValue = status[0].childNodes[0].nodeValue;
            }
        }
    }

    return statusValue;
}

export function* doGetAllDataSourcesSaga(action) {
    console.log("getting all data sources ...");

    try {
        const getCellResponse = yield call(getAllCellRequest, "");
        if(getCellResponse) {
            const cellList = parseCellXml(getCellResponse);

            const filteredCellList = [];
            let crcCell = cellList.filter(cell => cell.id === CELL_ID.CRC);
            if (crcCell.length > 0) {
                crcCell = findMatchingCellUrlForProject(crcCell, "/");
                if (crcCell) {
                    filteredCellList.push(crcCell);
                }
            }

            if (filteredCellList.length !== 0) {
                const responseResult = yield call(getAllDataSourcesRequest, filteredCellList[0].id, filteredCellList[0].url);

                if (!responseResult.error) {
                    let dataSourceResult = parseDataSourceXml(filteredCellList[0].id, filteredCellList[0].url, responseResult.response);

                    if(dataSourceResult.cellURL === undefined) {
                        console.warn("Received status message ",  dataSourceResult.statusMsg);
                    }
                    yield put(getAllDataSourcesSucceeded({dataSources: dataSourceResult}));
                } else {
                    yield put(getAllDataSourcesFailed(responseResult));
                }
            }
        }else{
            yield put(getAllDataSourcesFailed(getCellResponse));
        }

    } catch(e){
        console.error("Error retrieving data sources. ", e);
        yield put(getAllDataSourcesFailed({errorMessage: e}));
    }
    finally {
        const msg = `get all data sources thread closed`;
        yield msg;
    }
}

export function* getAllDataSourcesSaga() {
    yield takeLatest(GET_ALL_DATA_SOURCES, doGetAllDataSourcesSaga);
}
