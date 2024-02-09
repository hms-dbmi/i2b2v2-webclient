import {
    GET_USER_ACTIONS,
} from "actions";
import { defaultState } from "defaultState";
import { User } from "models";

export const userReducer = (state = defaultState.users, action) => {
    switch (action.type) {
        case GET_USER_ACTIONS.GET_USER: {
            const { username } = action.payload;
            return  User({
                ...state,
                username,
            });
        }
        case GET_USER_ACTIONS.GET_USER_SUCCEEDED: {
            const { fullname, email, isAdmin } = action.payload;

            return User({
                ...state,
                 fullname,
                 email,
                isAdmin
            });
        }
        case GET_USER_ACTIONS.GET_USER_FAILED: {
            return state
        }
        default: {
            return state;
        }
    }
};
