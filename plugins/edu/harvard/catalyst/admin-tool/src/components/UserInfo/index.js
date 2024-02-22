import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import BottomNavigation from '@mui/material/BottomNavigation';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from "@mui/material/IconButton";
import ReplayIcon from '@mui/icons-material/Replay';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { InputAdornment} from "@mui/material";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {saveUser, saveUserStatusConfirmed} from "actions";
import { User } from "models";
import "./UserInfo.scss";

export const UserInfo = ({selectedUser, cancelEdit}) => {
    const [updatedUser, setUpdatedUser] = useState(selectedUser.user);
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordVerify, setShowPasswordVerify] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const dispatch = useDispatch();

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowPasswordVerify = () => {
        setShowPasswordVerify(!showPasswordVerify);
    };

    const saveUserAndParams = () => {
        setShowSaveBackdrop(true);

        dispatch(saveUser({user: updatedUser}));
    };

    const handleUpdate = (field, value) => {
        let newUser = {
            ...updatedUser
        }
        newUser[field] = value;
        newUser.isUpdated = true;

        setUpdatedUser(newUser);

        if(JSON.stringify(newUser) !== JSON.stringify(selectedUser.user)){
            setIsDirty(true);
        }else{
            setIsDirty(false);
        }
    }

    const handleResetUserDetails = () => {
        setUpdatedUser({...selectedUser.user});
        setIsDirty(false);
    }

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    useEffect(() => {
        if(selectedUser.saveStatus === "SUCCESS"){
            setShowSaveBackdrop(false);
            dispatch(saveUserStatusConfirmed());
            setSaveStatusMsg("Saved user");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
        if(selectedUser.saveStatus === "FAIL"){
            setShowSaveBackdrop(false);
            dispatch(saveUserStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save user");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }

        setUpdatedUser(selectedUser.user);
    }, [selectedUser]);

    return (
        <Box  className="UserInfo" sx={{ width: '100%' }}>
            <div className={"ResetEditPage"}>
                <IconButton color="primary" aria-label="add params" onClick={handleResetUserDetails} variant={"outlined"}>
                    <ReplayIcon/>
                </IconButton>
            </div>
            <Stack
                className={"mainStack"}
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={3}
                useFlexGap
            >
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        required
                        label="User Name"
                        value={updatedUser.username}
                        onChange={(event) => handleUpdate("username", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>

                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        required
                        label="Full Name"
                        value={updatedUser.fullname}
                        onChange={(event) => handleUpdate("fullname", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>

                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        label="Email"
                        value={updatedUser.email}
                        onChange={(event) => handleUpdate("email", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={updatedUser.password}
                        onChange={(event) => handleUpdate("password", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password verify visibility"
                                        onClick={handleClickShowPassword}
                                        edge="end"
                                    >
                                        {showPasswordVerify ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        label="Verify Password"
                        type={showPasswordVerify ? "text" : "password"}
                        value={updatedUser.passwordVerify}
                        onChange={(event) => handleUpdate("passwordVerify", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password verify visibility"
                                        onClick={handleClickShowPasswordVerify}
                                        edge="end"
                                    >
                                        {showPasswordVerify ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        select
                        className={"mainField"}
                        label="Is Admin"
                        value={updatedUser.isAdmin}
                        onChange={(event) => handleUpdate("isAdmin", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value={"false"}>No</MenuItem>
                        <MenuItem value={"true"}>Yes</MenuItem>
                    </TextField>
                </div>
            </Stack>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation className={"EditUserActions"}>
                    <div  className="EditUserActionSecondary">
                        <Button onClick={cancelEdit} variant="outlined"> Cancel </Button>
                    </div>
                    <div className="EditUserActionPrimary">
                        <Button  variant="outlined" onClick={saveUserAndParams} disabled={!isDirty}> Save </Button>
                    </div>
                </BottomNavigation>
                <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            </Paper>

            <Snackbar
                open={showSaveStatus}
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'top', horizontal : "center" }}
            >
                <Alert
                    onClose={handleCloseSaveAlert}
                    severity={saveStatusSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {saveStatusMsg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

UserInfo.propTypes = {
    user: PropTypes.shape(User).isRequired,
};

