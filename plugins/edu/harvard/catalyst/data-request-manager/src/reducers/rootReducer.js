import listResearcherTableReducer from './listResearcherTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import getRequestDetailsReducer from './getRequestDetailsSlice';

const rootReducers = {
    researcherTable : listResearcherTableReducer,
    researcherRequest: getRequestDetailsReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer
};

export default rootReducers;