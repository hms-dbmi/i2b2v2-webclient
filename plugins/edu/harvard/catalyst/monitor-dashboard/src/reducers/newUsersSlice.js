import {createSlice} from "@reduxjs/toolkit";
import {StatusInfo, User, Users} from "../models";
import {NEW_USERS} from "../actions";
import {defaultState} from "../defaultState";

export const newUsersSlice = createSlice({
    name: NEW_USERS,
    initialState: defaultState.newUsers,
    reducers: {
        getNewUsers: state => {
            return Users({
                isFetching: true,
                statusInfo: StatusInfo()
            })
        },
        getNewUsersSucceeded: (state, { payload: userList }) => {
            let users = [];
            userList.map((user) => {
                users.push(User({
                    username: user.username,
                    fullname: user.fullname,
                    isAdmin: user.isAdmin,
                    email: user.email
                }));
            });

            state.isFetching = false;
            state.userList = users;
            state.userCount = userList.length;
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getNewUsersFailed: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            const errorMsg = errorMessage ? errorMessage: "An error occurred retrieving new " +
                "users";

            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMsg
            });
        },
    }
})

export const {
    getNewUsers,
    getNewUsersSucceeded,
    getNewUsersFailed,
} = newUsersSlice.actions

export default newUsersSlice.reducer