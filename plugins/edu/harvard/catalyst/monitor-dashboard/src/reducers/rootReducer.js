import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import projectsReducer from './projectsSlice';

const rootReducers = {
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    projects: projectsReducer,
};

export default rootReducers;