import React, { useState, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";

import "../../css/modals.scss";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Card, TextField} from "@mui/material";
import "./MakeRequest.scss";
import {makeRequest, updateRequestEmail} from "../../reducers/makeRequestSlice";

export const MakeRequest = ({}) => {
    const dispatch = useDispatch();
    const makeRequestDetails = useSelector((state) => state.makeRequestDetails);
    const [isEmailNotValid, setIsEmailNotValid] = useState(false);
    const [emailNotValidError, setEmailNotValidError] = useState("");
    const [isPatientSetNotValid, setIsPatientSetNotValid] = useState(false);
    const [patientSetNotValidError, setPatientSetNotValidError] = useState("");

    const updateEmail = (value) => {
        dispatch(updateRequestEmail(value));
    }

    const handleMakeRequest = () => {
        if(isValidRequest()) {
            dispatch(makeRequest());
        }
    }

    const isValidRequest = () => {
        let isValid = true;

        if(!makeRequestDetails.patientSet || Object.keys(makeRequestDetails.patientSet).length === 0){
            setIsPatientSetNotValid(true);
            setPatientSetNotValidError("Patient Set is required");
            isValid = false;
        }
        else{
            setIsPatientSetNotValid(false);
            setPatientSetNotValidError("");
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if(makeRequestDetails.email && makeRequestDetails.email.length > 0 && emailRegex.test(makeRequestDetails.email)){
            setIsEmailNotValid(false);
            setEmailNotValidError("");
        }
        else{
            setIsEmailNotValid(true);
            setEmailNotValidError("Enter a valid email");
            isValid = false;
        }

        return isValid;
    }

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
                required
                className="inputField"
                label="Patient Set"
                variant="standard"
                fullWidth
                error={isPatientSetNotValid}
                helperText={patientSetNotValidError}
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
                className="inputField"
                label="Comments"
                variant="standard"
                fullWidth
                InputLabelProps={{ shrink: true }}
            />
            <div className={"MakeRequestSubmitMain"}>
                <Button className={"MakeRequestSubmit"} onClick={handleMakeRequest} variant="outlined">Submit</Button>
            </div>
        </Stack>
    );
}
