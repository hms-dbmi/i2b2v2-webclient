import { useDispatch} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Stack from '@mui/material/Stack';
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import Button from "@mui/material/Button";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import ReplayIcon from "@mui/icons-material/Replay";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {saveHiveDomain, saveHiveDomainStatusConfirmed} from "actions";

import "./DomainSettings.scss";

export const DomainSettings = ({allHives, updatedDomainSettings, updateDomainSettings}) => {
    const [isDirty, setIsDirty] = useState(false);
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");

    const dispatch = useDispatch();

    const handleUpdate = (field, value) => {
        let newDomainSettings = {
            ...updatedDomainSettings
        }
        newDomainSettings[field] = value;

        updateDomainSettings(newDomainSettings);

        if(JSON.stringify(newDomainSettings) !== JSON.stringify(allHives.hiveDomains[0])){
            setIsDirty(true);
        }else{
            setIsDirty(false);
        }
    }

    const handleResetPage = () => {
        updateDomainSettings({...allHives.hiveDomains[0]});
        setIsDirty(false);
    }

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    const saveDomainSettings = () => {
        setShowSaveBackdrop(true);

        dispatch(saveHiveDomain({hiveDomain: updatedDomainSettings}));
    };


    useEffect(() => {
        if(JSON.stringify(updatedDomainSettings) !== JSON.stringify(allHives.hiveDomains[0])){
            setIsDirty(true);
        }

    }, [updatedDomainSettings]);

    useEffect(() => {
        if(allHives.saveStatus === "SUCCESS"){
            setShowSaveBackdrop(false);
            dispatch(saveHiveDomainStatusConfirmed());
            setSaveStatusMsg("Saved hive settings");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
        if(allHives.saveStatus === "FAIL"){
            setShowSaveBackdrop(false);
            dispatch(saveHiveDomainStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save hive domain settings");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }
    }, [allHives]);


    return (
        <div className="DomainSettings">
            <div className={"ResetEditPage"}>
                <IconButton color="primary" aria-label="add params" onClick={handleResetPage} variant={"outlined"}>
                    <ReplayIcon/>
                </IconButton>
            </div>
            <Stack
                className={"DomainSettingsForm"}
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={3}
                useFlexGap
            >
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        disabled
                        label="Domain ID"
                        value={updatedDomainSettings.domainId}
                        onChange={(event) => handleUpdate("domainId", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        disabled
                        label="Domain Name"
                        value={updatedDomainSettings.domainName}
                        onChange={(event) => handleUpdate("domainName", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
                <div className={"mainField"}>
                    <TextField
                        select
                        className={"inputField"}
                        label="Environment"
                        value={updatedDomainSettings.environment}
                        onChange={(event) => handleUpdate("environment", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value={"DEVELOPMENT"}>Development</MenuItem>
                        <MenuItem value={"PRODUCTION"}>Production</MenuItem>
                        <MenuItem value={"TEST"}>Test</MenuItem>
                    </TextField>
                </div>
                <div className={"mainField"}>
                    <TextField
                        className="inputField"
                        label="Help URL"
                        value={updatedDomainSettings.helpURL}
                        onChange={(event) => handleUpdate("helpURL", event.target.value)}
                        variant="standard"
                        InputLabelProps={{ shrink: true }}
                    />
                </div>
            </Stack>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation className={"EditActions"}>
                    <div className="EditActionPrimary">
                        <Button  variant="outlined" onClick={saveDomainSettings} disabled={!isDirty}> Save </Button>
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
        </div>
    );
};

DomainSettings.propTypes = {};

