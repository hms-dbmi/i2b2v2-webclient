import {
    I2B2_LIB_LOADED_ACTION,
} from "actions";
import { defaultState } from "defaultState";

export const i2b2LibLoadedReducer = (state = defaultState.isI2b2LibLoaded, action) => {
    switch (action.type) {
        case I2B2_LIB_LOADED_ACTION: {
            return  true;
        }
        default: {
            return state;
        }
    }
};
