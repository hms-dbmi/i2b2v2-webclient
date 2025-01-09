import listRequestTableReducer from './requestTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import requestDetailsReducer from './requestDetailsSlice';
import userAccessLevelReducer from "./userAccessLevelSlice";
import adminNotesReducer from "./adminNotesSlice";

const rootReducers = {
    requestTable : listRequestTableReducer,
    adminTable : listRequestTableReducer,
    requestDetails: requestDetailsReducer,
    userAccessLevel:userAccessLevelReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    adminNotes: adminNotesReducer,
};

export default rootReducers;