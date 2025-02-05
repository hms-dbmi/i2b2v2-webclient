import tableDefReducer from './tableDefSlice';
import saveTableReducer from './saveTableSlice';
import tableListingReducer from './tableListingSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import userInfoReducer from './userInfoSlice';

const rootReducers = {
    tableDef: tableDefReducer,
    saveTable: saveTableReducer,
    tableListing : tableListingReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    userInfo: userInfoReducer
};

export default rootReducers;