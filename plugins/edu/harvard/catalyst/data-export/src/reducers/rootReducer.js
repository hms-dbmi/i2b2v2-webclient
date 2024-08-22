import loadTableReducer from './loadTableSlice';
import saveTableReducer from './saveTableSlice';

const rootReducers = {
    dataTable: loadTableReducer,
    saveTable: saveTableReducer
};

export default rootReducers;