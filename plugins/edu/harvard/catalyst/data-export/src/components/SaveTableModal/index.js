import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';
import "../../css/modals.scss";
import { TableListing } from "../TableListing";
import { listTables } from "../../reducers/listTablesSlice";
import { TabPanel } from "../TabPanel";
import {saveStatusConfirmed, saveTable} from "../../reducers/saveTableSlice";
import {Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";



export const SaveTableModal = ({open, handleClose}) => {
    const [selectedTableDef, setSelectedTableDef] = React.useState({});
    const { userRows } = useSelector((state) => state.tableListing);
    const saveTableInfo = useSelector((state) => state.saveTable);
    const tableDefRows = useSelector((state) => state.tableDef.rows);
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [enteredTitle, setEnteredTitle] = React.useState("My-Table-Definition");
    const [showOverwrite, setShowOverwrite] = React.useState(false);
    const [isNameInvalid, setIsNameInvalid] = React.useState(false);

    const dispatch = useDispatch();

    const addtlProps = (index)  =>{
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    const onRowSelect = (row) => {
        setSelectedTableDef({id: row.id, title: row.title});
        setSelectedRows(row.id);
        setEnteredTitle(row.title);
    }

    const selectIfNameExists = (title) =>{
        const matchedRows = userRows.filter(srow => srow.title?.toUpperCase() === title.toUpperCase());

        setSelectedRows(matchedRows.map(srow => srow.id));
        setEnteredTitle(title);

        if(matchedRows.length >0) {
            setSelectedTableDef({title: matchedRows[0].title, id: matchedRows[0].id});
        }else{
            setSelectedTableDef({title: title});
        }
    }

    const onNameChange = (e) => {
        const title = e.target.value;

        selectIfNameExists(title);

        if(title?.length > 0) {
            setIsNameInvalid(false);
        }else{
            setIsNameInvalid(true);
        }
    }

    const onSave = (selectedRows) =>{
        if (selectedRows.length === 0) {
            doSave();
        } else {
            setShowOverwrite(true);
        }
    }

    const doSave = () =>{
        dispatch(saveTable({
            tableId: selectedTableDef.id,
            tableTitle: selectedTableDef.title,
            tableDefRows: tableDefRows
        }))
        setShowOverwrite(false);
        handleClose();
    }

    const handleConfirmStatus = () => {
        dispatch(saveStatusConfirmed());
    };

    const displaySaveStatusMsg = (statusMsg, isError) => {
       return ( <Dialog
            open={true}
            onClose={handleConfirmStatus}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {"Data Request"}
            </DialogTitle>
            <DialogContent dividers>
                <DialogContentText id="alert-dialog-description">
                    <Alert severity={isError ?"error": "success"}>
                        {statusMsg}
                    </Alert>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" autoFocus onClick={handleConfirmStatus}>
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
       )
    }

    useEffect(() => {
        if (open) {
            dispatch(listTables());
        }
    }, [open]);

    useEffect(() => {
            selectIfNameExists(enteredTitle);
    }, [selectedTableDef]);
    return (
    <div>
        <Dialog
            className={"ModalDialog"}
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            fullWidth={true}
            maxWidth={'xl'}
        >
            <DialogTitle id="modal-title" variant="h6" component="h2">
                Save Table Definition
            </DialogTitle>
            <DialogContent className={"ModalDialogContent"}>
                <DialogContentText className={"ModalDialogContentText"}>
                    <Typography id="modal-description">
                        Enter a table definition name to save as or select from the list to overwrite.
                    </Typography>
                </DialogContentText>
                <Box
                    className = {"modalDefListBox"}
                    sx={{ flexGrow: 1, display: 'flex', boxShadow: 2 }}
                >
                    <Tabs
                        orientation="vertical"
                        value={1}
                        aria-label="Table Definition Folders"
                        sx={{ borderRight: 1, borderColor: 'divider'}}
                    >
                        <Tab label="Shared Tables" {...addtlProps(0)} sx={{textDecoration:"line-through"}}/>
                        <Tab label="My Tables" {...addtlProps(1)} />
                    </Tabs>
                    <TabPanel
                        value={1}
                        index={0}
                        className={'modalTabPanel'}
                    >
                    </TabPanel>
                    <TabPanel
                        value={1}
                        index={1}
                        className={'modalTabPanel'}
                        height={260}
                    >
                        <TableListing
                            id={"saveModalDefTableLocal"}
                            rows={userRows}
                            canRename={false}
                            onSelect={onRowSelect}
                            selectionModel={selectedRows}
                        />
                    </TabPanel>
                </Box>
            </DialogContent>
            <DialogActions  className={"ModalDialogActions"}>
                <TextField
                    required
                    size='small'
                    id="TableDefName"
                    label="Save Table Definition As"
                    value={enteredTitle}
                    onChange={onNameChange}
                    error={isNameInvalid}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ maxLength: 255 }}
                    sx={{float: "left", width:"60%", position:"absolute", left:32}}
                />
                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={()=>onSave(selectedRows)} disabled={isNameInvalid}>Save</Button>
            </DialogActions>
        </Dialog>
        <Dialog
            open={showOverwrite}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <DialogTitle>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Overwrite Existing Table
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Box>
                    <Typography id="modal-modal-description" sx={{mt: 2}} align='center'>
                        <div>You are about to overwrite an existing table with the same name.</div>
                        <div>Are you sure you want to do this?</div>
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={()=>setShowOverwrite(false)}>No</Button>
                <Button variant="contained" onClick={()=>doSave()}>Yes</Button>
            </DialogActions>
        </Dialog>
        {saveTableInfo.statusInfo.status === "SUCCESS" && displaySaveStatusMsg("Saved table")}
        {saveTableInfo.statusInfo.status === "FAIL" && displaySaveStatusMsg(saveTableInfo.statusInfo.errorMessage, true)}
    </div>
);
}
