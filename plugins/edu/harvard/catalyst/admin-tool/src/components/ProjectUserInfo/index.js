import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import IconButton from "@mui/material/IconButton";
import ReplayIcon from '@mui/icons-material/Replay';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {saveProjectUser, saveProjectUserStatusConfirmed} from "actions";
import { SelectedUser, ADMIN_ROLES, DATA_ROLES, EDITOR_ROLE } from "models";

import "./ProjectUserInfo.scss";

export const ProjectUserInfo = ({selectedUser, selectedProject, cancelEdit, updateUser, updatedUser}) => {
    const [isDirty, setIsDirty] = useState(false);
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const dispatch = useDispatch();


    const saveProjectUserInfo = () => {
        setShowSaveBackdrop(true);
        const previousRoles = [selectedUser.user.adminPath.name, selectedUser.user.dataPath.name];

        if(selectedUser.user.editorPath === "true"){
            previousRoles.push(EDITOR_ROLE);
        }
        dispatch(saveProjectUser({user: updatedUser, selectedProject, previousRoles:previousRoles}));
    };

    const handleUpdate = (field, value) => {
        if(field === "adminPath"){
            value = ADMIN_ROLES[value];
        }

        if(field === "dataPath"){
            value = DATA_ROLES[value];
        }

        if(field === "editorPath"){
            value = "true";
        }

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
    }

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    useEffect(() => {
        if(selectedProject.saveUserStatus === "SUCCESS"){
            setShowSaveBackdrop(false);
            dispatch(saveProjectUserStatusConfirmed());
            setSaveStatusMsg("Saved roles for user " + selectedUser.user.username);
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
        if(selectedProject.saveUserStatus === "FAIL"){
            setShowSaveBackdrop(false);
            dispatch(saveProjectUserStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save roles for user " + selectedUser.user.username);
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }
    }, [selectedProject]);


    useEffect(() => {
        if(JSON.stringify(updatedUser) !== JSON.stringify(selectedUser.user)){
            setIsDirty(true);
        }

    }, [updatedUser]);

    return (
        <Box  className="ProjectUserInfo" sx={{ width: '100%' }}>
            <div className={"ResetEditPage"}>
                <IconButton color="primary" aria-label="add params" onClick={handleResetUserDetails} variant={"outlined"}>
                    <ReplayIcon/>
                </IconButton>
            </div>
            <Stack
                className={"ProjectUserInfoForm"}
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={3}
                useFlexGap
            >
                <div className={"mainField"}>
                    <TextField
                        select
                        className={"inputField"}
                        label="Admin Path"
                        value={updatedUser.adminPath.name}
                        onChange={(event) => handleUpdate("adminPath", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value={"MANAGER"}>Manager</MenuItem>
                        <MenuItem value={"USER"}>User</MenuItem>
                    </TextField>
                </div>
                <div className={"mainField"}>
                    <TextField
                        select
                        className={"inputField"}
                        label="Data Path"
                        value={updatedUser.dataPath.name}
                        onChange={(event) => handleUpdate("dataPath", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value={"DATA_PROT"}>Protected</MenuItem>
                        <MenuItem value={"DATA_DEID"}>De-identified Data</MenuItem>
                        <MenuItem value={"DATA_LDS"}>Limited Data Set</MenuItem>
                        <MenuItem value={"DATA_AGG"}>Aggregated</MenuItem>
                        <MenuItem value={"DATA_OBFSC"}>Obfuscated</MenuItem>

                    </TextField>
                </div>
                <div className={"mainField"}>
                    <TextField
                        select
                        className={"inputField"}
                        label="Editor Path"
                        value={updatedUser.editorPath}
                        onChange={(event) => handleUpdate("editorPath", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value={"true"}>Yes</MenuItem>
                        <MenuItem value={"false"}>No</MenuItem>
                    </TextField>
                </div>
            </Stack>
            <div className="EditUserActionPrimary">
                <Button  variant="outlined" onClick={saveProjectUserInfo} disabled={!isDirty}> Save </Button>
            </div>
            <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>

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

ProjectUserInfo.propTypes = {
    selectedUser: PropTypes.shape(SelectedUser).isRequired,
};

