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
        terminateUserSession: (state, {payload:  {user} }) => {
            //Extract each user data into User model and return an array of Users
            const foundUser = state.users.find(curUser => curUser.username === user.username);

            if (foundUser) {
                foundUser.session.isTerminatingSession = true;
            }
        },
        terminateUserSessionSucceeded: (state, {payload:  {user} }) => {
            //Extract each user data into User model and return an array of Users
            const foundUser = state.users.find(curUser => curUser.username === user.username);

            if (foundUser) {
                foundUser.session.isActive = false;
                foundUser.session.isTerminatingSession = false;
            }
        },
        terminateUserSessionFailed: (state, {payload:  {user} }) => {
            //Extract each user data into User model and return an array of Users
            const foundUser = state.users.find(curUser => curUser.username === user.username);

            if (foundUser) {
                foundUser.session.isTerminatingSession = false;
            }
        },
        unlockOutUser: (state, {payload:  {user} }) => {
            //Extract each user data into User model and return an array of Users
            const foundUser = state.users.find(curUser => curUser.username === user.username);

            if (foundUser) {
                foundUser.session.isUnlockingOutUser = true;
            }
        },
        unlockOutUserSucceeded: (state, {payload:  {user} }) => {
            //Extract each user data into User model and return an array of Users
            const foundUser = state.users.find(curUser => curUser.username === user.username);

            if (foundUser) {
                foundUser.session.isLockedOut = false;
                foundUser.session.isUnlockingOutUser = false;
            }
        },
        unlockOutUserFailed:(state, {payload:  {user} }) => {
            //Extract each user data into User model and return an array of Users
            const foundUser = state.users.find(curUser => curUser.username === user.username);

            if (foundUser) {
                foundUser.session.isUnlockingOutUser = false;
            }
        },
    }
})

export const {
    getAllUsers,
    getAllUsersSucceeded,
    getAllUsersFailed,
    terminateUserSession,
    terminateUserSessionSucceeded,
    terminateUserSessionFailed,
    unlockOutUser,
    unlockOutUserSucceeded,
    unlockOutUserFailed
} = allUsersSlice.actions


export default allUsersSlice.reducer