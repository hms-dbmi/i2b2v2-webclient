import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    GET_ALL_PROJECT_DATASOURCES_ACTION,
    getAllProjectDataSourcesFailed,
    getAllProjectDataSourcesSucceeded,
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
const getDataSourceRequest = (cellId, cellUrl, projectPath) => {
    const sec_version = cellId === "IM" ? "" : "1.1/";

    projectPath = projectPath.substring(1) + "/";
    let data = {
        sec_url: cellUrl,
        sec_cell: cellId.toLowerCase(),
        sec_version: sec_version,
        id_xml: projectPath
    };

    return i2b2.ajax.PM.getDBLookup(data).then((xmlString) => {
        return {
            cellId: cellId,
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

const parseDataSourceXml = (cellId, xml) => {
    let dblookups = xml.getElementsByTagName('dblookup');
    let dataSource = {};
    dblookups.forEach((dblookup) => {
        let project_path = dblookup.attributes['project_path'];
        let name = dblookup.getElementsByTagName('db_nicename');
        let dbSchema = dblookup.getElementsByTagName('db_fullschema');
        let jndiDataSource = dblookup.getElementsByTagName('db_datasource');
        let dbServerType = dblookup.getElementsByTagName('db_servertype');
        let ownerId = dblookup.getElementsByTagName('owner_id');
        if(project_path) {
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
                                    name: name,
                                    dbSchema: dbSchema,
                                    jndiDataSource: jndiDataSource,
                                    dbServerType: dbServerType,
                                    ownerId: ownerId,
                                    projectPath: project_path
                                };
                            }
                        }
                    }
                }
            }
        }
    });

    return dataSource;
}

export function* doGetAllProjectDataSources(action) {
    const { project } = action.payload;
    console.log("getting all data sources for project ..." + JSON.stringify(project));
    try {
        const getCellResponse = yield call(getAllCellRequest, project.path);
        if(getCellResponse) {
            const cellMap = parseCellXml(getCellResponse);

            const dataSourcesResponse = yield all(cellMap.map((cell) => {
                return call(getDataSourceRequest, cell.id, cell.url, project.path);
            }));

            const dataSourcesResults = dataSourcesResponse.filter(result => result.msgType !== "AJAX_ERROR");
            if(dataSourcesResults.length > 0) {
                const dataSourceList = dataSourcesResults.map((dataSource) => {
                    return parseDataSourceXml(dataSource.cellId, dataSource.response);
                });
                yield put(getAllProjectDataSourcesSucceeded({dataSources: dataSourceList}));
            }
            else{
                yield put(getAllProjectDataSourcesFailed(dataSourcesResponse));
            }
        }else{
            yield put(getAllProjectDataSourcesFailed(response));
        }
    } finally {
        const msg = `get all data sources thread closed`;
        yield msg;
    }
}

export function* allProjectDataSourcesSaga() {
    yield takeLatest(GET_ALL_PROJECT_DATASOURCES_ACTION.GET_ALL_PROJECT_DATASOURCES, doGetAllProjectDataSources);
}
