import React, { useState, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";

import "../../css/modals.scss";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Card, TextField} from "@mui/material";
import "./MakeRequest.scss";
import {makeRequest} from "../../reducers/makeRequestSlice";

export const MakeRequest = ({}) =>
{
    const dispatch = useDispatch();
    const [email, setEmail] = React.useState("");
    const makeRequestDetails = useSelector((state) => state.makeRequestDetails);

    const handleUpdate = (field, value) => {

        setEmail(value);
    }

    const handleMakeRequest = () => {
        dispatch(makeRequest());
    }

    useEffect(() => {

    }, []);

    return (
        <Card className={"MakeRequest"} variant="outlined">
            <Stack
                className={"mainStack"}
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
                    value={email}
                    onChange={(event) => handleUpdate("email", event.target.value)}
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
        </Card>

    );
}
