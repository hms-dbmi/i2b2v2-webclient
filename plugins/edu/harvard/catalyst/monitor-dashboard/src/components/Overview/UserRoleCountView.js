import React from "react";
import {Box, CircularProgress, Typography} from "@mui/material";
import {USER_DATA_ROLES} from "../../models";
import "./UserRoleCountView.scss";

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
    const getRoleBreakDowns = () => {
        const obfUsers = userRoleCounts.userRoleCountsList.filter(userRole => userRole.role === USER_DATA_ROLES.DATA_OBFSC);
        const aggUsers = userRoleCounts.userRoleCountsList.filter(userRole => userRole.role === USER_DATA_ROLES.DATA_AGG);
        const ldsUsers = userRoleCounts.userRoleCountsList.filter(userRole => userRole.role === USER_DATA_ROLES.DATA_LDS);
        const deidUsers = userRoleCounts.userRoleCountsList.filter(userRole => userRole.role === USER_DATA_ROLES.DATA_DEID);
        const protUsers = userRoleCounts.userRoleCountsList.filter(userRole => userRole.role === USER_DATA_ROLES.DATA_PROT);

        return (
            <div className={"UserRoleCountBreakdown"}>
                <Box>Obfuscated: {obfUsers.length}</Box>
                <Box>Aggregated: {aggUsers.length}</Box>
                <Box>Limited Data Set: {ldsUsers.length}</Box>
                <Box>De-identified: {deidUsers.length}</Box>
                <Box>Protected: {protUsers.length}</Box>
            </div>
        )
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
                    <Box>including</Box>
                    { getAdminOrManagerCountText()}
                </Box>
                {getRoleBreakDowns()}
            </Box>
        </Typography>
    );
};