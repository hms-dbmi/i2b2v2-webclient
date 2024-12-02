import { configureStore } from '@reduxjs/toolkit';
import { defaultState } from '../defaultState';
import rootReducers from "../reducers/rootReducer";

let store;

export const getStore = () => {
    if (!store) {
        store = configureStore({
            reducer:  rootReducers,
            preloadedState: defaultState,
        });
    }
    return store;
}