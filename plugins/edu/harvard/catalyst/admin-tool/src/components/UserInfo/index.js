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
import { SelectedUser } from "models";
import "./UserInfo.scss";

export const UserInfo = ({selectedUser, cancelEdit, updateUser, updatedUser}) => {
    const allUsers = useSelector((state) => state.allUsers );
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordVerify, setShowPasswordVerify] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isUsernameNotValid, setIsUsernameNotValid] = useState(false);
    const [usernameNotValidError, setUsernameNotValidError] = useState("");
    const [isFullnameNotValid, setIsFullnameNotValid] = useState(false);
    const [fullnameNotValidError, setFullnameNotValidError] = useState("");
    const [isEmailNotValid, setIsEmailNotValid] = useState(false);
    const [emailNotValidError, setEmailNotValidError] = useState("");
    const [isPasswordNotValid, setIsPasswordNotValid] = useState(false);
    const [passwordNotValidError, setPasswordNotValidError] = useState("");
    const [doPasswordsNotMatch, setDoPasswordsNotMatch] = useState(false);
    const [passwordsDoNotMatchError, setPasswordsDoNotMatchError] = useState("");
    const [isNewUser, setIsNewUser] = useState(false);
    const dispatch = useDispatch();

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleClickShowPasswordVerify = () => {
        setShowPasswordVerify(!showPasswordVerify);
    };

    const validateSaveUser = () => {
        let isValid = true;
        if(!updatedUser.username || updatedUser.username.length === 0){
            setIsUsernameNotValid(true);
            setUsernameNotValidError("User Name is required");
            isValid = false;
        }else{
            setIsUsernameNotValid(false);
            setUsernameNotValidError("");
        }

        if(!updatedUser.fullname || updatedUser.fullname.length === 0){
            setIsFullnameNotValid(true);
            setFullnameNotValidError("Full Name is required");
            isValid = false;
        }
        else{
            setIsFullnameNotValid(false);
            setFullnameNotValidError("");
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if(updatedUser.email && updatedUser.email.length > 0 && !emailRegex.test(updatedUser.email)){
            setIsEmailNotValid(true);
            setEmailNotValidError("Enter a valid email");
            isValid = false;
        }
        else{
            setIsEmailNotValid(false);
            setEmailNotValidError("");
        }

        //if this is a new user check the password fields
        updatedUser.password = updatedUser.password.trim();
        if(isNewUser && updatedUser.password.length === 0) {
                setIsPasswordNotValid(true);
                setPasswordNotValidError("Password is required");
                isValid = false;
        } else {
            setIsPasswordNotValid(false);
            setPasswordNotValidError("");
        }


        if (isNewUser && updatedUser.password !== updatedUser.passwordVerify) {
            setDoPasswordsNotMatch(true);
            setPasswordsDoNotMatchError("Passwords do not match");
            isValid = false;
        } else {
            setDoPasswordsNotMatch(false);
            setPasswordsDoNotMatchError("");
        }

        return isValid;
    }

    const saveUserInfo = () => {
        if(validateSaveUser()) {
            setShowSaveBackdrop(true);

            if(updatedUser.username.length > 0 ){
                updatedUser.username = updatedUser.username.trim();
            }

            dispatch(saveUser({user: updatedUser}));
        }
    };

    const checkIfNewUser = () => {
        if(allUsers) {
            const userFound = allUsers.users.filter((user) => user.username === updatedUser.username);
            if (userFound.length === 0) {
                setIsNewUser(true);
            } else {
                setIsNewUser(false);
            }
        }
    }
    const handleUpdate = (field, value) => {
        let newUser = {
            ...updatedUser
        }
        newUser[field] = value;

        updateUser(newUser);

        if(JSON.stringify(newUser) !== JSON.stringify(selectedUser.user)){
            setIsDirty(true);
        }else{
            setIsDirty(false);
        }
    }

    const handleResetUserDetails = () => {
        updateUser({...selectedUser.user});
        setIsDirty(false);
    }

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    useEffect(() => {
        if(selectedUser.saveStatus === "SUCCESS"){
            setShowSaveBackdrop(false);
            dispatch(saveUserStatusConfirmed());
            setSaveStatusMsg("Saved user " + selectedUser.user.username);
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
        if(selectedUser.saveStatus === "FAIL"){
            setShowSaveBackdrop(false);
            dispatch(saveUserStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save user " + selectedUser.user.username);
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }
    }, [selectedUser]);

    useEffect(() => {
        if(JSON.stringify(updatedUser) !== JSON.stringify(selectedUser.user)){
            setIsDirty(true);
        }

        checkIfNewUser();

    }, [updatedUser]);

    return (
        <Box  className="UserInfo" sx={{ width: '100%' }}>
            <div className={"ResetEditPage"}>
                <IconButton color="primary" aria-label="add params" onClick={handleResetUserDetails} variant={"outlined"}>
                    <ReplayIcon/>
                </IconButton>
            </div>
            <Stack
                className={"UserInfoForm"}
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
                        error={isUsernameNotValid}
                        helperText={usernameNotValidError}
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
                        error={isFullnameNotValid}
                        helperText={fullnameNotValidError}
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
                        error={isEmailNotValid}
                        helperText={emailNotValidError}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        required={isNewUser}
                        className="inputField"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={updatedUser.password}
                        onChange={(event) => handleUpdate("password", event.target.value)}
                        error={isPasswordNotValid}
                        helperText={passwordNotValidError}
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
                        required={isNewUser}
                        className="inputField"
                        label="Verify Password"
                        type={showPasswordVerify ? "text" : "password"}
                        value={updatedUser.passwordVerify}
                        onChange={(event) => handleUpdate("passwordVerify", event.target.value)}
                        error = {doPasswordsNotMatch}
                        helperText={passwordsDoNotMatchError}
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
                        className={"inputField"}
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
                        <Button  variant="outlined" onClick={saveUserInfo} disabled={!isDirty}> Save </Button>
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
                onClose={handleCloseAlert}
            >
                <Alert
                    onClose={handleCloseAlert}
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
    selectedUser: PropTypes.shape(SelectedUser).isRequired,
};

