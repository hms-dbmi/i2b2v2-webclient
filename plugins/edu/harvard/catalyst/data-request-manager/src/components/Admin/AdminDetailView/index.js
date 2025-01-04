import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Box,
    Button,
    Card,
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
import {AdminNotesView} from "./AdminNotesView";
import {DetailViewNav} from "../../DetailViewNav";
import CreateIcon from '@mui/icons-material/Create';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import "./AdminDetailView.scss";

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
    const handleGenerateFile = () =>{
        dispatch(generateDataFile({requestId}));
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
                                                            return (<MenuItem value={RequestStatus.statuses[status]}> {RequestStatus.statuses[status]}</MenuItem>);
                                                        })
                                                    }
                                                </Select>
                                            }
                                            label="Status:"
                                        />
                                        </FormControl>
                                        <div className={"RequestXmlMain"}>
                                            <Button href="#"  variant="outlined" endIcon={<OpenInNewIcon />}>
                                                View Request XML
                                            </Button>
                                        </div>
                                    </Grid>
                                    <Grid size={6}>
                                        <div>
                                            <Button className={"generateFileBtn"} variant="contained" size="small"
                                                    startIcon={<CreateIcon />}  onClick={handleGenerateFile}>Generate Data File(s)
                                            </Button>
                                        </div>
                                        <Typography className={"RequestActionItem"}> <span className={"title"}>Log:</span> </Typography>
                                        <RequestStatusLogView statusLogs={details.statusLogs}/>
                                    </Grid>
                                </Grid>
                            </Card>
                        </div>
                        <div className={"RequestNotes"}>
                            <AdminNotesView requestId={requestId}/>
                        </div>
                    </div>
                </div>
            )
            }
        </Box>

    )
}