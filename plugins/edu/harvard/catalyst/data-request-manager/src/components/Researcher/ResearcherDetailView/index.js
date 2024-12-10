import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import "./ResearcherDetailView.scss";
import {
    Box,
    Breadcrumbs, Button,
    Card,
    Link,
    Paper,
    Table,
    TableBody,
    TableCell, TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {getRequestDetails} from "../../../reducers/getRequestDetailsSlice";
import Grid from '@mui/material/Grid2';


export const ResearcherDetailView = ({requestId, setViewRequestTable}) => {
    const dispatch = useDispatch();
    const { details, isFetching } = useSelector((state) => state.researcherRequest);

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
                            <div className={"RequestDetail"}>
                                <Typography className={"RequestDetailTitle"}>
                                    Request Details
                                </Typography>
                                <Card  className={"RequestDetailContent"}>
                                    <Grid container spacing={2}>
                                        <Grid size={6}>
                                            <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Name:</span> {details.name} </Typography>
                                            <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Query ID:</span> {details.id} </Typography>
                                            <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Date Request Submitted:</span> {details.dateSubmitted.toLocaleDateString()} </Typography>
                                            <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Requested By:</span> {details.userId} </Typography>
                                            <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Email:</span> {details.email} </Typography>
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography className={"RequestDetailContentItem"}> <span className={"title"}>IRB #:</span> {details.irbNumber} </Typography>
                                            <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Data Request Type:</span> </Typography>
                                            <ol className={"RequestDetailContentItem DataRequestType"}>
                                                {
                                                    details.requests.map((request)=> {
                                                        return (<li> {request} </li>)
                                                    })
                                                }
                                            </ol>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </div>

                            <div className={"RequestAction"}>
                                <Typography className={"RequestActionTitle"}>
                                    Actions
                                </Typography>
                                <Card className={"RequestDetailActionContent"}>
                                    <Grid container spacing={2}>
                                        <Grid size={6}>
                                            <Button variant="contained">Cancel</Button>
                                        </Grid>
                                        <Grid size={6}>
                                            <Typography className={"RequestActionItem"}> <span className={"title"}>Log:</span> </Typography>
                                            <TableContainer component={Paper}>
                                                <Table sx={{ minWidth: 50 }} size="small" aria-label="simple table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Date</TableCell>
                                                            <TableCell align="left">Status</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {details.statusLogs.map((row) => (
                                                            <TableRow
                                                                key={row.status}
                                                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                            >
                                                                <TableCell component="th" scope="row">
                                                                    {row.date.toLocaleDateString()}
                                                                </TableCell>
                                                                <TableCell align="left">{row.status}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
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