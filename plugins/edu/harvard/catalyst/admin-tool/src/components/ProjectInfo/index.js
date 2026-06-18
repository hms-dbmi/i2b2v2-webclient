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
import Typography from "@mui/material/Typography";
import {saveProject, saveProjectStatusConfirmed} from "actions";
import { Project } from "models";
import "./ProjectInfo.scss";

export const ProjectInfo = ({selectedProject, cancelEdit, doSave, setSaveCompleted}) => {
    const [updatedProject, setUpdatedProject] = useState(selectedProject.project);
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordVerify, setShowPasswordVerify] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [isNameNotValid, setIsNameNotValid] = useState(false);
    const [nameNotValidError, setNameNotValidError] = useState("");
    const [isIdNotValid, setIsIdNotValid] = useState(false);
    const [idNotValidError, setIdNotValidError] = useState("");
    const [isPathNotValid, setIsPathNotValid] = useState(false);
    const [pathNotValidError, setPathNotValidError] = useState("");

    const dispatch = useDispatch();

    const validateSaveProject = () => {
        let isValid = true;
        if(!updatedProject.internalId || updatedProject.internalId.length === 0){
            setIsIdNotValid(true);
            setIdNotValidError("ID is required");

            isValid = false;
        }else{
            setIsNameNotValid(false);
            setNameNotValidError("");
        }

        if(!updatedProject.name || updatedProject.name.length === 0){
            setIsNameNotValid(true);
            setNameNotValidError("Name is required");
            isValid = false;
        }else{
            setIsIdNotValid(false);
            setIdNotValidError("");
        }

        if(!updatedProject.path || updatedProject.path.length === 0){
            setIsPathNotValid(true);
            setPathNotValidError("Path is required");
            isValid = false;
        }else{
            setIsPathNotValid(false);
            setPathNotValidError("");
        }

        return isValid;
    }

    const saveProjectInfo = () => {
        if(validateSaveProject()) {
            setShowSaveBackdrop(true);
            dispatch(saveProject({project: updatedProject}));
        }else{
            setSaveCompleted(false);
        }
    };

    const handleUpdate = (field, value) => {
        let newProject = {
            ...updatedProject
        }
        newProject[field] = value;
        newProject.isUpdated = true;

        setUpdatedProject(newProject);

        if(JSON.stringify(newProject) !== JSON.stringify(selectedProject.project)){
            setIsDirty(true);
        }else{
            setIsDirty(false);
        }
    }

    const handleResetUserProjectDetails = () => {
        setUpdatedProject({...selectedProject.project});
        setIsDirty(false);
    }

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    const getTitle = () => {
        let title = "New Project - Details"

        if(selectedProject.project.name){
            title = selectedProject.project.name + " - Details";
        }
        return title;
    }

    useEffect(() => {
        if(selectedProject.saveStatus === "SUCCESS"){
            setShowSaveBackdrop(false);
            dispatch(saveProjectStatusConfirmed());
            setSaveCompleted(true);
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
            saveProjectInfo();
        }
    }, [doSave]);

    return (
        <Box  className="ProjectInfo" sx={{ width: '100%' }}>
            <Typography> {getTitle()} </Typography>

            <div className={"ResetEditPage"}>
                <IconButton color="primary" aria-label="add params" onClick={handleResetUserProjectDetails} variant={"outlined"}>
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
                        value={updatedProject.internalId || ""}
                        onChange={(event) => handleUpdate("internalId", event.target.value)}
                        error={isIdNotValid}
                        helperText={idNotValidError}
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
                        error={isNameNotValid}
                        helperText={nameNotValidError}
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
                        error={isPathNotValid}
                        helperText={pathNotValidError}
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
                autoHideDuration={4000}
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

