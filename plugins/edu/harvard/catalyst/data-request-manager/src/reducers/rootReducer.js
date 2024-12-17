import listRequestTableReducer from './listRequestTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import getRequestDetailsReducer from './getRequestDetailsSlice';
import retrieveUserAccessLevelReducer from "./retrieveUserAccessLevelSlice";

const rootReducers = {
    requestTable : listRequestTableReducer,
    adminTable : listRequestTableReducer,
    requestDetails: getRequestDetailsReducer,
    userAccessLevel: retrieveUserAccessLevelReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer
};

export default rootReducers;