import React, { useState, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";

import "../../css/modals.scss";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Card, TextField} from "@mui/material";
import "./MakeRequest.scss";

//import {makeRequest} from "../../reducers/makeRequestSlice";

export const MakeRequest = ({open, handleClose}) =>
{
    const dispatch = useDispatch();
    //const { sharedRows, userRows } = useSelector((state) => state.tableListing);

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
                    defaultValue={"Table specifications on Define Table tab"}
                    variant="standard"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    className="inputField"
                    label="Email"
                    variant="standard"
                    fullWidth
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
                    <Button className={"MakeRequestSubmit"} variant="outlined">Submit</Button>
                </div>
            </Stack>
        </Card>

    );
}
