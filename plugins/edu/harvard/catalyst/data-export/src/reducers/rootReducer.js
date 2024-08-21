//export { createTableReducer } from "../reducers/createTableReducer";
/*export { dataTableReducer } from "./createTableReducer";*/
//export *  from "./createTableReducer";
import dataTableReducer from './createTableSlice';

const rootReducers = {
    dataTable: dataTableReducer,
};

export default rootReducers;