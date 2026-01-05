import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import projectsReducer from './projectsSlice';
import userSessionsReducer from './userSessionsSlice';
import userLoginsReducer from './userLoginsSlice';
import dataSourcesReducer from './dataSourcesSlice';

const rootReducers = {
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    projects: projectsReducer,
    userSessions: userSessionsReducer,
    userLogins: userLoginsReducer,
    dataSources: dataSourcesReducer,
};

export default rootReducers;