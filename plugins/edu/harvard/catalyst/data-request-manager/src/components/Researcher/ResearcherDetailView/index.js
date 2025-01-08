import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import "./ResearcherDetailView.scss";
import {
    Box,
    Button,
    Card,
    Typography
} from "@mui/material";
import {getRequestDetails} from "../../../reducers/requestDetailsSlice";
import Grid from '@mui/material/Grid2';
import {RequestStatusLogView} from "../../RequestStatusLogView";
import {RequestStatus} from "../../../models";
import {RequestDetailView} from "../../RequestDetailView";
import {DetailViewNav} from "../../DetailViewNav";


export const ResearcherDetailView = ({requestId, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details } = useSelector((state) => state.requestDetails);

    useEffect(() => {
        if(requestId) {
            dispatch(getRequestDetails({id: requestId}));
        }
    }, [requestId]);


    const goToViewRequestTable = () => {
        setViewRequestTable(true);
    }
    return (
        <Box className={"ResearcherDetailView"}>
            {   details.id && (
                    <div>
                        <DetailViewNav requestId={requestId} requestName={details.name} goToHome={goToViewRequestTable}/>

                        <Typography className={"ResearcherDetailViewTitle"}>
                            Request {requestId}, {details.name}
                        </Typography>

                        <div className={"ResearcherDetailViewContent"}>
                            <RequestDetailView details={details} isAdmin={false}/>

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