import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as React from "react";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import TextField from '@mui/material/TextField';

import "../../css/modals.scss";
import { TableListing } from "../TableListing";


import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";


export const SaveTableModal = ({open, handleClose}) => {
    const [tableDefName, setTableDefName] = React.useState('');
    const [selectedRows, setSelectedRows] = React.useState([]);
    const [showOverwrite, setShowOverwrite] = React.useState(false);

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


    const rowsLocal = [
        { id:1, name: "Nick's 1st Demographics run", create: new Date(Date.parse("01/01/23")), edit: new Date(Date.parse("07/07/24")), columns: 10},
        { id:2, name: "Dummy test", create: new Date(Date.parse("04/05/23")), edit: new Date(Date.parse("07/07/24")), columns: 20},
        { id:3, name: "Example 1", create: new Date(Date.parse("06/07/23")), edit: new Date(Date.parse("07/07/24")), columns: 25},
        { id:4, name: "Example 2", create: new Date(Date.parse("11/16/23")), edit: new Date(Date.parse("07/07/24")), columns: 11},
        { id:5, name: "COVID + GLP-1s", create: new Date(Date.parse("01/01/23")), edit: new Date(Date.parse("07/07/24")), columns: 10},
        { id:6, name: "COVID + ACE2", create: new Date(Date.parse("04/05/23")), edit: new Date(Date.parse("07/07/24")), columns: 20},
        { id:7, name: "NegCOVID + GLP-1s", create: new Date(Date.parse("06/07/23")), edit: new Date(Date.parse("07/07/24")), columns: 25},
        { id:8, name: "NegCOVID + ACE2", create: new Date(Date.parse("11/16/23")), edit: new Date(Date.parse("07/07/24")), columns: 11},
        { id:9, name: "Diabetes", create: new Date(Date.parse("01/01/23")), edit: new Date(Date.parse("07/07/24")), columns: 10},
        { id:10, name: "Ashtma", create: new Date(Date.parse("04/05/23")), edit: new Date(Date.parse("07/07/24")), columns: 20},
        { id:11, name: "COPD", create: new Date(Date.parse("06/07/23")), edit: new Date(Date.parse("07/07/24")), columns: 25},
        { id:12, name: "opps (delete me)", create: new Date(Date.parse("11/16/23")), edit: new Date(Date.parse("07/07/24")), columns: 11},
        { id:13, name: "Complex Stats Demo", create: new Date(Date.parse("01/01/23")), edit: new Date(Date.parse("07/07/24")), columns: 10},
        { id:14, name: "testing 2", create: new Date(Date.parse("04/05/23")), edit: new Date(Date.parse("07/07/24")), columns: 20},
        { id:15, name: "testing 1", create: new Date(Date.parse("06/07/23")), edit: new Date(Date.parse("07/07/24")), columns: 25},
        { id:16, name: "test", create: new Date(Date.parse("11/16/23")), edit: new Date(Date.parse("07/07/24")), columns: 11},
    ];


    function a11yProps(index) {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    }

    function TabPanel(props) {
        const { children, value, index, ...other } = props;
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`vertical-tabpanel-${index}`}
                aria-labelledby={`vertical-tab-${index}`}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        <Typography>{children}</Typography>
                    </Box>
                )}
            </div>
        );
    }

    function onRowSelect(row) {
        setTableDefName(row.name);
        setSelectedRows(row.id);
    }
    function onNameChange(e) {
        setTableDefName(e.target.value);
        setSelectedRows([]);
    }
    function onSelectionModelChange(e) {
        console.warn("tets");
    }

    function onSave(selectedRows) {
        if (selectedRows.length === 0) {
            doSave();
        } else {
            setShowOverwrite(true);
        }
    }

    function doSave() {
        alert("Saved!");
        setShowOverwrite(false);
        handleClose();
    }



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
                        aria-label="Vertical tabs example"
                        sx={{ borderRight: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Shared Tables" {...a11yProps(0)} sx={{textDecoration:"line-through"}}/>
                        <Tab label="My Tables" {...a11yProps(1)} />
                    </Tabs>
                    <TabPanel
                        value={0}
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
                            rows={rowsLocal}
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
                        value={tableDefName}
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
