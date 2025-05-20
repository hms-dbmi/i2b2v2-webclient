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
    const { userRows, projectRows, globalRows, statusInfo, isFetching, isDeleting,
        deleteStatusInfo, renameStatusInfo } = useSelector((state) => state.tableListing);
    const saveTableInfo = useSelector((state) => state.saveTable);
    const {rows: tableDefRows} = useSelector((state) => state.tableDef);
    const { username, isAdmin } = useSelector((state) => state.userInfo);
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [enteredTitle, setEnteredTitle] = React.useState("");
    const [showOverwrite, setShowOverwrite] = React.useState(false);
    const [isNameInvalid, setIsNameInvalid] = React.useState(false);
    const [enableSave, setEnableSave] = React.useState(false);
    const [isShared, setIsShared] = React.useState(false);
    const [creatorId, setCreatorId] = React.useState(username);
    const [tab, setTab] = React.useState(2);
    const TABINDEX_FOLDERNAME = ["System Shared Tables", "Project Shared Tables", "My Tables"];

    const dispatch = useDispatch();

    const addtlProps = (index)  =>{
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    const updateTableDefinitionTitle = (id, title, isProjectShared, isGlobalShared) => {
        dispatch(renameTable({id, title, isProjectShared, isGlobalShared}));
    }

    const onRowSelect = (row) => {
        setSelectedTableDef({id: row.id, title: row.title});
        setSelectedRows([row.id]);
        setEnteredTitle(row.title);

        handleInValidName(row.title);
    }

    const selectIfNameExists = (title) =>{
        let matchedRows = [];
        if(tab === 0){
            matchedRows = globalRows.filter(srow => srow.title?.toUpperCase() === title.trim().toUpperCase());
        }
        else if(tab === 1){
            matchedRows = projectRows.filter(srow => srow.title?.toUpperCase() === title.trim().toUpperCase());
        }
        else{
           matchedRows = userRows.filter(srow => srow.title?.toUpperCase() === title.trim().toUpperCase());
        }

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

        handleInValidName(title);
    }

    const onSave = (selectedRows) =>{
        if (selectedRows.length === 0) {
            doSave();
        } else {
            setShowOverwrite(true);
        }
    }

    const handleInValidName = (title) => {
        const trimmedTitle = title !== undefined ? title.trim() : "";
        const isValidName = trimmedTitle.length > 0 && trimmedTitle.length <= 200;
        setIsNameInvalid(!isValidName);
        setEnableSave(isValidName);
    }

    const doSave = () => {
        const saveAllowed = !(tab === 0 && !isAdmin);

        if (saveAllowed) {
            dispatch(saveTable({
                    tableDefRows,
                    creator_id: creatorId,
                    tableId: selectedTableDef.id,
                    title: selectedTableDef.title,
                    folderName: TABINDEX_FOLDERNAME[tab],
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

    const onDeleteTable = (tableId, isProjectShared, isGlobalShared) => {
        dispatch(deleteTable({tableId, isProjectShared, isGlobalShared}));
    }

    const confirmDeleteStatus = () => {
        dispatch(confirmDeleteTableStatus());
    };

    const confirmRenameStatus = () => {
        dispatch(confirmRenameTableStatus());
    };

    const handleChangeTab = (event, newValue) => {
        if(!(!isAdmin && newValue === 0)) {
            setTab(newValue);
        }

        setCreatorId(newValue === 0 ? '@': username);
        setIsShared(newValue !== 2);
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
        if(creatorId === null) {
            setCreatorId(username);
        }
    }, [username]);

    useEffect(() => {
        selectIfNameExists(enteredTitle);
    }, [userRows, tab]);

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
                        {!isAdmin ?  <Tab label={TABINDEX_FOLDERNAME[0]} {...addtlProps(0)} sx={{textDecoration:"line-through"}}  disabled/>
                        : <Tab label={TABINDEX_FOLDERNAME[0]} {...addtlProps(0)}/>}
                        <Tab label={TABINDEX_FOLDERNAME[1]} {...addtlProps(1)} />
                        <Tab label={TABINDEX_FOLDERNAME[2]} {...addtlProps(2)} />
                    </Tabs>
                    <TabPanel
                        value={tab}
                        index={0}
                        className={'modalTabPanel'}
                    >
                        <TableListing
                            id={"saveModalDefTableGlobal"}
                            rows={globalRows}
                            canRename={isAdmin}
                            onSelect={onRowSelect}
                            selectionModel={selectedRows}
                            hasError={statusInfo.status==='FAIL'}
                            onDelete={(id) => onDeleteTable(id, false, true)}
                            isLoading={isFetching || isDeleting}
                            deleteFailed={deleteStatusInfo.status === 'FAIL'}
                            onDeleteAlertClose={confirmDeleteStatus}
                            onRename={(id, title) =>updateTableDefinitionTitle(id, title,false, true)}
                            renameFailed={renameStatusInfo.status === 'FAIL'}
                            onRenameAlertClose={confirmRenameStatus}
                            showCreatedBy={false}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tab}
                        index={1}
                        className={'modalTabPanel'}
                    >
                        <TableListing
                            id={"saveModalDefTableProject"}
                            rows={projectRows}
                            canRename={true}
                            onSelect={onRowSelect}
                            selectionModel={selectedRows}
                            hasError={statusInfo.status==='FAIL'}
                            onDelete={(id) => onDeleteTable(id, true, false)}
                            isLoading={isFetching || isDeleting}
                            deleteFailed={deleteStatusInfo.status === 'FAIL'}
                            onDeleteAlertClose={confirmDeleteStatus}
                            onRename={(id, title) => updateTableDefinitionTitle(id, title, true, false)}
                            renameFailed={renameStatusInfo.status === 'FAIL'}
                            onRenameAlertClose={confirmRenameStatus}
                            showCreatedBy={true}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tab}
                        index={2}
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
                            onDelete={(id) => onDeleteTable(id, false, false)}
                            isLoading={isFetching || isDeleting}
                            deleteFailed={deleteStatusInfo.status === 'FAIL'}
                            onDeleteAlertClose={confirmDeleteStatus}
                            onRename={(id, title) => updateTableDefinitionTitle(id, title, false, false)}
                            renameFailed={renameStatusInfo.status === 'FAIL'}
                            onRenameAlertClose={confirmRenameStatus}
                            showCreatedBy={false}
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
