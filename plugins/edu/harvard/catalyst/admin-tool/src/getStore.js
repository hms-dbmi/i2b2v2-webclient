import createSagaMiddleware from 'redux-saga';

import { initSagas } from './initSagas';
import { defaultState } from './defaultState';
import {configureStore} from "@reduxjs/toolkit";
import rootReducers from "./reducers/rootReducers";

let store;

export const getStore = () => {
    if (!store) {
        const sagaMiddleware = createSagaMiddleware();

        store = configureStore({
            reducer:  rootReducers,
            preloadedState: defaultState,
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
        });

        initSagas(sagaMiddleware);
    }
    return store;
}