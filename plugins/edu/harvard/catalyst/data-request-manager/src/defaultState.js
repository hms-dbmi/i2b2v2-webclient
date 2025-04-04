import {
    RequestTable,
    UserInfo,
    RequestDetails,
    TableDefinition,
    RequestStatusLog,
    RequestComments,
    ConfigInfo
} from "./models";


export const defaultState = {
    isI2b2LibLoaded: false,
    requestTable: RequestTable(),
    requestDetails: RequestDetails(),
    userInfo: UserInfo(),
    requestComments: RequestComments(),
    tableDef: TableDefinition(),
    requestStatusLog: RequestStatusLog()
    configInfo: ConfigInfo()
};