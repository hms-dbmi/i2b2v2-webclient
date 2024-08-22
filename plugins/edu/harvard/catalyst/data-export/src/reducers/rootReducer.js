import loadTableReducer from './loadTableSlice';
import saveTableReducer from './saveTableSlice';
import listTablesReducer from './listTablesSlice';

const rootReducers = {
    dataTable: loadTableReducer,
    saveTable: saveTableReducer,
    tableListing : listTablesReducer
};

export default rootReducers;