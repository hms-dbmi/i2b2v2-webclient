import {
    GET_ALL_USERS_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import { AllUsers, User } from "models";

export const allUsersReducer = (state = defaultState.allUsers, action) => {
    switch (action.type) {
        case  GET_ALL_USERS_ACTION.GET_ALL_USERS: {
            return AllUsers({
                ...state,
                isFetching: true,
            });
        }
        case  GET_ALL_USERS_ACTION.GET_ALL_USERS_SUCCEEDED: {
            const  allUsers  = action.payload;

            //Extract each user data into User model and return an array of Users
            let users = [];
            allUsers.map((user) => {
                users.push(User({
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    isAdmin: user.isAdmin
                }));
            })

            return AllUsers({
                ...state,
                users,
                isFetching: false,
            });
        }
        case  GET_ALL_USERS_ACTION.GET_ALL_USERS_FAILED: {
            //TODO: add error handling
            return state;
        }
        default: {
            return state;
        }
    }
};
