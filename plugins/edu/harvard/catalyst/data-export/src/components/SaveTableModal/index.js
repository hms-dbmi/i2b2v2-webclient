import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';
import "../../css/modals.scss";
import { TableListing } from "../TableListing";
import { listTables } from "../../reducers/listTablesSlice";
import { TabPanel } from "../TabPanel";
import {saveTable} from "../../reducers/saveTableSlice";



export const SaveTableModal = ({open, handleClose}) => {
    const [selectedTableDef, setSelectedTableDef] = React.useState({});
    const { sharedRows, userRows } = useSelector((state) => state.tableListing);
    const tableDefRows = useSelector((state) => state.tableDef.rows);
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [showOverwrite, setShowOverwrite] = React.useState(false);
    const dispatch = useDispatch();

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        minWidth: 900,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    function a11yProps(index) {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    function onRowSelect(row) {
        setSelectedTableDef({id: row.id, title: row.title});
        setSelectedRows([row.id]);
    }
    function onNameChange(e) {
        setSelectedTableDef({name: e.target.value});
        setSelectedRows([]);
    }
    function onSelectionModelChange(e) {
//        console.warn("tets");
    }

    function onSave(selectedRows) {
        if (selectedRows.length === 0) {
            doSave();
        } else {
            setShowOverwrite(true);
        }
    }

    function doSave() {
        dispatch(saveTable({
            tableId: selectedTableDef.is,
            tableTitle: selectedTableDef.title,
            tableDefRows: tableDefRows
        }))
        setShowOverwrite(false);
        handleClose();
    }

    useEffect(() => {
        if (open) {
            dispatch(listTables());
        }
    }, [open]);


    return (
        <div>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Save Table Definition
                </Typography>
                <Typography id="modal-modal-description" sx={{mt: 2}}>
                    Enter a table definition name to save as or select from the list to overwrite.
                </Typography>
                <Box
                    className = {"modalDefListBox"}
                    sx={{ flexGrow: 1, display: 'flex', boxShadow: 2 }}
                >
                    <Tabs
                        orientation="vertical"
                        value={1}
                        aria-label="Table Definition Folders"
                        sx={{ borderRight: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Shared Tables" {...a11yProps(0)} sx={{textDecoration:"line-through"}}/>
                        <Tab label="My Tables" {...a11yProps(1)} />
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
                            canRename={true}
                            onSelect={onRowSelect}
                            onSelectionModelChange={onSelectionModelChange}
                            selectionModel={selectedRows}
                            hideFooter={true}
                        />
                    </TabPanel>
                </Box>

                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="left"
                    style={{width:"100%", margin:"auto", marginTop: "16px"}}
                >
                </Stack>

                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    style={{width:"100%", margin:"auto", marginTop: "8px"}}
                >
                    <TextField
                        required
                        size='small'
                        id="TableDefName"
                        label="Save Table Definition As"
                        defaultValue="My-Table-Definition"
                        value={selectedTableDef.name}
                        onChange={onNameChange}
                        sx={{float: "left", width:"60%", position:"absolute", left:32}}
                    />
                    <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={()=>onSave(selectedRows)}>Save</Button>
                </Stack>
            </Box>
        </Modal>
        <Modal
            open={showOverwrite}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{...modalStyle, minWidth: '30%', width: '30%'}}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Overwrite Existing Table
                </Typography>
                <p> </p>
                <Typography id="modal-modal-description" sx={{mt: 2}} align='center'>
                    <div>You are about to overwrite an existing table with the same name.</div>
                    <div>Are you sure you want to do this?</div>
                </Typography>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    style={{width:"100%", margin:"auto", marginTop: "8px"}}
                >
                    <Button variant="outlined" onClick={()=>setShowOverwrite(false)}>No</Button>
                    <Button variant="contained" onClick={()=>doSave()}>Yes</Button>
                </Stack>
            </Box>
        </Modal>
    </div>
);
}
