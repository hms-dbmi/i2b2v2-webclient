import {useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./EditProjectDataSources.scss";
import {
    saveProject,
    saveProjectDataSources,
    saveProjectDataSourcesStatusConfirmed,
    saveProjectStatusConfirmed
} from "../../actions";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import MenuItem from '@mui/material/MenuItem';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CELL_ID } from "models";
import IconButton from "@mui/material/IconButton";
import ReplayIcon from "@mui/icons-material/Replay";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";


export const EditProjectDataSources = ({selectedProject, doSave, setSaveCompleted}) => {
    const [updatedDataSources, setUpdatedDataSources] = useState({...selectedProject.dataSources});
    const [showSaveBackdrop, setShowProcessingBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const [isNameNotValid, setIsNameNotValid] = useState({});
    const [nameNotValidError, setNameNotValidError] = useState({});
    const [isDBSchemaNotValid, setIsDBSchemaNotValid] = useState({});
    const [dbSchemaNotValidError, setDBSchemaNotValidError] = useState({});
    const [isJndiDataSourceNotValid, setIsJndiDataSourceNotValid] = useState({});
    const [jndiDataSourceNotValidError, setJndiDataSourceNotValidError] = useState({});
    const [isDBServerTypeNotValid, setIsDBServerTypeNotValid] = useState({});
    const [dbServerTypeNotValidError, setDBServerTypeNotValidError] = useState({});
    const dispatch = useDispatch();

    const handleUpdate = (cellId, field, value) => {
        let newDataSources = {
            ...updatedDataSources
        }

        let newDataSource = {
            ...newDataSources[cellId]
        };

        newDataSource[field] = value;

        newDataSources[cellId] = newDataSource;
        setUpdatedDataSources(newDataSources);
    }

    const handleSave = () => {
        if(validateSaveProjectDataSource()) {
           setShowProcessingBackdrop(true);
            dispatch(saveProjectDataSources({project: selectedProject.project, dataSources: updatedDataSources}));
        }else{
            setSaveCompleted(false);
        }
    };

    const validateSaveProjectDataSource = () => {
        let isValid = true;
        const cellIds = [CELL_ID.CRC, CELL_ID.ONT, CELL_ID.WORK];
        let newIsNameNotValid = {...isNameNotValid};
        let newNameNotValidError = {...nameNotValidError};
        let newIsDBServerTypeNotValid = {...isDBServerTypeNotValid};
        let newDBServerTypeNotValidError = {...dbServerTypeNotValidError};
        let newIsDBSchemaNotValid = {...isDBSchemaNotValid};
        let newDBSchemaNotValidError = {...dbSchemaNotValidError};
        let newIsJndiDataSourceNotValid = {...isJndiDataSourceNotValid};
        let newJndiDataSourceNotValidError = {...jndiDataSourceNotValidError};

        cellIds.map((cellId) => {
            const dataSource = updatedDataSources[cellId];
            if (!dataSource.name || dataSource.name.length === 0) {
                newIsNameNotValid[cellId] = true;
                setIsNameNotValid(newIsNameNotValid);
                newNameNotValidError[cellId] = "Name is required";
                setNameNotValidError(newNameNotValidError);
                isValid = false;
            } else {
                newIsNameNotValid[cellId] = false;
                setIsNameNotValid(newIsNameNotValid);

                newNameNotValidError[cellId] = "";
                setNameNotValidError(newNameNotValidError);
            }

            if (!dataSource.dbServerType || dataSource.dbServerType.length === 0) {
                newIsDBServerTypeNotValid[cellId] = true;
                setIsDBServerTypeNotValid(newIsDBServerTypeNotValid);

                newDBServerTypeNotValidError[cellId] = "Database Server is required";
                setDBServerTypeNotValidError(newDBServerTypeNotValidError);
                isValid = false;
            } else {
                newIsDBServerTypeNotValid[cellId] = false;
                setIsDBServerTypeNotValid(newIsDBServerTypeNotValid);

                newDBServerTypeNotValidError[cellId] = "";
                setDBServerTypeNotValidError(newDBServerTypeNotValidError);
            }

            if (!dataSource.dbSchema|| dataSource.dbSchema.length === 0) {
                newIsDBSchemaNotValid[cellId] = true;
                setIsDBSchemaNotValid(newIsDBSchemaNotValid);

                newDBSchemaNotValidError[cellId] = "Database Schema is required";
                setDBSchemaNotValidError(newDBSchemaNotValidError);
                isValid = false;
            } else {
                newIsDBSchemaNotValid[cellId] = false;
                setIsDBSchemaNotValid(newIsDBSchemaNotValid);

                newDBSchemaNotValidError[cellId] = "";
                setDBSchemaNotValidError(newDBSchemaNotValidError);
            }

            if (!dataSource.jndiDataSource || dataSource.jndiDataSource.length === 0) {
                newIsJndiDataSourceNotValid[cellId] = true;
                setIsJndiDataSourceNotValid(newIsJndiDataSourceNotValid);

                newJndiDataSourceNotValidError[cellId] = "JNDI Data Source is required";
                setJndiDataSourceNotValidError(newJndiDataSourceNotValidError);
                isValid = false;

            } else {
                newIsJndiDataSourceNotValid[cellId] = false;
                setIsJndiDataSourceNotValid(newIsJndiDataSourceNotValid);

                newJndiDataSourceNotValidError[cellId] = "";
                setJndiDataSourceNotValidError(newJndiDataSourceNotValidError);
            }
        });

        return isValid;
    }

    const dsForm = (cellId) => {
        return (
            <Card className={"DataSource"}>
                <Stack
                    className={"mainStack"}
                    direction="column"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={3}
                    useFlexGap
                >
                    <Typography>{cellId} Details</Typography>

                    <div className={"mainField"}>
                        <TextField
                            select
                            className="inputField"
                            required
                            label="Database Server"
                            value={updatedDataSources[cellId] ? updatedDataSources[cellId].dbServerType : ""}
                            onChange={(event) => handleUpdate(cellId, "dbServerType", event.target.value)}
                            error={isDBServerTypeNotValid[cellId]}
                            helperText={dbServerTypeNotValidError[cellId]}
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                        >
                            <MenuItem key={"SQLSERVER"} value={"SQLSERVER"}>
                                {"Sql Server"}
                            </MenuItem>
                            <MenuItem key={"POSTGRESQL"} value={"POSTGRESQL"}>
                                {"PostgreSql"}
                            </MenuItem>
                            <MenuItem key={"ORACLE"} value={"ORACLE"}>
                                {"Oracle"}
                            </MenuItem>
                        </TextField>
                    </div>
                    <div className={"mainField"}>
                        <TextField
                            className="inputField"
                            required
                            label="Name"
                            value={updatedDataSources[cellId] ? updatedDataSources[cellId].name: ""}
                            onChange={(event) => handleUpdate(cellId, "name", event.target.value)}
                            error={isNameNotValid[cellId]}
                            helperText={nameNotValidError[cellId]}
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>

                    <div className={"mainField"}>
                        <TextField
                            className="inputField"
                            required
                            disabled
                            label="Project Path"
                            value={updatedDataSources[cellId] && updatedDataSources[cellId].projectPath  ? updatedDataSources[cellId].projectPath : selectedProject.project.path}
                            onChange={(event) => handleUpdate(cellId, "projectPath", event.target.value)}
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                    <div className={"mainField"}>
                        <TextField
                            className="inputField"
                            required
                            label="JNDI Data Source"
                            value={updatedDataSources[cellId] ? updatedDataSources[cellId].jndiDataSource : ""}
                            onChange={(event) => handleUpdate(cellId, "jndiDataSource", event.target.value)}
                            error={isJndiDataSourceNotValid[cellId]}
                            helperText={jndiDataSourceNotValidError[cellId]}
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                    <div className={"mainField"}>
                        <TextField
                            className="inputField"
                            required
                            label="Database Schema"
                            value={updatedDataSources[cellId] ? updatedDataSources[cellId].dbSchema : ""}
                            onChange={(event) => handleUpdate(cellId, "dbSchema", event.target.value)}
                            error={isDBSchemaNotValid[cellId]}
                            helperText={dbSchemaNotValidError[cellId]}
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                </Stack>
            </Card>
        )
    }

    const handleResetDataSources = () => {
        console.log("resetting data sources" + JSON.stringify(selectedProject.dataSources));
        setUpdatedDataSources({...selectedProject.dataSources});
    }

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    useEffect(() => {
        if(doSave){
            handleSave();
        }
    }, [doSave]);

    useEffect(() => {
        if(selectedProject.saveDSStatus === "SUCCESS"){
            setShowProcessingBackdrop(false);
            dispatch(saveProjectDataSourcesStatusConfirmed());
            setSaveCompleted(true);
        }
        if(selectedProject.saveDSStatus === "FAIL"){
            setShowProcessingBackdrop(false);
            dispatch(saveProjectDataSourcesStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save project data sources");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }

        setUpdatedDataSources({...selectedProject.dataSources});
    }, [selectedProject]);

    useEffect(() => {

        const timeoutId = setTimeout(() => {
            if(!updatedDataSources) {
                setShowProcessingBackdrop(true);
            }
        }, 2000);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if(updatedDataSources){
            setShowProcessingBackdrop(false);
        }
    }, [updatedDataSources]);

    return (
        <div className="EditProjectDataSources" >
            <Typography> {selectedProject.project.name + " - Data Source Details"} </Typography>
            <div className={"ResetEditPage"}>
                <IconButton color="primary" aria-label="reset data sources" onClick={handleResetDataSources} variant={"outlined"}>
                    <ReplayIcon/>
                </IconButton>
            </div>
            <Stack direction="row" spacing={6} useFlexGap>
                { dsForm(CELL_ID.CRC) }
                { dsForm(CELL_ID.ONT) }
                { dsForm(CELL_ID.WORK) }
            </Stack>


            <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>

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
        </div>
    );

};

EditProjectDataSources.propTypes = {};