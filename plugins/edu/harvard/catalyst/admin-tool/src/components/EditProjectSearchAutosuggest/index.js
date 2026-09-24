import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {Alert, Checkbox, FormControlLabel, MenuItem, TextField} from "@mui/material";
import {createSearchAutosuggest, getSearchAutosuggestDetails} from "../../reducers/editProjectInfoSlice";
import "./EditProjectSearchAutosuggest.scss";
import {EventLogView} from "./EventLogView";

export const EditProjectSearchAutosuggest = ({selectedProject}) => {
    const [includePatientCounts, setIncludePatientCounts] = useState(false);
    const [commonDataModel, setCommonDataModel] = useState("i2b2");

    const dispatch = useDispatch();

    const handleCreateSearchAutosuggest = () => {
    }

    const handleIncludePatientCountChange = (event)=> {
        setIncludePatientCounts(event.target.checked);
    }

    const handleCommonDataModelChange = (event)=> {
        setCommonDataModel(event.target.value);
    }

    return (
        <div className={"EditProjectSearchAutosuggest"}>
           <Box>
               <Typography> {selectedProject.project.name + " - Search/AutoSuggest"} </Typography>
           </Box>
            <Box className={"EditProjectSearchAutosuggestContent"}>
                <Typography className={"headerText"} variant="h6" >
                    Generate search index
                </Typography>
                <Typography variant="subtitle2">
                    Generate the index with or without calculating patient counts.
                </Typography>
                <Box className={"CreateSearchAutosuggest"}>
                    <Box className={"autosuggestFormInput"}>
                        <Box>
                            <FormControlLabel control={<Checkbox checked={includePatientCounts} onChange={handleIncludePatientCountChange}/>} label="Calculate patient counts with" />
                            <TextField
                                select
                                defaultValue={commonDataModel}
                                onChanged={handleCommonDataModelChange}
                                disabled={!includePatientCounts}
                                variant="standard"
                            >
                                <MenuItem key={"i2b2"} value={"i2b2"}>
                                        {"i2b2"}
                                </MenuItem>
                                <MenuItem key={"omop"} value={"omop"}>
                                    {"OMOP"}
                                </MenuItem>
                            </TextField>
                            <span>{" common data model"}</span>
                        </Box>
                        {includePatientCounts && <Box>
                            <Alert severity="warning">This option is resource intensive and may take considerable time
                                to complete.
                                This task executes in the background, and the application remains usable.</Alert>
                        </Box>
                        }
                    </Box>
                    <Button className={"autosuggestAction"} variant="contained" startIcon={<AddIcon/>} onClick={handleCreateSearchAutosuggest}>
                        Generate search index
                    </Button>

                </Box>
            </Box>
            <EventLogView eventLogs={[]} hasError={false}/>
        </div>
    )
}
