import {RequestTable, UserInfo, RequestDetails, AdminNotes, TableDefinition, ConfigInfo} from "./models";

export const defaultState = {
    isI2b2LibLoaded: false,
    requestTable: RequestTable(),
    requestDetails: RequestDetails(),
    userInfo: UserInfo(),
    adminNotes: AdminNotes(),
    tableDef: TableDefinition(),
    configInfo: ConfigInfo()
};