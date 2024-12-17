import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import "./ResearcherDetailView.scss";
import {
    Box,
    Breadcrumbs, Button,
    Card,
    Link,
    Typography
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {getRequestDetails} from "../../../reducers/getRequestDetailsSlice";
import Grid from '@mui/material/Grid2';
import {RequestStatusLogView} from "./RequestStatusLogView";
import {RequestStatus} from "../../../models";
import {RequestDetailView} from "../../RequestDetailView";


export const ResearcherDetailView = ({requestId, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details } = useSelector((state) => state.researcherRequest);

    useEffect(() => {
        if(requestId) {
            dispatch(getRequestDetails({id: requestId}));
        }
    }, [requestId]);


    return (
        <Box className={"ResearcherDetailView"}>
            {   details.id && (
                    <div>
                        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="export requests">
                            <Link
                                underline="hover"
                                color="inherit"
                                href="#"
                                onClick={() => setViewRequestTable(true)}
                            >
                                List of Export Data Requests
                            </Link>
                            <Typography key="3" sx={{ color: 'text.primary' }}>
                                Request {requestId}, {details.name}
                            </Typography>
                        </Breadcrumbs>

                        <Typography className={"ResearcherDetailViewTitle"}>
                            Request {requestId}, {details.name}
                        </Typography>

                        <div className={"ResearcherDetailViewContent"}>
                            <RequestDetailView details={details}/>

                            <div className={"RequestAction"}>
                                <Typography className={"RequestActionTitle"}>
                                    Actions
                                </Typography>
                                <Card className={"RequestDetailActionContent"}>
                                    <Grid container spacing={2}>
                                        <Grid size={6}>
                                            { details.status === RequestStatus.statuses.SUBMITTED && <Button variant="contained" color="error">Withdraw Request</Button>}
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography className={"RequestActionItem"}> <span className={"title"}>Log:</span> </Typography>
                                            <RequestStatusLogView statusLogs={details.statusLogs}/>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </div>
                        </div>
                    </div>
                )
            }
        </Box>

    )
}