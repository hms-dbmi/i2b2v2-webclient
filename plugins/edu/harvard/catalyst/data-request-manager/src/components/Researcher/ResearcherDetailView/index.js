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
import {getRequestStatusLog} from "../../../reducers/requestStatusLogSlice";


export const ResearcherDetailView = ({requestRow, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details } = useSelector((state) => state.requestDetails);

    useEffect(() => {
        if(requestRow) {
            dispatch(getRequestDetails({requestRow, isManager: false}));

            const resultInstanceIds = requestRow.requests.map(ri => ri.resultInstanceId);
            dispatch(getRequestStatusLog({resultInstanceIds}));
        }
    }, [requestRow]);


    const goToViewRequestTable = () => {
        setViewRequestTable(true);
    }
    return (
        <Box className={"ResearcherDetailView"}>
            {   details.id && (
                    <div>
                        <DetailViewNav requestId={requestRow.id} requestName={details.name} goToHome={goToViewRequestTable}/>

                        <Typography className={"ResearcherDetailViewTitle"}>
                            Request {requestRow.id}, {details.name}
                        </Typography>

                        <div className={"ResearcherDetailViewContent"}>
                            <RequestDetailView details={details} isManager={false}/>

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