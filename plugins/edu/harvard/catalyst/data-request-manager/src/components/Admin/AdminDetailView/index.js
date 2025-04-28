import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Box,
    Button,
    Card, CircularProgress,
    FormControl,
    FormControlLabel, FormHelperText,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {getRequestDetails, updateRequestStatus} from "../../../reducers/requestDetailsSlice";
import {RequestStatusLogView} from "../../RequestStatusLogView";
import {RequestStatus} from "../../../models";
import {RequestDetailView} from "../../RequestDetailView";
import {DetailViewNav} from "../../DetailViewNav";
import {getRequestStatusLog} from "../../../reducers/requestStatusLogSlice";
import {RequestCommentsView} from "../../RequestCommentsView";
import "./AdminDetailView.scss";

export const AdminDetailView = ({requestRow, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details } = useSelector((state) => state.requestDetails);
    const { statusLogs } = useSelector((state) => state.requestStatusLog);
    const { username } = useSelector((state) => state.userInfo);
    const [requestStatus, setRequestStatus] = React.useState("default");
    const {isObfuscated, isAdmin, isManager } = useSelector((state) => state.userInfo);

    useEffect(() => {
        if(requestRow) {
            dispatch(getRequestDetails({requestRow, isManager, isAdmin }));

            const exportRequests = requestRow.requests.map(ri =>  {
                    return {
                        description: ri.description,
                        resultInstanceId: ri.resultInstanceId
                    }
                }
            );
            dispatch(getRequestStatusLog({exportRequests}));
        }
    }, [requestRow, isManager, isAdmin]);


    const goToViewRequestTable = () => {
        setViewRequestTable(true);
    }

    const onChangeStatusEvent = (event) => {
        setRequestStatus(event.target.value);
    }

    const handleUpdateStatus = () => {
        dispatch(updateRequestStatus({queryInstanceId: requestRow.queryInstanceId, status: requestStatus, username, requests: requestRow.requests}));
    }

    const canSelectRequestStatus = (rStatus) => {
        let canSelect = false;
        if(rStatus === RequestStatus.statuses.CANCELLED
            || rStatus === RequestStatus.statuses.SUBMITTED
            || rStatus === RequestStatus.statuses.INCOMPLETE
        ){
            canSelect = true;
        }

        return canSelect;
    }

    const editStatusOptions = () => {
        const allStatuses = RequestStatus._getStatusKeysAsList().map((status) =>{
            return {
                key: status,
                name: RequestStatus.statuses[status].name,
                isSelectable: canSelectRequestStatus(RequestStatus.statuses[status])
            }
        });
        const availableStatuses = allStatuses.filter(s => s.isSelectable);

        return (
            <div>
                <FormControl className={"StatusControl"} variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <FormControlLabel
                        className={"StatusLabel"}
                        labelPlacement="start"
                        control={
                            <Select
                                value={requestStatus}
                                label="Status"
                                disabled={details.isUpdatingStatus || details.status === RequestStatus.statuses.PROCESSING || details.status === RequestStatus.statuses.QUEUED}
                                onChange={onChangeStatusEvent}
                            >
                                <MenuItem disabled value={"default"}>
                                    <em>Change Status</em>
                                </MenuItem>
                                {
                                    availableStatuses.map(status => {
                                        return (<MenuItem value={RequestStatus.statuses[status.key]}> {status.name}</MenuItem>);
                                    })
                                }
                            </Select>
                        }
                        label="Status:"
                    />
                </FormControl>
                <Button variant="contained" className={"StatusControlBtn"}
                        onClick={handleUpdateStatus} size={"small"} disabled={details.isUpdatingStatus || requestStatus ==="default"
                    || details.status === RequestStatus.statuses.PROCESSING || details.status === RequestStatus.statuses.QUEUED}>Save</Button>
                { details.isUpdatingStatus && <CircularProgress size="1.3em" />}
                <FormHelperText className={"StatusControlHelpText"}>Current Status: {details.status.name}</FormHelperText>
            </div>
    )
    }
    return (
        <Box className={"AdminDetailView"}>
            {details.isFetching &&
                <div className={"LoadingProgress"}>
                    <CircularProgress className="ProgressIcon" size="5rem"/>
                    <Typography className={"ProgressLabel"}>Loading Details...</Typography>
                </div>
            }

            { !details.isFetching && !statusLogs.isFetching && details.id && (
                <div>
                    <DetailViewNav requestId={requestRow.id} requestName={details.name} goToHome={goToViewRequestTable}/>

                    <Typography className={"AdminDetailViewTitle"}>
                        Request {requestRow.id}, {details.name}
                    </Typography>

                    <div className={"AdminDetailViewContent"}>
                        <RequestDetailView details={details} isObfuscated={isObfuscated}/>

                        <div className={"RequestAction"}>
                            <Typography className={"RequestActionTitle"}>
                                Actions
                            </Typography>
                            <Card className={"RequestDetailActionContent"}>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <Grid container spacing={1}>
                                            <Grid size={12} >
                                                <Typography className={"RequestActionItem"}>
                                                    {editStatusOptions()}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid size={6}>
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