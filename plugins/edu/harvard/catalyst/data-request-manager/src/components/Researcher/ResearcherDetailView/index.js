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
import {getRequestDetails, updateRequestStatus} from "../../../reducers/requestDetailsSlice";
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
    const { username } = useSelector((state) => state.userInfo);

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

    const handleCancelRequest = () => {
        dispatch(updateRequestStatus({queryInstanceId: requestRow.queryInstanceId, status: RequestStatus.statuses.CANCELLED, username}));
    }

    return (
        <Box className={"ResearcherDetailView"}>
            {details.isFetching &&
                <div className={"LoadingProgress"}>
Fix                    <CircularProgress className="LoadingProgressIcon" size="5rem"/>
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
                                            <div>Status: {details.status.name}</div>
                                            <div className={"CancelRequest"}>
                                                { details.status === RequestStatus.statuses.SUBMITTED
                                                    && <Button variant="contained" className={"CancelRequestBtn"} color="error" onClick={handleCancelRequest}>Withdraw Request</Button>
                                                }
                                                { details.isUpdatingStatus && <div className={"CancelRequestProgress"}><CircularProgress  size="1.6em" /></div>}
                                            </div>
                                        </Grid>
                                        <Grid size={7}>
                                            <Typography className={"RequestActionItem"}> <span className={"title"}>Log:</span> </Typography>
                                            <RequestStatusLogView requestStatusLog={statusLogs}/>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </div>
                            <div className={"RequestComments"}>
                                <RequestCommentsView queryMasterId={requestRow.id} queryInstanceId={requestRow.queryInstanceId} username={username}/>
                            </div>
                        </div>
                    </div>
                )
            }
        </Box>

    )
}