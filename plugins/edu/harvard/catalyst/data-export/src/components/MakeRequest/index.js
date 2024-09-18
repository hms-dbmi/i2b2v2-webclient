import React, {useState, useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import "../../css/modals.scss";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import {
    Backdrop,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";
import "./MakeRequest.scss";
import {
    makeRequest,
    makeRequestStatusConfirmed,
    updateRequestComments,
    updateRequestEmail,
    updateRequestPatientSet
} from "../../reducers/makeRequestSlice";

/* global i2b2 */
export const MakeRequest = () => {
    const dispatch = useDispatch();
    const makeRequestDetails = useSelector((state) => state.makeRequestDetails);
    const tableDef = useSelector((state) => state.tableDef);
    const [isEmailNotValid, setIsEmailNotValid] = useState(false);
    const [emailNotValidError, setEmailNotValidError] = useState("");
    const [isPatientSetNotValid, setIsPatientSetNotValid] = useState(false);
    const defaultPatientSetHelperText = "Drag and drop a patient set here";
    const [patientSetNotValidError, setPatientSetNotValidError] = useState(defaultPatientSetHelperText);

    const updateEmail = (value) => {
        dispatch(updateRequestEmail(value));
    }

    const updateComments = (value) => {
        dispatch(updateRequestComments(value));
    }

    const handleMakeRequest = () => {
        if(isValidRequest()) {
            dispatch(makeRequest({
                makeRequestDetails: makeRequestDetails,
                tableDefRows: tableDef.rows
            }));
        }
    }

    const isValidRequest = () => {
        let isValid = true;

        if (!makeRequestDetails.patientSet || makeRequestDetails.patientSet.title.length === 0) {
            setIsPatientSetNotValid(true);
            setPatientSetNotValidError("Patient Set is required");
            isValid = false;
        } else {
            setIsPatientSetNotValid(false);
            setPatientSetNotValidError(defaultPatientSetHelperText);
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if ((makeRequestDetails.email && makeRequestDetails.email.length > 0) && emailRegex.test(makeRequestDetails.email)) {
            setIsEmailNotValid(false);
            setEmailNotValidError("");
        } else {
            setIsEmailNotValid(true);
            setEmailNotValidError("Enter a valid email");
            isValid = false;
        }

        return isValid;
    }

    const handleConfirmStatus = () => {
        dispatch(makeRequestStatusConfirmed());
    };

    const handlePatientSetDrop = (sdx,ev) => {
        dispatch(updateRequestPatientSet(sdx));
    }

    useEffect(() => {
        if(i2b2) {
            i2b2.sdx.AttachType("makeRequestPatientSet", "PRS");
            i2b2.sdx.setHandlerCustom("makeRequestPatientSet", "PRS", "DropHandler", handlePatientSetDrop);
        }
    }, []);

    return (
        <Stack
            className={"MakeRequest"}
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={3}
            useFlexGap
        >
            <TextField
                id="makeRequestPatientSet"
                required
                className="inputField"
                label="Patient Set"
                variant="standard"
                fullWidth
                slotProps={{ input: { readOnly: true } }}
                error={isPatientSetNotValid}
                helperText={patientSetNotValidError}
                value={makeRequestDetails.patientSet.title}
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                required
                disabled={true}
                className="inputField"
                label="Table"
                defaultValue={"Table specifications from Define Table tab"}
                variant="standard"
                fullWidth
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                required
                className="inputField"
                label="Email"
                variant="standard"
                fullWidth
                value={makeRequestDetails.email}
                onChange={(event) => updateEmail(event.target.value)}
                error={isEmailNotValid}
                helperText={emailNotValidError}
                InputLabelProps={{ shrink: true }}
            />
            <TextField
                className="inputField comments"
                label="Comments"
                fullWidth
                maxRows={5}
                minRows={3}
                inputProps={{ maxLength: 1000 }}
                multiline
                value={makeRequestDetails.comments}
                helperText={"Max: 1,000 characters"}
                onChange={(event) => updateComments(event.target.value)}
                InputLabelProps={{ shrink: true }}
            />
            <div className={"MakeRequestSubmitMain"}>
                <Button className={"MakeRequestSubmit"} onClick={handleMakeRequest} variant="contained" >Submit</Button>
            </div>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={makeRequestDetails.isSubmitting}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            <Dialog
                open={makeRequestDetails.statusInfo.status === "SUCCESS"}
                onClose={handleConfirmStatus}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Data Request"}
                </DialogTitle>
                <DialogContent dividers>
                    <DialogContentText id="alert-dialog-description">
                       A data export request has been submitted.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" autoFocus onClick={handleConfirmStatus}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
