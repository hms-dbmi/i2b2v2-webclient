import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "../../css/modals.scss";

import { TableListing } from "../TableListing";
import Button from "@mui/material/Button";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {confirmDeleteTableStatus, confirmRenameTableStatus, deleteTable, listTables, renameTable} from "../../reducers/tableListingSlice";
import { TabPanel } from "../TabPanel";
import {loadTable} from "../../reducers/tableDefSlice";
import {Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText} from "@mui/material";

export const LoadTableModal = ({open, handleClose, handleSetScreen}) => {
    const dispatch = useDispatch();
    const { globalRows, projectRows, userRows, statusInfo, isFetching, isDeleting,
        deleteStatusInfo, renameStatusInfo} = useSelector((state) => state.tableListing);
    const [tab, setTab] = React.useState(2);
    const [selectedTable, setSelectedTable] = useState(null);
    const { isAdmin } = useSelector((state) => state.userInfo);
    const TABINDEX_FOLDERNAME = ["System Shared Tables", "Project Shared Tables", "My Tables"];


    const handleChangeTab = (event, newValue) => { setTab(newValue); };

    const addtlProps = (index) => {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    const handleLoadTable = () =>{
        handleClose();
        dispatch(loadTable({id: selectedTable.id, title: selectedTable.title, folderName: TABINDEX_FOLDERNAME[selectedTable.tabIndex]}));
        handleSetScreen(0);
    }

    const onDeleteTable = (tableId, isProjectShared, isGlobalShared) => {
        dispatch(deleteTable({tableId, isProjectShared, isGlobalShared}));
    }

    const updateSelectedTable = (tableDefInfo, tabIndex) => {
        let newTableDefInfo = { ...tableDefInfo,  tabIndex};
        setSelectedTable(newTableDefInfo);
    }
    const confirmDeleteStatus = () => {
        dispatch(confirmDeleteTableStatus());
    };

    const confirmRenameStatus = () => {
        dispatch(confirmRenameTableStatus());
    };

    const updateTableDefinitionTitle = (id, title, isProjectShared, isGlobalShared) => {
        dispatch(renameTable({id, title, isProjectShared, isGlobalShared}))
    }

    useEffect(() => {
        if (open) {
            setSelectedTable(null);
            dispatch(listTables());
        }
    }, [open]);

    return (
        <Dialog
            className={"ModalDialog"}
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            fullWidth={true}
            maxWidth={'xl'}
        >
            <DialogTitle> Load Table Definition</DialogTitle>
            <DialogContent className={"ModalDialogContent"}>
                <DialogContentText className={"ModalDialogContentText"}>
                    <Typography id="modal-description">
                        Load an existing table definition from below. Loading a definition will overwrite any unsaved changes in the definition editor.
                    </Typography>
                </DialogContentText>
                <Box
                    className = {"modalDefListBox"}
                    sx={{ flexGrow: 1, display: 'flex', boxShadow: 2 }}
                >
                    <Tabs
                        orientation="vertical"
                        value={tab}
                        onChange={handleChangeTab}
                        aria-label="Table Definition Folders"
                        sx={{ borderRight: 1, borderColor: 'divider' }}
                    >
                        <Tab label={TABINDEX_FOLDERNAME[0]} {...addtlProps(0)} />
                        <Tab label={TABINDEX_FOLDERNAME[1]} {...addtlProps(1)} />
                        <Tab label={TABINDEX_FOLDERNAME[2]} {...addtlProps(2)} />
                    </Tabs>
                    <TabPanel
                        value={tab}
                        index={0}
                        className={'modalTabPanel'}
                    >
                        <TableListing id={"loadModalDefTableGlobal"}
                                      rows={globalRows}
                                      canRename={isAdmin}
                                      onSelect={(tableDefInfo) => updateSelectedTable(tableDefInfo, 0)}
                                      hasError={statusInfo.status==='FAIL'}
                                      isLoading={isFetching || isDeleting}
                                      onDelete={(id) => onDeleteTable(id, false, true)}
                                      deleteFailed={deleteStatusInfo.status === 'FAIL'}
                                      onDeleteAlertClose={confirmDeleteStatus}
                                      onRename={(id, title) => updateTableDefinitionTitle(id, title, false, true)}
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
                        <TableListing id={"loadModalDefTableProject"}
                                      rows={projectRows}
                                      canRename={true}
                                      onSelect={(tableDefInfo) => updateSelectedTable(tableDefInfo, 1)}
                                      hasError={statusInfo.status==='FAIL'}
                                      isLoading={isFetching || isDeleting}
                                      onDelete={(id) => onDeleteTable(id, true, false)}
                                      deleteFailed={deleteStatusInfo.status === 'FAIL'}
                                      onDeleteAlertClose={confirmDeleteStatus}
                                      onRename={(id, title) =>updateTableDefinitionTitle(id, title, true, false)}
                                      renameFailed={renameStatusInfo.status === 'FAIL'}
                                      onRenameAlertClose={confirmRenameStatus}
                                      showCreatedBy={true}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tab}
                        index={2}
                        className={'modalTabPanel'}
                    >
                        <TableListing id={"loadModalDefTableLocal"}
                                      rows={userRows}
                                      canRename={true}
                                      onSelect={(tableDefInfo) => updateSelectedTable(tableDefInfo, 2)}
                                      isLoading={isFetching || isDeleting}
                                      hasError={statusInfo.status==='FAIL'}
                                      onDelete={(id) => onDeleteTable(id, false, false)}
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
            <DialogActions>
                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleLoadTable} disabled={!selectedTable || statusInfo.status === 'FAIL'}>Load</Button>
            </DialogActions>
        </Dialog>
    );
}
