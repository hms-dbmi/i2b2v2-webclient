import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import projectsReducer from './projectsSlice';
import userSessionsReducer from './userSessionsSlice';
import userLoginsReducer from './userLoginsSlice';
import dataSourcesReducer from './dataSourcesSlice';
import queriesReducer from './queriesSlice';
import userInfoReducer from './userInfoSlice';
import userRoleCountsReducer from './userRoleCountsSlice';
import usersReducer from './usersSlice';
import newUsersReducer from './newUsersSlice';

const rootReducers = {
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    projects: projectsReducer,
    userSessions: userSessionsReducer,
    userLogins: userLoginsReducer,
    dataSources: dataSourcesReducer,
    queries: queriesReducer,
    userInfo: userInfoReducer,
    userRoleCounts: userRoleCountsReducer,
    users: usersReducer,
    newUsers: newUsersReducer,
};

export default rootReducers;