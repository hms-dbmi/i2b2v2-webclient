import loadTableReducer from './loadTableSlice';
import saveTableReducer from './saveTableSlice';
import listTablesReducer from './listTablesSlice';
import makeRequestReducer from './makeRequestSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';

const rootReducers = {
    tableDef: loadTableReducer,
    saveTable: saveTableReducer,
    tableListing : listTablesReducer,
    makeRequestDetails: makeRequestReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer
};

export default rootReducers;