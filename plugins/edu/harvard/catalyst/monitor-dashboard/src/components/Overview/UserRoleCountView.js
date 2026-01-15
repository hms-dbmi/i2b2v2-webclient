import React from "react";
import {Box, CircularProgress, Typography} from "@mui/material";


export const UserRoleCountView = ({users, userRoleCounts, projectId}) => {

    const getAdminOrManagerCountText = () => {
        let text = "";
        if(projectId){
            text = userRoleCounts.managerUserCount + " Manager";
            if(userRoleCounts.managerUserCount > 1){
                text += "s";
            }
        }else{
            text = userRoleCounts.adminUserCount + " Admin";
            if(userRoleCounts.adminUserCount > 1){
                text += "s";
            }
        }

        return text;
    }
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
                    {users.userList.length > 1 ? users.userList.length + " Users" : users.userList.length + " User"}
                     { " including " + getAdminOrManagerCountText()}
                </Box>
            </Box>
        </Typography>
    );
};