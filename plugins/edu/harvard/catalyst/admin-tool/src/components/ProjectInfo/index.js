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
import {saveProject, saveProjectStatusConfirmed} from "actions";
import { Project } from "models";
import "./ProjectInfo.scss";
import Typography from "@mui/material/Typography";

export const ProjectInfo = ({selectedProject, cancelEdit, doSave, setSaveCompleted}) => {
    const [updatedProject, setUpdatedProject] = useState(selectedProject.project);
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

    const saveProjectInfo = () => {
        setShowSaveBackdrop(true);

        dispatch(saveProject({project: updatedProject}));
    };

    const handleUpdate = (field, value) => {
        let newUser = {
            ...updatedProject
        }
        newUser[field] = value;
        newUser.isUpdated = true;

        setUpdatedProject(newUser);

        if(JSON.stringify(newUser) !== JSON.stringify(selectedUser.user)){
            setIsDirty(true);
        }else{
            setIsDirty(false);
        }
    }

    const handleResetUserDetails = () => {
        setUpdatedProject({...selectedUser.user});
        setIsDirty(false);
    }

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    const saveProject = () => {

    };

    useEffect(() => {
        if(selectedProject.saveStatus === "SUCCESS"){
            setShowSaveBackdrop(false);
            dispatch(saveProjectStatusConfirmed());
            setSaveStatusMsg("Saved project");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
        if(selectedProject.saveStatus === "FAIL"){
            setShowSaveBackdrop(false);
            dispatch(saveProjectStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save project");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }

        setUpdatedProject(selectedProject.project);
    }, [selectedProject]);

    useEffect(() => {
        if(doSave){
            setSaveCompleted(true);
        }
    }, [doSave]);

    return (
        <Box  className="UserInfo" sx={{ width: '100%' }}>
            <Typography> {selectedProject.project.name + " - Details"} </Typography>

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
                        label="ID"
                        value={updatedProject.internalId}
                        onChange={(event) => handleUpdate("id", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>

                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        required
                        label="Name"
                        value={updatedProject.name}
                        onChange={(event) => handleUpdate("name", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        required
                        className={"mainField"}
                        label="Path"
                        value={updatedProject.path}
                        onChange={(event) => handleUpdate("path", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>

                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        label="Wiki"
                        value={updatedProject.wiki}
                        onChange={(event) => handleUpdate("wiki", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        label="Key"
                        value={updatedProject.key}
                        onChange={(event) => handleUpdate("key", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        label="Description"
                        value={updatedProject.description}
                        onChange={(event) => handleUpdate("description", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
            </Stack>

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

ProjectInfo.propTypes = {
    selectedProject: PropTypes.shape(Project).isRequired,
};

