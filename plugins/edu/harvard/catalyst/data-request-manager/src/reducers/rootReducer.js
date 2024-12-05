import listResearcherTableReducer from './listResearcherTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';

const rootReducers = {
    researcherTable : listResearcherTableReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer
};

export default rootReducers;