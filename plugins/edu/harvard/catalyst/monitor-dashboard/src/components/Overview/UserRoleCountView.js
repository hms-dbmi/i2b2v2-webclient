import React from "react";
import {Box, CircularProgress, Typography} from "@mui/material";


export const UserRoleCountView = ({users, userRoleCounts, projectId}) => {

    return (
        <Typography variant="body2" className={"UserRoleCountView ProjectOverviewInfoContentCentered"}>
            {userRoleCounts.isFetching && (
                <Box className={"LoadingContent"}>
                    <CircularProgress className={"ContentProgress"}/>
                </Box>
            )}
            <Box>
                Total Number of Users
                <Box className={"ProjectOverviewInfoContentCount UserRoleCount"}>
                    {users.userList.length} Users
                    including  {(projectId && ? userRoleCounts.managerUserCount + " Managers" : userRoleCounts.adminUserCount + " Admins" }
                </Box>
            </Box>
        </Typography>
    );
};