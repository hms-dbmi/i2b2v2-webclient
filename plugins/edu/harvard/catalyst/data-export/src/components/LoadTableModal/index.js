import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "../../css/modals.scss";

import { TableListing } from "../TableListing";
import Button from "@mui/material/Button";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {confirmDeleteTableStatus, deleteTable, listTables} from "../../reducers/tableListingSlice";
import { TabPanel } from "../TabPanel";
import {loadTable} from "../../reducers/tableDefSlice";
import {Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText} from "@mui/material";

export const LoadTableModal = ({open, handleClose, handleSetScreen}) => {
    const dispatch = useDispatch();
    const { sharedRows, userRows, statusInfo, isFetching, isDeleting, deleteStatusInfo} = useSelector((state) => state.tableListing);
    const [tab, setTab] = React.useState(0);
    const [selectedTable, setSelectedTable] = useState(null);


    const handleChangeTab = (event, newValue) => { setTab(newValue); };

    const addtlProps = (index) => {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    const handleLoadTable = () =>{
        handleClose();
        dispatch(loadTable({id: selectedTable.id, title: selectedTable.title}));
        handleSetScreen(0);
    }

    const onDeleteTable = (tableId, isShared) => {
        dispatch(deleteTable({tableId, isShared}));
    }

    const confirmDeleteStatus = () => {
        dispatch(confirmDeleteTableStatus());
    };

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
                        <Tab label="Shared Tables" {...addtlProps(0)} />
                        <Tab label="My Tables" {...addtlProps(1)} />
                    </Tabs>
                    <TabPanel
                        value={tab}
                        index={0}
                        className={'modalTabPanel'}
                    >
                        <TableListing id={"loadModalDefTableGlobal"}
                                      rows={sharedRows}
                                      canRename={false}
                                      onSelect={setSelectedTable}
                                      hasError={statusInfo.status==='FAIL'}
                                      isLoading={isFetching || isDeleting}
                                      onDelete={(id) => onDeleteTable(id, true)}
                                      deleteFailed={deleteStatusInfo.status === 'FAIL'}
                                      onDeleteAlertClose={confirmDeleteStatus}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tab}
                        index={1}
                        className={'modalTabPanel'}
                    >
                        <TableListing id={"loadModalDefTableLocal"}
                                      rows={userRows} canRename={false}
                                      onSelect={setSelectedTable}  isLoading={isFetching || isDeleting}
                                      hasError={statusInfo.status==='FAIL'}
                                      onDelete={(id) => onDeleteTable(id, false)}
                                      deleteFailed={deleteStatusInfo.status === 'FAIL'}
                                      onDeleteAlertClose={confirmDeleteStatus}
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
