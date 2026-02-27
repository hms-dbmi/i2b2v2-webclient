import { createSlice } from '@reduxjs/toolkit'
import {
    ALL_USERS,
} from "../actions";
import { defaultState } from "../defaultState";
import {User, UserSession} from "../models";

export const allUsersSlice = createSlice({
    name: ALL_USERS,
    initialState: defaultState.allUsers,
    reducers: {
        getAllUsers: state => {
            state.isFetching = true;
        },
        getAllUsersSucceeded: (state, {payload:  allUsers  }) => {
            //Extract each user data into User model and return an array of Users
            let users = [];
            allUsers.map((user) => {
                users.push(User({
                    username: user.username,
                    fullname: user.fullname,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    session: UserSession({
                        isActive: user.isActive,
                        isLockedOut: user.isLockedOut
                    })
                }));
            })

            state.users = users;
            state.isFetching = false;
        },
        getAllUsersFailed: state => {
            state.isFetching = false;
        },
    }
})

export const {
    getAllUsers,
    getAllUsersSucceeded,
    getAllUsersFailed,
} = allUsersSlice.actions


export default allUsersSlice.reducer