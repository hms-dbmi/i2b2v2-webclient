import {
    GET_USER_ACTIONS,
} from "actions";
import { defaultState } from "defaultState";
/*import { User } from "models";*/

export const userReducer = (state = defaultState.users, action) => {
    switch (action.type) {
        case GET_USER_ACTIONS.GET_USER: {
            const { username } = action.payload;

            //TODO: update state to indicate users are being fetched
            return  state;
        }
        case GET_USER_ACTIONS.GET_USER_SUCCEEDED: {
            const allUsers = action.payload;

            //TODO: extract each user data into Users model and return an array of Users
            let usersList = [];

            return usersList;
        }
        case GET_USER_ACTIONS.GET_USER_FAILED: {
            //TODO: add error handling
            return state;
        }
        default: {
            return state;
        }
    }
};
