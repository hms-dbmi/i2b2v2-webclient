import React, {useState, useEffect, useRef} from "react";
import { useDispatch } from "react-redux";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import {
    Alert,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Grid,
    LinearProgress,
    Link,
    MenuItem,
    TextField
} from "@mui/material";
import {createSearchAutosuggest, getSearchAutosuggestDetails} from "../../reducers/editProjectInfoSlice";
import "./EditProjectSearchAutosuggest.scss";
import {EventLogView} from "./EventLogView";
import {SEARCH_AUTOSUGGEST_STATUS} from "../../models";

export const EditProjectSearchAutosuggest = ({selectedProject}) => {
    const searchAutosuggestDetails = selectedProject.searchAutosuggestDetails;

    const [includePatientCounts, setIncludePatientCounts] = useState(false);
    const [commonDataModel, setCommonDataModel] = useState("i2b2");
    const [showExpandedProgressMsg, setShowExpandedProgressMsg] = useState(false);
    const [truncateProgressMsg, setTruncateProgressMsg] = useState(false);
    const [isRunning, setIsRunning] = useState(
        searchAutosuggestDetails.status ===SEARCH_AUTOSUGGEST_STATUS.RUNNING_TOTALNUM
        || searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_AUTOSUGGEST);
    const MAX_PROGRESS_MSG_LENGTH = 100;

    const dispatch = useDispatch();
    const isPollingRef = useRef(true);


    const SEARCH_AUTOSUGGEST_TOTALNUM_MAPPING = {
        OMOP: "Includes OMOP patient counts",
        I2B2: "Includes i2b2 patient counts",
        NONE: "Search index only",
    }

    const handleCreateSearchAutosuggest = () => {
        const dataInput = {
            project: selectedProject.project
        };
        if(includePatientCounts){
            dataInput.commonDataModel = commonDataModel;
        }
        dispatch(createSearchAutosuggest(dataInput));
        setIsRunning(true);
        startPollingForDetails(true);
    }

    const handleIncludePatientCountChange = (event)=> {
        setIncludePatientCounts(event.target.checked);
    }

    const handleCommonDataModelChange = (event)=> {
        setCommonDataModel(event.target.value);
    }

    const toggleShowExpandedProgressMsg = () => {
        setShowExpandedProgressMsg(!showExpandedProgressMsg);
    }

    const getStatusDisplay = (status) => {
        let displayStatus = status;
        if(status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_TOTALNUM
            || status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_AUTOSUGGEST){
            displayStatus = "RUNNING";
        }
        return displayStatus;
    }

    const getAutosuggestProgress = (progressMsg, status) => {
        const splitMsgResult = progressMsg.split(' ');

        let currectProgressPercent = 0;
        if(splitMsgResult.length > 2){
            const progNumStr = splitMsgResult[0].trim();
            const progNumTotalStr = splitMsgResult[2].trim();

            const progNum = parseInt(progNumStr);
            const progNumTotal = parseInt(progNumTotalStr);

            if(progNum >= 0 && progNumTotal > 0){
                currectProgressPercent = Math.round((progNum / progNumTotal) * 100);
            }

            if(currectProgressPercent === 100 && (status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_TOTALNUM
                || status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_AUTOSUGGEST)){
                currectProgressPercent = 99;
            }
        }

        console.log( "currentProgressPercent status: ", status);
        return currectProgressPercent;
    }

    useEffect(() => {
        if(!(searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_TOTALNUM
                || searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_AUTOSUGGEST)){
           setIsRunning(false);

        }
    }, [selectedProject.status]);

    const startPollingForDetails = (isAutosuggestRunning) => {
        isPollingRef.current = true;

        const pollData = () => {
            if (!isPollingRef.current) return;

            dispatch(getSearchAutosuggestDetails({project: selectedProject.project}));

            if (isPollingRef.current && isAutosuggestRunning) {
                setTimeout(pollData, 5000); // Poll every 5 seconds
            }
        };

        pollData();
    }
    useEffect(() => {

        startPollingForDetails(isRunning);

        return () => {
            isPollingRef.current = false;
        };
    }, [dispatch]);

    useEffect(() => {
        if(searchAutosuggestDetails.progressMsg && searchAutosuggestDetails.progressMsg.length >  MAX_PROGRESS_MSG_LENGTH){
            setTruncateProgressMsg(true);
        }else{
            setTruncateProgressMsg(false);
        }
    }, [searchAutosuggestDetails.progressMsg]);

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
                    <Button className={"autosuggestAction"}
                            variant="contained" startIcon={<AddIcon/>}
                            onClick={handleCreateSearchAutosuggest}
                            disabled={searchAutosuggestDetails.status !== SEARCH_AUTOSUGGEST_STATUS.ERROR && searchAutosuggestDetails.status !== SEARCH_AUTOSUGGEST_STATUS.FINISHED}
                    >
                        Generate search index
                    </Button>

                    <Card className="IndexStatusView" variant="outlined">
                        <CardContent>
                            <Box >
                                <Box className={"progressLabelMain"}>
                                    <Box className={"progressMsg"}>
                                        <Typography variant="body2">
                                            <span className={searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.ERROR ? "progressStatus error" : "progressStatus nonErrorProgress"}>
                                                {getStatusDisplay(searchAutosuggestDetails.status) + (searchAutosuggestDetails.progressMsg ? ": " : "")}
                                            </span>
                                            {truncateProgressMsg &&
                                                <span>
                                                    {showExpandedProgressMsg ? <span>{searchAutosuggestDetails.progressMsg} <Link onClick={toggleShowExpandedProgressMsg}>show less</Link></span> : <span>{searchAutosuggestDetails.progressMsg.substring(0,MAX_PROGRESS_MSG_LENGTH) + "..."}<Link onClick={toggleShowExpandedProgressMsg}>show more</Link></span>}
                                                </span>
                                            }
                                            {!truncateProgressMsg && <span>{searchAutosuggestDetails.progressMsg}</span> }
                                            <span>{searchAutosuggestDetails.status !== SEARCH_AUTOSUGGEST_STATUS.RUNNING_TOTALNUM && searchAutosuggestDetails.status !== SEARCH_AUTOSUGGEST_STATUS.SCHEDULED && " (" + getAutosuggestProgress(searchAutosuggestDetails.progressMsg, searchAutosuggestDetails.status) + "%)"}</span>
                                        </Typography>
                                    </Box>
                                    <Box className={"runOptionsInfo"}>
                                        {SEARCH_AUTOSUGGEST_TOTALNUM_MAPPING[searchAutosuggestDetails.calculateTotalNum]}
                                    </Box>
                                </Box>
                                <Box className={"progressBarMain"}>
                                    {(searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_TOTALNUM) && <LinearProgress className={"progressBar nonErrorProgress"} color={"inherit"}/>}
                                    {searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.RUNNING_AUTOSUGGEST && <LinearProgress className={"progressBar nonErrorProgress"} color={"inherit"} variant="determinate" value={getAutosuggestProgress(searchAutosuggestDetails.progressMsg, searchAutosuggestDetails.status)}/>}
                                    {searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.FINISHED
                                        && <LinearProgress className={"progressBar nonErrorProgress"} color={"inherit"} variant="determinate" value={100}/>}
                                    {searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.ERROR
                                        && <LinearProgress className={"progressBar error"} color={"inherit"} variant="determinate" value={100}/>}
                                    {searchAutosuggestDetails.status === SEARCH_AUTOSUGGEST_STATUS.SCHEDULED
                                        && <LinearProgress className={"progressBar scheduledProgress"} color={"inherit"} variant="determinate" value={0}/>}

                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <div> <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1.5 }}>Directory</Typography></div>
                                    {searchAutosuggestDetails.autosuggestIndexLocation ? searchAutosuggestDetails.autosuggestIndexLocation: "-"}
                                </Grid>
                                <Grid item xs={6}>
                                    <div> <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1.5 }}>Previous Directory</Typography></div>
                                    {searchAutosuggestDetails.oldAutosuggestIndexLocation ? searchAutosuggestDetails.oldAutosuggestIndexLocation: "-"}
                                </Grid>
                                <Grid item xs={6}>
                                    <div> <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1.5 }}>Start Date</Typography></div>
                                    {searchAutosuggestDetails.startDateTime ?  // Format the Date object
                                        searchAutosuggestDetails.startDateTime.toLocaleDateString() + " " + searchAutosuggestDetails.startDateTime.toLocaleTimeString() : "-"
                                    }
                                </Grid>
                                <Grid item xs={6}>
                                    <div> <Typography sx={{ color: 'text.secondary', fontSize: 14, mb: 1.5 }}>Complete Date</Typography></div>
                                    {searchAutosuggestDetails.endDateTime ?  // Format the Date object
                                        searchAutosuggestDetails.endDateTime.toLocaleDateString() + " " + searchAutosuggestDetails.endDateTime.toLocaleTimeString() : "-"
                                    }
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
            <EventLogView eventLogs={searchAutosuggestDetails.eventLogs} hasError={false}/>
        </div>
    )
}
