import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

import { User } from "models";

import "./UserInfo.scss";

export const UserInfo = ({user, updateUser}) => {
    const dispatch = useDispatch();

    const isAdminChange = () => {

    }
    //useEffect(() => {
    //}, []);

    return (
        <div className="UserInfo">
            <h3> User Details </h3>
            <Stack
                direction="column"
                justifyContent="flex-start"
                alignItems="flex-start"
                spacing={2}
            >
                <div>
                    <TextField
                        className="inputField"
                        required
                        label="User Name"
                        defaultValue={user.username}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>

                <div>
                    <TextField
                        className="inputField"
                        required
                        label="Full Name"
                        defaultValue={user.fullname}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>

                <div>
                    <TextField
                        className="inputField"
                        label="Email"
                        defaultValue={user.email}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div>
                    <TextField
                        className="inputField"
                        label="Password"
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div>
                    <TextField
                        className="inputField"
                        label="Verify Password"
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div>
                    <TextField
                        select
                        label="Is Admin"
                        defaultValue={user.isAdmin}
                        variant="standard"
                    >
                        <MenuItem value={"false"}>No</MenuItem>
                        <MenuItem value={"true"}>Yes</MenuItem>
                    </TextField>
                </div>
            </Stack>
        </div>
    );
};

UserInfo.propTypes = {
    user: PropTypes.shape(User).isRequired,
};

