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
import {
    confirmDeleteTableStatus,
    confirmRenameTableStatus,
    deleteTable,
    listTables,
    renameTable
} from "../../reducers/tableListingSlice";
import { TabPanel } from "../TabPanel";
import {saveStatusConfirmed, saveTable} from "../../reducers/saveTableSlice";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";

export const SaveTableModal = ({open, handleClose}) => {
    const [selectedTableDef, setSelectedTableDef] = React.useState({});
    const { userRows, sharedRows, statusInfo, isFetching, isDeleting, deleteStatusInfo, renameStatusInfo } = useSelector((state) => state.tableListing);
    const saveTableInfo = useSelector((state) => state.saveTable);
    const {rows: tableDefRows} = useSelector((state) => state.tableDef);
    const { username, isAdmin } = useSelector((state) => state.userInfo);
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [enteredTitle, setEnteredTitle] = React.useState("");
    const [showOverwrite, setShowOverwrite] = React.useState(false);
    const [isNameInvalid, setIsNameInvalid] = React.useState(false);
    const [enableSave, setEnableSave] = React.useState(false);
    const [isShared, setIsShared] = React.useState(false);
    const [tab, setTab] = React.useState(1);

    const dispatch = useDispatch();

    const addtlProps = (index)  =>{
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    const updateTableDefinitionTitle = (id, title) => {
        dispatch(renameTable({id, title}));
    }

    const onRowSelect = (row) => {
        setSelectedTableDef({id: row.id, title: row.title});
        setSelectedRows([row.id]);
        setEnteredTitle(row.title);
    }

    const selectIfNameExists = (title) =>{
        const matchedRows = userRows.filter(srow => srow.title?.toUpperCase() === title.toUpperCase());

        setSelectedRows(matchedRows.map(srow => srow.id));

        if(matchedRows.length > 0) {
            setSelectedTableDef({title: matchedRows[0].title, id: matchedRows[0].id});
        }else{
            setSelectedTableDef({title: title});
        }
    }

    const onNameChange = (e) => {
        const title = e.target.value;

        selectIfNameExists(title);
        setEnteredTitle(title);

        const isValidName = title?.length > 0;
        setIsNameInvalid(!isValidName);
        setEnableSave(isValidName);
    }

    const onSave = (selectedRows) =>{
        if (selectedRows.length === 0) {
            doSave();
        } else {
            setShowOverwrite(true);
        }
    }

    const doSave = () => {
        const saveAllowed = !(isShared && !isAdmin);
        const isValidName = selectedTableDef.title?.length > 0;
        setIsNameInvalid(!isValidName);

        if (saveAllowed && isValidName) {
            dispatch(saveTable({
                    tableDefRows,
                    creator_id: username,
                    tableId: selectedTableDef.id,
                    title: selectedTableDef.title,
                    shared: isShared
                })
            );
            handleClose();
        }
        setShowOverwrite(false);
    }

    const handleConfirmStatus = () => {
        dispatch(saveStatusConfirmed());
    };

    const displaySaveStatusMsg = (statusMsg) => {
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
                    {statusMsg}
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

    const onDeleteTable = (tableId, isShared) => {
        dispatch(deleteTable({tableId, isShared}));
    }

    const confirmDeleteStatus = () => {
        dispatch(confirmDeleteTableStatus());
    };

    const confirmRenameStatus = () => {
        dispatch(confirmRenameTableStatus());
    };

    const handleChangeTab = (event, newValue) => {
        if(isAdmin) {
            setTab(newValue);
        }
        setIsShared(newValue === 0);
        setSelectedRows([]);
    };


    useEffect(() => {
        if (open) {
            setEnableSave(false);
            setIsNameInvalid(false);
            setEnteredTitle("");
            setSelectedTableDef({});

            dispatch(listTables());
        }
    }, [open]);

    useEffect(() => {
        selectIfNameExists(enteredTitle);
    }, [userRows]);

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
                        value={tab}
                        aria-label="Table Definition Folders"
                        sx={{ borderRight: 1, borderColor: 'divider'}}
                        onChange={handleChangeTab}
                    >
                        {!isAdmin ?  <Tab label="Shared Tables" {...addtlProps(0)} sx={{textDecoration:"line-through"}}  disabled/>
                        : <Tab label="Shared Tables" {...addtlProps(0)}/>}
                        <Tab label="My Tables" {...addtlProps(1)} />
                    </Tabs>
                    <TabPanel
                        value={tab}
                        index={0}
                        className={'modalTabPanel'}
                    >
                        <TableListing
                            id={"saveModalDefTableGlobal"}
                            rows={sharedRows}
                            canRename={isAdmin}
                            onSelect={onRowSelect}
                            selectionModel={selectedRows}
                            hasError={statusInfo.status==='FAIL'}
                            onDelete={(id) => onDeleteTable(id, false)}
                            isLoading={isFetching || isDeleting}
                            deleteFailed={deleteStatusInfo.status === 'FAIL'}
                            onDeleteAlertClose={confirmDeleteStatus}
                            onRename={updateTableDefinitionTitle}
                            renameFailed={renameStatusInfo.status === 'FAIL'}
                            onRenameAlertClose={confirmRenameStatus}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tab}
                        index={1}
                        className={'modalTabPanel'}
                        height={260}
                    >
                        <TableListing
                            id={"saveModalDefTableLocal"}
                            rows={userRows}
                            canRename={true}
                            onSelect={onRowSelect}
                            selectionModel={selectedRows}
                            hasError={statusInfo.status==='FAIL'}
                            onDelete={(id) => onDeleteTable(id, false)}
                            isLoading={isFetching || isDeleting}
                            deleteFailed={deleteStatusInfo.status === 'FAIL'}
                            onDeleteAlertClose={confirmDeleteStatus}
                            onRename={updateTableDefinitionTitle}
                            renameFailed={renameStatusInfo.status === 'FAIL'}
                            onRenameAlertClose={confirmRenameStatus}
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
                <Button variant="contained" onClick={()=>onSave(selectedRows)} disabled={!enableSave}>Save</Button>
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
        {saveTableInfo.statusInfo.status === "FAIL" && displaySaveStatusMsg(saveTableInfo.statusInfo.errorMessage)}
    </div>
);
}
