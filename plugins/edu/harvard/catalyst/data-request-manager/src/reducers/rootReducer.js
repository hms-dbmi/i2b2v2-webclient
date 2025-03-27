import listRequestTableReducer from './requestTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import requestDetailsReducer from './requestDetailsSlice';
import userInfoReducer from "./userInfoSlice";
import adminNotesReducer from "./adminNotesSlice";
import tableDefReducer from "./tableDefSlice";
import configInfoReducer from "./configInfoSlice";

const rootReducers = {
    requestTable : listRequestTableReducer,
    adminTable : listRequestTableReducer,
    requestDetails: requestDetailsReducer,
    userInfo: userInfoReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    adminNotes: adminNotesReducer,
    configInfo: configInfoReducer,
    tableDef: tableDefReducer,
};

export default rootReducers;