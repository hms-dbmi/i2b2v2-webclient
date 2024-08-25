import loadTableReducer from './loadTableSlice';
import saveTableReducer from './saveTableSlice';
import listTablesReducer from './listTablesSlice';
import makeRequestReducer from './makeRequestSlice';

const rootReducers = {
    tableDef: loadTableReducer,
    saveTable: saveTableReducer,
    tableListing : listTablesReducer,
    makeRequestDetails: makeRequestReducer
};

export default rootReducers;