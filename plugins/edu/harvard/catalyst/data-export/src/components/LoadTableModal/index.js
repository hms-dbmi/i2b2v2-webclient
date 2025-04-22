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
    const { globalRows, projectRows, userRows, statusInfo,
        isFetching, isDeleting, deleteStatusInfo, renameStatusInfo} = useSelector((state) => state.tableListing);
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
        dispatch(loadTable({id: selectedTable.id, title: selectedTable.title, folderName: TABINDEX_FOLDERNAME[tab]}));
        handleSetScreen(0);
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

    const updateTableDefinitionTitle = (id, title) => {
        dispatch(renameTable({id, title}))
    }

    useEffect(() => {
        if (open) {
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
                                      onSelect={setSelectedTable}
                                      hasError={statusInfo.status==='FAIL'}
                                      isLoading={isFetching || isDeleting}
                                      onDelete={(id) => onDeleteTable(id, true)}
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
                    >
                        <TableListing id={"loadModalDefTableProject"}
                                      rows={projectRows}
                                      canRename={true}
                                      onSelect={setSelectedTable}
                                      hasError={statusInfo.status==='FAIL'}
                                      isLoading={isFetching || isDeleting}
                                      onDelete={(id) => onDeleteTable(id, true)}
                                      deleteFailed={deleteStatusInfo.status === 'FAIL'}
                                      onDeleteAlertClose={confirmDeleteStatus}
                                      onRename={updateTableDefinitionTitle}
                                      renameFailed={renameStatusInfo.status === 'FAIL'}
                                      onRenameAlertClose={confirmRenameStatus}
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
                                      onSelect={setSelectedTable}  isLoading={isFetching || isDeleting}
                                      hasError={statusInfo.status==='FAIL'}
                                      onDelete={(id) => onDeleteTable(id, false)}
                                      deleteFailed={deleteStatusInfo.status === 'FAIL'}
                                      onDeleteAlertClose={confirmDeleteStatus}
                                      onRename={updateTableDefinitionTitle}
                                      renameFailed={renameStatusInfo.status === 'FAIL'}
                                      onRenameAlertClose={confirmRenameStatus}
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
