import { DataSources, Projects, Queries, UserInfo, UserLogins, UserSessions } from "models";

export const defaultState = {
    isI2b2LibLoaded: false,
    projects: Projects(),
    userSessions: UserSessions(),
    userLogins: UserLogins(),
    dataSources: DataSources(),
    queries: Queries(),
    userInfo: UserInfo(),
};