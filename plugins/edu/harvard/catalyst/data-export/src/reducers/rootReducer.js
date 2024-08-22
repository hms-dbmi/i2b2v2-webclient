import loadTableReducer from './loadTableSlice';
import saveTableReducer from './saveTableSlice';
import listTablesReducer from './listTablesSlice';

const rootReducers = {
    tableDef: loadTableReducer,
    saveTable: saveTableReducer,
    tableListing : listTablesReducer
};

export default rootReducers;