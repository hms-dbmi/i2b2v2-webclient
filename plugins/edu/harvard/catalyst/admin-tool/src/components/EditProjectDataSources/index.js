import {useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./EditProjectDataSources.scss";
import {getAllProjectDataSources} from "../../actions";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import MenuItem from '@mui/material/MenuItem';
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CELL_ID } from "models";


export const EditProjectDataSources = ({selectedProject, doSave, setSaveCompleted}) => {
    const [updatedDataSources, setUpdatedDataSources] = useState(selectedProject.dataSources);
    const [showSaveBackdrop, setShowProcessingBackdrop] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const dispatch = useDispatch();

    const handleUpdate = (cellId, field, value) => {
        let newDataSource = {
            ...updatedDataSources
        }
        newDataSource[cellId][field] = value;
        newDataSource[cellId].isUpdated = true;

        setUpdatedDataSources(newDataSource);

        if(JSON.stringify(newDataSource) !== JSON.stringify(selectedProject.dataSources)){
            // setIsDirty(true);
        }else{
            //setIsDirty(false);
        }
    }

    const handleSave = () => {
        setSaveCompleted(true);
    };

    useEffect(() => {
        if(doSave){
            handleSave();
        }
    }, [doSave]);


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
                            variant="standard"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                </Stack>
            </Card>
        )
    }
    return (
        <div className="EditProjectDataSources" >
            <Typography> {selectedProject.project.name + " - Data Source Details"} </Typography>

            <Stack direction="row" spacing={6} useFlexGap>
                { dsForm(CELL_ID.CRC) }
                { dsForm(CELL_ID.ONT) }
                { dsForm(CELL_ID.WORK) }
            </Stack>


            <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );

};

EditProjectDataSources.propTypes = {};