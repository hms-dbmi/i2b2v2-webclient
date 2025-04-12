import listRequestTableReducer from './requestTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import requestDetailsReducer from './requestDetailsSlice';
import userInfoReducer from "./userInfoSlice";
import tableDefReducer from "./tableDefSlice";
import requestStatusLogReducer from "./requestStatusLogSlice";
import requestCommentsReducer from "./requestCommentsSlice";
import configInfoReducer from "./configInfoSlice";

const rootReducers = {
    requestTable : listRequestTableReducer,
    adminTable : listRequestTableReducer,
    requestDetails: requestDetailsReducer,
    userInfo: userInfoReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    requestComments: requestCommentsReducer,
    configInfo: configInfoReducer,
    tableDef: tableDefReducer,
    requestStatusLog: requestStatusLogReducer,
};

export default rootReducers;