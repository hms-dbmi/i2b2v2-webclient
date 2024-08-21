import { configureStore } from '@reduxjs/toolkit';
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
            preloadedState: defaultState,
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
        });

        initSagas(sagaMiddleware);
    }
    return store;
}
