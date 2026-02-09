import {
    DataSources,
    NewUsers,
    Projects,
    Queries,
    QueryMetrics,
    QueryRequestDetails,
    UserInfo,
    UserLogins,
    UserRoleCounts,
    Users,
    UserSessions
} from "models";

export const defaultState = {
    isI2b2LibLoaded: false,
    projects: Projects(),
    userSessions: UserSessions(),
    userLogins: UserLogins(),
    dataSources: DataSources(),
    queries: Queries(),
    userInfo: UserInfo(),
    userRoleCounts: UserRoleCounts(),
    users: Users(),
    newUsers: NewUsers(),
    queryMetrics: QueryMetrics(),
    queryRequestDetails: QueryRequestDetails()
};