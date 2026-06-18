import { createSlice } from '@reduxjs/toolkit'
import { I2B2_LOADED } from "../actions";
import { defaultState } from '../defaultState';

export const i2b2LibLoadedSlice = createSlice({
    name: I2B2_LOADED,
    initialState: defaultState.isI2b2LibLoaded,
    reducers: {
        updateI2b2LibLoaded: (state) => {
            return true;
        }
    }
})

export const {
    updateI2b2LibLoaded
} = i2b2LibLoadedSlice.actions

export default i2b2LibLoadedSlice.reducer