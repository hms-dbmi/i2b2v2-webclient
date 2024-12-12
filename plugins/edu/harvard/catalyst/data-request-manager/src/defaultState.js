import {ResearcherRequest, ResearcherTable, UserAccessLevel} from "./models";

export const defaultState = {
    isI2b2LibLoaded: false,
    researcherTable: ResearcherTable(),
    researcherRequest: ResearcherRequest(),
    userAccessLevel: UserAccessLevel(),
};