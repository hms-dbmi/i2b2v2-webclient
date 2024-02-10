import {
    I2B2_LIB_LOADED_ACTION,
} from "actions";
import { defaultState } from "defaultState";

export const i2b2LibLoadedReducer = (state = defaultState.i2b2LibLoaded, action) => {
    switch (action.type) {
        case I2B2_LIB_LOADED_ACTION: {
            const  i2b2LibLoaded = true;

            return i2b2LibLoaded;
        }
        default: {
            return state;
        }
    }
};
