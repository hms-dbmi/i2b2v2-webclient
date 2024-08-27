import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { shadows } from '@mui/system';
import "../../css/modals.scss";

import { TableListing } from "../TableListing";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { listTables } from "../../reducers/listTablesSlice";
import { TabPanel } from "./TabPanel";

export const LoadTableModal = ({open, handleClose}) => {
    const dispatch = useDispatch();
    const { sharedRows, userRows } = useSelector((state) => state.tableListing);
    const [tab, setTab] = React.useState(0);
    const handleChangeTab = (event, newValue) => { setTab(newValue); };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        minWidth: 1280,
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

    useEffect(() => {
        if (open) {
            dispatch(listTables());
        }
    }, [open]);

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Load Table Definition
                </Typography>
                <Typography id="modal-modal-description" sx={{mt: 2, marginBottom: "1rem"}}>
                    Load an existing table definition from below. Loading a definition will overwrite any unsaved changes in the definition editor.
                </Typography>
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
                        <Tab label="Shared Tables" {...a11yProps(0)} />
                        <Tab label="My Tables" {...a11yProps(1)} />
                    </Tabs>
                    <TabPanel
                        value={tab}
                        index={0}
                        className={'modalTabPanel'}
                    >
                        <TableListing id={"loadModalDefTableGlobal"} rows={sharedRows} canRename={false}/>
                    </TabPanel>
                    <TabPanel
                        value={tab}
                        index={1}
                        className={'modalTabPanel'}
                    >
                        <TableListing id={"loadModalDefTableLocal"} rows={userRows} canRename={true}/>
                    </TabPanel>
                </Box>
                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    style={{width:"100%", margin:"auto", marginTop: "16px"}}
                >
                    <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={()=>alert("Load")}>Load</Button>
                </Stack>
            </Box>
        </Modal>
    );
}
