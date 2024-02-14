import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { User } from "models";

import "./UserInfo.scss";

export const UserInfo = ({user, updateUser}) => {
    const dispatch = useDispatch();

    //useEffect(() => {
    //}, []);

    return (
        <Box className="UserInfo">
            <h3> User Details </h3>
            <Grid container spacing={2}>
                <Grid item xs={7}>
                    <TextField
                        className="inputField"
                        required
                        label="User Name"
                        defaultValue={user.username}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={7}>
                    <TextField
                        className="inputField"
                        required
                        label="Full Name"
                        defaultValue={user.fullname}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={7}>
                    <TextField
                        className="inputField"
                        label="Email"
                        defaultValue={user.email}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

UserInfo.propTypes = {
    user: PropTypes.shape(User).isRequired,
};

