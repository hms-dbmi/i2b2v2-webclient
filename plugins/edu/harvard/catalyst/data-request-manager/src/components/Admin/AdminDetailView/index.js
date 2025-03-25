import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Box,
    Button,
    Card, CircularProgress,
    FormControl,
    FormControlLabel, FormHelperText,
    ListSubheader,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import {generateDataFile, getRequestDetails, updateRequestStatus} from "../../../reducers/requestDetailsSlice";
import {RequestStatusLogView} from "../../RequestStatusLogView";
import {RequestStatus} from "../../../models";
import {RequestDetailView} from "../../RequestDetailView";
import {DetailViewNav} from "../../DetailViewNav";
import {ConfirmDialog} from "../../ConfirmDialog";
import {getRequestStatusLog} from "../../../reducers/requestStatusLogSlice";
import {RequestCommentsView} from "../../RequestCommentsView";
import "./AdminDetailView.scss";

export const AdminDetailView = ({requestRow, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details } = useSelector((state) => state.requestDetails);
    const { statusLogs } = useSelector((state) => state.requestStatusLog);
    const { username } = useSelector((state) => state.userInfo);
    const [requestStatus, setRequestStatus] = React.useState(null);
    const [confirmFileGen, setConfirmFileGen] = React.useState(false);

    useEffect(() => {
        if(requestRow) {
            dispatch(getRequestDetails({requestRow, isManager: true}));

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

    useEffect(() => {
        if(details) {
            setRequestStatus(details.status);
        }
    }, [details.status]);


    const goToViewRequestTable = () => {
        setViewRequestTable(true);
    }

    const onChangeStatusEvent = (event) => {
        setRequestStatus(event.target.value);
    }

    const handleGenerateFile = () =>{
        setConfirmFileGen(false);
        dispatch(generateDataFile({requestId: requestRow.id}));
    }

    const handleUpdateStatus = () => {
        dispatch(updateRequestStatus({queryInstanceId: requestRow.queryInstanceId, status: requestStatus, username}));
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
        const groupedStatuses = RequestStatus._getStatusKeysAsList().map((status) =>{
            return {
                key: status,
                name: RequestStatus.statuses[status].name,
                isSelectable: canSelectRequestStatus(RequestStatus.statuses[status])
            }
        });
        const availableStatuses = groupedStatuses.filter(s => s.isSelectable);
        const unAvailableStatuses = groupedStatuses.filter(s => !s.isSelectable);

        return (
            <>
            <FormControl className={"statusControl"} variant="standard" sx={{ m: 1, minWidth: 120 }}>
                <FormControlLabel
                    className={"statusLabel"}
                    labelPlacement="start"
                    control={
                        <Select
                            value={requestStatus}
                            label="Status"
                            disabled={details.isUpdatingStatus}
                            onChange={onChangeStatusEvent}
                        >
                            <ListSubheader className={"statusListSubHeader"}>Available Statuses</ListSubheader>
                            {
                                availableStatuses.map(status => {
                                    return (<MenuItem value={RequestStatus.statuses[status.key]}> {status.name}</MenuItem>);
                                })
                            }
                            <ListSubheader className={"statusListSubHeader"}>Unavailable Statuses</ListSubheader>
                            {
                                unAvailableStatuses.map(status => {
                                    return (<MenuItem value={RequestStatus.statuses[status.key]} disabled={true}> {status.name}</MenuItem>);
                                })
                            }
                        </Select>
                    }
                    label="Status:"
                />
                <FormHelperText>Current Status: {details.status.name}</FormHelperText>
            </FormControl>
            <Button variant="outlined" className={"statusControlBtn"} onClick={handleUpdateStatus} size={"small"} disabled={details.isUpdatingStatus}>Submit</Button>
            { details.isUpdatingStatus && <CircularProgress size="1.3em" />}
        </>
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
                        <RequestDetailView details={details} isManager={true}/>

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
                                        <div>
                                            <Button className={"generateFileBtn"} variant="contained" size="small"
                                                    startIcon={<CreateNewFolderIcon />}  onClick={() => setConfirmFileGen(true)}>Generate Data File(s)
                                            </Button>
                                        </div>
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
                        {confirmFileGen && <ConfirmDialog
                            msg={'Are you sure you want to generate data file(s)?'}
                            title="Generate Data File(s)"
                            onOk = {handleGenerateFile}
                            onCancel = {() => setConfirmFileGen(false)}
                            />
                        }
                    </div>
                </div>
            )
            }
        </Box>

    )
}