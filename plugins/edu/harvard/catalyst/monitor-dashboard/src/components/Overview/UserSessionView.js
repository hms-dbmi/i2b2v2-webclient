import React from "react";
import {Box, CircularProgress, Typography} from "@mui/material";


export const UserSessionView = ({userSessions}) => {

    return (
        <Typography variant="body2" className={"ProjectOverviewInfoContentCentered"}>
            {userSessions.isFetching && (
                <Box className={"LoadingContent"}>
                    <CircularProgress className={"ContentProgress"}/>
                </Box>
            )}
            <Box className={"ProjectOverviewInfoContentCount"}>
                {userSessions.sessionCount}
            </Box>
            <Box>
                Current active sessions
            </Box>
        </Typography>
    );
};