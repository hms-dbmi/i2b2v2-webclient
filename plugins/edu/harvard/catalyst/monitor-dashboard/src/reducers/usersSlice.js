import {createSlice} from "@reduxjs/toolkit";
import {StatusInfo, User, Users} from "../models";
import {USERS} from "../actions";
import {defaultState} from "../defaultState";

export const usersSlice = createSlice({
    name: USERS,
    initialState: defaultState.users,
    reducers: {
        getAllUsers: state => {
            return Users({
                isFetching: true,
                statusInfo: StatusInfo()
            })
        },
        getAllUsersSucceeded: (state, { payload: userList }) => {
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
            state.statusInfo = StatusInfo({
                status: "SUCCESS"
            });
        },
        getAllUsersFailed: (state, { payload: { errorMessage} }) => {
            state.isFetching = false;
            const errorMsg = errorMessage ? errorMessage: "An error occurred retrieving " +
                "users";

            state.statusInfo = StatusInfo({
                status: "FAIL",
                errorMessage: errorMsg
            });
        },
    }
})

export const {
    getAllUsers,
    getAllUsersSucceeded,
    getAllUsersFailed,
} = usersSlice.actions

export default usersSlice.reducer