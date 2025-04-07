import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Box,
    Button,
    Card, CircularProgress,
    FormControl,
    FormControlLabel,
    MenuItem,
    Select,
    Typography
} from "@mui/material";
import {generateDataFile, getRequestDetails} from "../../../reducers/requestDetailsSlice";
import Grid from '@mui/material/Grid2';
import {RequestStatusLogView} from "../../RequestStatusLogView";
import {RequestStatus} from "../../../models";
import {RequestDetailView} from "../../RequestDetailView";
import {DetailViewNav} from "../../DetailViewNav";
import CreateIcon from '@mui/icons-material/Create';
import "./AdminDetailView.scss";
import {ConfirmDialog} from "../../ConfirmDialog";
import {getRequestStatusLog} from "../../../reducers/requestStatusLogSlice";
import {RequestCommentsView} from "../../RequestCommentsView";

export const AdminDetailView = ({requestRow, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details } = useSelector((state) => state.requestDetails);
    const { statusLogs } = useSelector((state) => state.requestStatusLog);
    const { username } = useSelector((state) => state.userInfo);
    const [requestStatus, setRequestStatus] = React.useState(null);
    const [confirmFileGen, setConfirmFileGen] = React.useState(false);
    const {isObfuscated } = useSelector((state) => state.userInfo);

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
    }, [details]);


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
                                        <FormControl className={"statusControl"} variant="standard" sx={{ m: 1, minWidth: 120 }}>
                                        <FormControlLabel
                                            className={"statusLabel"}
                                            labelPlacement="start"
                                            control={
                                                <Select
                                                    value={requestStatus}
                                                    label="Status"
                                                    onChange={onChangeStatusEvent}
                                                >
                                                    {
                                                        RequestStatus._getStatusesAsList().filter(s => RequestStatus.statuses[s] !== RequestStatus.statuses.UNKNOWN).map((status) => {
                                                            return (<MenuItem value={RequestStatus.statuses[status]}> {RequestStatus.statuses[status].name}</MenuItem>);
                                                        })
                                                    }
                                                </Select>
                                            }
                                            label="Status:"
                                        />
                                        </FormControl>
                                        <div>
                                            <Button className={"generateFileBtn"} variant="contained" size="small"
                                                    startIcon={<CreateIcon />}  onClick={() => setConfirmFileGen(true)}>Generate Data File(s)
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