import {  combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { initSagas } from './initSagas';
import { defaultState } from './defaultState';
import * as appReducer from './reducers';
import {configureStore} from "@reduxjs/toolkit";

let store;

export const getStore = () => {
    if (!store) {
        const sagaMiddleware = createSagaMiddleware();

        store = configureStore({
            reducer:  combineReducers(appReducer),
            preloadedState: defaultState,
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
        });

        initSagas(sagaMiddleware);
    }
    return store;
}