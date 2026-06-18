import React from "react";
import {Box, CircularProgress, MenuItem, TextField, Typography} from "@mui/material";


export const UserLoginView = ({userLogins, loginsSinceInDays, updateLoginDaysSince}) => {

    return (
        <Typography variant="body2" className={"ProjectOverviewInfoContentCentered"}>
            {userLogins.isFetching && (
                <Box
                    className={"LoadingContent"}
                >
                    <CircularProgress className={"ContentProgress"}/>
                </Box>
            )}
            <Box className={"ProjectOverviewInfoContentCount"}>
                {userLogins.loginSuccessCount + userLogins.loginFailCount}
            </Box>
            <Box>
                login attempts in last
            </Box>
            <Box>
                <TextField
                    select
                    value={loginsSinceInDays}
                    onChange={(event) => updateLoginDaysSince(event.target.value)}
                    variant="standard"
                >
                    <MenuItem value={"1"}>1 day</MenuItem>
                    <MenuItem value={"7"}>7 days</MenuItem>
                    <MenuItem value={"30"}>30 days</MenuItem>
                    <MenuItem value={"60"}>60 days</MenuItem>
                    <MenuItem value={"90"}>90 days</MenuItem>
                </TextField>
            </Box>
            <Box className={"ProjectOverviewInfoContentCountDetail"}>
                <Box className={"ProjectOverviewInfoContentCountDetailItem"}>
                    Success: {userLogins.loginSuccessCount}
                </Box>
                <Box className={"ProjectOverviewInfoContentCountDetailItem"}>
                    Failed: {userLogins.loginFailCount}
                </Box>
            </Box>
        </Typography>
    );
};