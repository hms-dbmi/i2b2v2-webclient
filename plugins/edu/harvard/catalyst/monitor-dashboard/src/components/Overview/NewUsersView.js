import React from "react";
import {Box, CircularProgress, MenuItem, TextField, Typography} from "@mui/material";

export const NewUsersView = ({newUsers, newUsersSinceInDays, updateNewUsersSince}) => {
    return (
        <Typography variant="body2" className={"ProjectOverviewInfoContentCentered"}>
            {newUsers.isFetching && (
                <Box
                    className={"LoadingContent"}
                >
                    <CircularProgress className={"ContentProgress"}/>
                </Box>
            )}
            <Box className={"ProjectOverviewInfoContentCount"}>
                {newUsers.userCount}
            </Box>
            <Box>
                new users in the last
            </Box>
            <Box>
                <TextField
                    select
                    value={newUsersSinceInDays}
                    onChange={(event) => updateNewUsersSince(event.target.value)}
                    variant="standard"
                >
                    <MenuItem value={"30"}>30 days</MenuItem>
                    <MenuItem value={"60"}>60 days</MenuItem>
                    <MenuItem value={"90"}>90 days</MenuItem>
                    <MenuItem value={"180"}>180 days</MenuItem>
                </TextField>
            </Box>
        </Typography>
    )
};