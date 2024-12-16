import React from "react";
import "./RequestDetailView.scss";
import {
    Box,
    Card,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';


export const RequestDetailView = ({details}) => {
    return (
        <Box className={"RequestDetailView"}>
            <Typography className={"RequestDetailTitle"}>
                Request Details
            </Typography>
            <Card  className={"RequestDetailContent"}>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Name:</span> {details.name} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Query ID:</span> {details.id} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Date Request Submitted:</span> {details.dateSubmitted.toLocaleDateString()} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Requested By:</span> {details.userId} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Email:</span> {details.email} </Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Data Request Type:</span> </Typography>
                        <ol className={"RequestDetailContentItem DataRequestType"}>
                            {
                                details.requests.map((request)=> {
                                    return (<li> {request} </li>)
                                })
                            }
                        </ol>
                    </Grid>
                </Grid>
            </Card>
        </Box>
    )
}