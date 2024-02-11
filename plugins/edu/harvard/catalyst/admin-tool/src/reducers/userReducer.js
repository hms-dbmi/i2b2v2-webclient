import {
    GET_ALL_USERS_ACTION,
} from "actions";
import { defaultState } from "defaultState";
import { Users, User } from "models";

export const userReducer = (state = defaultState.users, action) => {
    switch (action.type) {
        case  GET_ALL_USERS_ACTION.GET_ALL_USERS: {
            //TODO: update state to indicate users are being fetched
            return  state;
        }
        case  GET_ALL_USERS_ACTION.GET_ALL_USERS_SUCCEEDED: {
            const  allUsers  = action.payload;

            //Extract each user data into Users model and return an array of Users
            let users = [];
            allUsers.map((user) => {
                users.push(User({
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    isAdmin: user.isAdmin
                }));
            })

            let newUsers = Users({
                ...state,
                users
            });

            return Users({
                ...state,
                users
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
