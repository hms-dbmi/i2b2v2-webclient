import { ResearcherRequest, RequestTable, UserAccessLevel} from "./models";

export const defaultState = {
    isI2b2LibLoaded: false,
    requestTable: RequestTable(),
    researcherRequest: ResearcherRequest(),
    userAccessLevel: UserAccessLevel(),
};