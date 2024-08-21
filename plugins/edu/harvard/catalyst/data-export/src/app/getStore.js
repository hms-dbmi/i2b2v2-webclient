import { configureStore } from '@reduxjs/toolkit';
//import {  combineReducers } from 'redux';
//import * as appReducer from '../reducers';
import { initSagas } from '../initSagas';
import createSagaMiddleware from 'redux-saga';
import { defaultState } from '../defaultState';
import rootReducers from "../reducers/rootReducer";

let store;

export const getStore = () => {
    if (!store) {
        const sagaMiddleware = createSagaMiddleware();

        store = configureStore({
            reducer:  rootReducers,
            /*reducer:  combineReducers(appReducer),*/
            preloadedState: defaultState,
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
        });

        initSagas(sagaMiddleware);
    }
    return store;
}
