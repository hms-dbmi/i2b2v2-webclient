import tableDefReducer from './tableDefSlice';
import saveTableReducer from './saveTableSlice';
import tableListingReducer from './tableListingSlice';
import makeRequestReducer from './makeRequestSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';

const rootReducers = {
    tableDef: tableDefReducer,
    saveTable: saveTableReducer,
    tableListing : tableListingReducer,
    makeRequestDetails: makeRequestReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer
};

export default rootReducers;