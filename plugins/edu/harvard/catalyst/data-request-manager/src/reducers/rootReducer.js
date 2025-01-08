import listRequestTableReducer from './listRequestTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import requestDetailsReducer from './requestDetailsSlice';
import userAccessLevelReducer from "./userAccessLevelSlice";

const rootReducers = {
    requestTable : listRequestTableReducer,
    adminTable : listRequestTableReducer,
    requestDetails: requestDetailsReducer,
    userAccessLevel: userAccessLevelReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer
};

export default rootReducers;