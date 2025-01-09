import {RequestTable, UserAccessLevel, RequestDetails, AdminNotes} from "./models";

export const defaultState = {
    isI2b2LibLoaded: false,
    requestTable: RequestTable(),
    requestDetails: RequestDetails(),
    userAccessLevel: UserAccessLevel(),
    adminNotes: AdminNotes(),
};