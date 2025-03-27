import {RequestTable, UserInfo, RequestDetails, AdminNotes, TableDefinition} from "./models";

export const defaultState = {
    isI2b2LibLoaded: false,
    requestTable: RequestTable(),
    requestDetails: RequestDetails(),
    userInfo: UserInfo(),
    adminNotes: AdminNotes(),
    tableDef: TableDefinition(),
};