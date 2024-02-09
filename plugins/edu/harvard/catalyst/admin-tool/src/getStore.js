import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { initSagas } from './initSagas';
import { defaultState } from './defaultState';
import * as appReducer from './reducers';

let store;

export const getStore = () => {
    if (!store) {
        const sagaMiddleware = createSagaMiddleware();
        store = createStore(
            combineReducers(appReducer),
            defaultState,
            applyMiddleware(sagaMiddleware),
        );
        initSagas(sagaMiddleware);
    }
    return store;
}