import listRequestTableReducer from './listRequestTableSlice';
import i2b2LibLoadedReducer from './i2b2LibLoadedSlice';
import getRequestDetailsReducer from './getRequestDetailsSlice';
import retrieveUserAccessLevelReducer from "./retrieveUserAccessLevelSlice";
import adminNotesReducer from "./adminNotesSlice";

const rootReducers = {
    requestTable : listRequestTableReducer,
    adminTable : listRequestTableReducer,
    requestDetails: getRequestDetailsReducer,
    userAccessLevel: retrieveUserAccessLevelReducer,
    isI2b2LibLoaded: i2b2LibLoadedReducer,
    adminNotes: adminNotesReducer,
};

export default rootReducers;