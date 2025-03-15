import React, {useEffect} from "react";
import {
    Box,
    Card,
    Link,
    Typography
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {useDispatch, useSelector} from "react-redux";
import {reloadQuery} from "../reducers/requestDetailsSlice";
import {getTableDefinition, getTableDefinitionStatusConfirmed} from "../reducers/tableDefSlice";
import {TableDefinitionPreview} from "./TableDefinitionPreview";
import "./RequestDetailView.scss";
import {AlertDialog} from "./AlertDialog";

export const RequestDetailView = ({details}) => {
    const tableDef  = useSelector((state) => state.tableDef);
    const [showTableDefPreview, setShowTableDefPreview] = React.useState(false);
    const [showAlert, setShowAlert] = React.useState(false);
    const [alertMsg, setAlertMsg] = React.useState("");

    const dispatch = useDispatch();

    const formatNumber = (value) => {
        let formattedValue = value.length > 0 ? parseInt(value): "";
        if(isNaN(formattedValue)){
            formattedValue = value;
        }
        return formattedValue.toLocaleString();
    };

    const handleQueryReload = (queryId) => {
        dispatch(reloadQuery({queryId}));
    }

    const handlePreviewTableDef = (tableId) => {
        dispatch(getTableDefinition({tableId}));
    }

    const handleClosePreviewTableDef = () => {
        setShowTableDefPreview(false);
    }

    useEffect(() => {
        if (tableDef.statusInfo.status === "SUCCESS") {
            setShowTableDefPreview(true);
            dispatch(getTableDefinitionStatusConfirmed());
        }
        if (tableDef.statusInfo.status === "FAIL") {
            setShowAlert(true);
            setAlertMsg("Error displaying table definition. Error: " + tableDef.statusInfo.errorMessage);
        }
    }, [tableDef.statusInfo]);

    const truncateDescriptionName = (name) => {
        let truncatedName = name;
        const maxLength = 40;
        if(truncatedName.length > maxLength){
            truncatedName = truncatedName.slice(0, maxLength) + "...";
        }
        return truncatedName;
    }

    return (
        <Box className={"RequestDetailView"}>
            <Typography className={"RequestDetailTitle"}>
                Request Details
            </Typography>
            <Card  className={"RequestDetailContent"}>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Name:</span> {details.name} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}> Query ID:</span> <Link component="button" variant="body1" onClick={() => handleQueryReload(details.id)}> {details.id} </Link></Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Date Request Submitted:</span> {details.dateSubmitted.toLocaleDateString()} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Requested By:</span> {details.userId} </Typography>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Email:</span> {details.email} </Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Count(Patient):</span> { formatNumber(details.patientCount)} </Typography>

                        <Typography className={"RequestDetailContentItem"}> <span className={"title"}>Data Request Type:</span> </Typography>
                        <ol className={"RequestDetailContentItem DataRequestType"}>
                            {
                                details.requests.map((request)=> {
                                    return (<li>
                                        {request.tableId !== null && <span title={request.description}>{truncateDescriptionName(request.description)} <Link component="button" variant="body1" title={"preview table definition"} size="small" onClick={() => handlePreviewTableDef(request.tableId)}>view</Link></span>}
                                        {request.tableId === null && request.description}
                                    </li>)
                                })
                            }
                        </ol>
                    </Grid>
                </Grid>
            </Card>
            <TableDefinitionPreview tableDefinition={tableDef} open={showTableDefPreview} onClose={handleClosePreviewTableDef}/>
            {showAlert && <AlertDialog msg={alertMsg}/> }
        </Box>
    )
}