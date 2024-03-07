import { all, call, takeLatest, put} from "redux-saga/effects";
import XMLParser from 'react-xml-parser';
import {
    SAVE_PROJECT_DATASOURCES_ACTION,
    saveProjectDataSourcesFailed,
    saveProjectDataSourcesSucceeded,
} from "actions";
import {CELL_ID} from "../models";

const saveProjectDataSourceRequest = (cellId, dataSource) => {
    const sec_version = cellId === "IM" ? "" : "1.1/";
    const sec_cell = cellId === CELL_ID.CRC ? "crc/pdo" : cellId.toLowerCase();

    let data = {
        db_nicename : dataSource.name,
        project_path: dataSource.projectPath,
        db_fullschema: dataSource.dbSchema,
        db_datasource: dataSource.jndiDataSource,
        db_servertype:dataSource.dbServerType,
        comment: "",
        db_tooltip: "",
        owner_id: "@",
        sec_url: dataSource.cellURL,
        sec_cell: sec_cell,
        sec_version: sec_version
    };

    return i2b2.ajax.PM.setDBLookup(data).then((xmlString) => new XMLParser().parseFromString(xmlString)).catch((err) => err);
};

export function* doSaveProjectDataSources(action) {
    const { project, dataSources } = action.payload;
    console.log("saving data sources for project ..." + project.name);
    try {
        const cellIds = [CELL_ID.CRC, CELL_ID.ONT, CELL_ID.WORK];
        const dataSourcesResponse = yield all(cellIds.map((cellId) => {
            return call(saveProjectDataSourceRequest, cellId, dataSources[cellId]);
        }));

        const dataSourcesResults = dataSourcesResponse.filter(result => result.msgType === "AJAX_ERROR");
        if(dataSourcesResults.length === 0) {
            yield put(saveProjectDataSourcesSucceeded());
        }
        else{
            yield put(saveProjectDataSourcesFailed(dataSourcesResponse));
        }

    } finally {
        const msg = `save project data sources thread closed`;
        yield msg;
    }
}

export function* saveProjectDataSourcesSaga() {
    yield takeLatest(SAVE_PROJECT_DATASOURCES_ACTION.SAVE_PROJECT_DATASOURCES, doSaveProjectDataSources);
}