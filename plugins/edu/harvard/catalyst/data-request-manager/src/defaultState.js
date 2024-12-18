import {RequestTable, UserAccessLevel, RequestDetails} from "./models";

export const defaultState = {
    isI2b2LibLoaded: false,
    requestTable: RequestTable(),
    requestDetails: RequestDetails(),
    userAccessLevel: UserAccessLevel(),
};