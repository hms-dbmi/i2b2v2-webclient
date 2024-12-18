import React from "react";
import {
    Box,
    Breadcrumbs,
    Link,
    Typography
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export const DetailViewNav = ({requestId, requestName, goToHome}) => {

    return (
        <Box className={"DetailViewNav"}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="export requests">
                <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={goToHome}
                >
                    List of Export Data Requests
                </Link>
                <Typography key="3" sx={{ color: 'text.primary' }}>
                    Request {requestId}, {requestName}
                </Typography>
            </Breadcrumbs>
        </Box>
    )
}