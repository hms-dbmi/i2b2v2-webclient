import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import projectsReducer from './projectsSlice';
import userSessionsReducer from './userSessionsSlice';
import userLoginsReducer from './userLoginsSlice';
import dataSourcesReducer from './dataSourcesSlice';
import queriesReducer from './queriesSlice';
import userInfoReducer from './userInfoSlice';
import configInfoReducer from './configInfoSlice';

const rootReducers = {
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    projects: projectsReducer,
    userSessions: userSessionsReducer,
    userLogins: userLoginsReducer,
    dataSources: dataSourcesReducer,
    queries: queriesReducer,
    userInfo: userInfoReducer,
    configInfo: configInfoReducer,
};

export default rootReducers;