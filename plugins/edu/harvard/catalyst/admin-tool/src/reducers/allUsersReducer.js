import {
    GET_ALL_USERS_ACTION,
    SAVE_USER_ACTION,
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
            //TODO: add error handling somewhere
            return AllUsers({
                ...state,
                isFetching: false,
            });
        }

        case  SAVE_USER_ACTION.SAVE_USER_SUCCEEDED: {
            const  { user }  = action.payload;

            let updatedUsers = state.users;

            //check if new user
            let existingUser = updatedUsers.filter((u) => u.username === user.username);
            if(existingUser.length === 0){
                updatedUsers.push(user);
            }
            return AllUsers({
                ...state,
                users: updatedUsers,
                isFetching: false,
            });
        }

        default: {
            return state;
        }
    }
};
