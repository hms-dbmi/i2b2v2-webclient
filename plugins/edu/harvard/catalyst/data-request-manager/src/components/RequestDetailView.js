import React from "react";
import "./RequestDetailView.scss";
import {
    Box,
    Card,
    Link,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {useDispatch} from "react-redux";
import {reloadQuery} from "../reducers/requestDetailsSlice";

export const RequestDetailView = ({details, isManager}) => {
    const dispatch = useDispatch();

    const formatNumber = (value) => {
        let formattedValue = value.length > 0 ? parseInt(value): "";
        if(isNaN(formattedValue)){
            formattedValue = value;
        }
        return formattedValue.toLocaleString();
    };

    const handleQueryReload = (queryId) => {
        dispatch(reloadQuery({queryId}));
    }

    return (
        <Box className={"RequestDetailView"}>
            <Typography className={"RequestDetailTitle"}>
                Request Details
            </Typography>
            <Card  className={"RequestDetailContent"}>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Name:</span> {details.name} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}> Query ID:</span> <Link component="button" variant="body1" onClick={() => handleQueryReload(details.id)}> {details.id} </Link></Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Date Request Submitted:</span> {details.dateSubmitted.toLocaleDateString()} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Requested By:</span> {details.userId} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Email:</span> {details.email} </Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Count(Patient):</span> { formatNumber(details.patientCount)} </Typography>

                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Data Request Type:</span> </Typography>
                        <ol className={"RequestDetailContentItem DataRequestType"}>
                            {
                                details.requests.map((request)=> {
                                    return (<li>
                                        {request.tableId !== null && <span>{request.description} <Link component="button" variant="body1" title={"preview table definition"} size="small" onClick={() => alert("table definition id is " + request.tableId)}>view</Link></span>}
                                        {request.tableId === null && request.description}
                                    </li>)
                                })
                            }
                        </ol>
                    </Grid>
                </Grid>
            </Card>
        </Box>
    )
}