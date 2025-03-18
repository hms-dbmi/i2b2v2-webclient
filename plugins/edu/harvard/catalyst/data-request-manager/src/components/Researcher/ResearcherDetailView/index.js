import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import "./ResearcherDetailView.scss";
import {
    Box,
    Button,
    Card,
    CircularProgress,
    Typography
} from "@mui/material";
import {getRequestDetails} from "../../../reducers/requestDetailsSlice";
import Grid from '@mui/material/Grid2';
import {RequestStatusLogView} from "../../RequestStatusLogView";
import {RequestStatus} from "../../../models";
import {RequestDetailView} from "../../RequestDetailView";
import {DetailViewNav} from "../../DetailViewNav";
import {getRequestStatusLog} from "../../../reducers/requestStatusLogSlice";
import {RequestCommentsView} from "../../RequestCommentsView";


export const ResearcherDetailView = ({requestRow, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details } = useSelector((state) => state.requestDetails);
    const { statusLogs } = useSelector((state) => state.requestStatusLog);

    useEffect(() => {
        if(requestRow) {
            dispatch(getRequestDetails({requestRow, isManager: false}));

            const exportRequests = requestRow.requests.map(ri =>  {
                    return {
                        description: ri.description,
                        resultInstanceId: ri.resultInstanceId
                    }
                }
            );
            dispatch(getRequestStatusLog({exportRequests}));
        }
    }, [requestRow]);


    const goToViewRequestTable = () => {
        setViewRequestTable(true);
    }
    return (
        <Box className={"ResearcherDetailView"}>
            {details.isFetching &&
                <div className={"LoadingProgress"}>
                    <CircularProgress className="ProgressIcon" size="5rem"/>
                    <Typography className={"ProgressLabel"}>Loading Details...</Typography>
                </div>
            }

            {!details.isFetching && details.id && (
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
                                        <Grid size={5}>
                                            { details.status === RequestStatus.statuses.SUBMITTED && <Button variant="contained" color="error">Withdraw Request</Button>}
                                        </Grid>
                                        <Grid size={7}>
                                            <Typography className={"RequestActionItem"}> <span className={"title"}>Log:</span> </Typography>
                                            <RequestStatusLogView requestStatusLog={statusLogs}/>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </div>
                            <div className={"RequestComments"}>
                                <RequestCommentsView queryMasterId={requestRow.id} queryInstanceId={requestRow.queryInstanceId}/>
                            </div>
                        </div>
                    </div>
                )
            }
        </Box>

    )
}