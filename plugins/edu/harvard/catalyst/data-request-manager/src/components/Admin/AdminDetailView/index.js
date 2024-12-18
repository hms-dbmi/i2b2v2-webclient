import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import "./AdminDetailView.scss";
import {
    Box,
    Button,
    Card, FormControl, MenuItem, Select,
    Typography
} from "@mui/material";
import {getRequestDetails} from "../../../reducers/getRequestDetailsSlice";
import Grid from '@mui/material/Grid2';
import {RequestStatusLogView} from "../../RequestStatusLogView";
import {RequestStatus} from "../../../models";
import {RequestDetailView} from "../../RequestDetailView";
import {DetailViewNav} from "../../DetailViewNav";


export const AdminDetailView = ({requestId, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details, isFetching } = useSelector((state) => state.requestDetails);
    const [requestStatus, setRequestStatus] = React.useState(null);

    useEffect(() => {
        if(requestId) {
            dispatch(getRequestDetails({id: requestId, isAdmin: true}));
        }
    }, [requestId]);

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
    return (
        <Box className={"AdminDetailView"}>
            {   details.id && (
                <div>
                    <DetailViewNav requestId={requestId} requestName={details.name} goToHome={goToViewRequestTable}/>

                    <Typography className={"AdminDetailViewTitle"}>
                        Request {requestId}, {details.name}
                    </Typography>

                    <div className={"AdminDetailViewContent"}>
                        <RequestDetailView details={details} isAdmin={true}/>

                        <div className={"RequestAction"}>
                            <Typography className={"RequestActionTitle"}>
                                Actions
                            </Typography>
                            <Card className={"RequestDetailActionContent"}>
                                <Grid container spacing={2}>
                                    <Grid size={6}>
                                        <Typography className={"RequestActionItem"}> <span className={"title"}>Status:</span> </Typography>
                                        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                                            <Select
                                                value={requestStatus}
                                                label="Status"
                                                onChange={onChangeStatusEvent}
                                            >
                                                {
                                                    RequestStatus._getStatusesAsList().filter(s => s !== RequestStatus.statuses.UNKNOWN).map((status) => {
                                                      return (<MenuItem value={RequestStatus.statuses[status]}> {RequestStatus.statuses[status]}</MenuItem>);
                                                    })
                                                }
                                        </Select>
                                        </FormControl>
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