import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import * as React from "react";
import { shadows } from '@mui/system';
import "./css/modals.css";

import ExportDefList from "./definitionListing";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';



const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
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


const rowsGlobal = [
    { id:1, name: "Demographics", create: new Date(Date.parse("01/01/23")), edit: new Date(Date.parse("07/07/24")), columns: 10},
    { id:2, name: "Covid Use Case", create: new Date(Date.parse("04/05/23")), edit: new Date(Date.parse("07/07/24")), columns: 20},
    { id:3, name: "Demographics", create: new Date(Date.parse("06/07/23")), edit: new Date(Date.parse("07/07/24")), columns: 25},
    { id:4, name: "Demographics2", create: new Date(Date.parse("11/16/23")), edit: new Date(Date.parse("07/07/24")), columns: 11},
];

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



export default function ModalLoad({open, handleClose}) {
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => { setValue(newValue); };





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
                        value={value}
                        onChange={handleChange}
                        aria-label="Vertical tabs example"
                        sx={{ borderRight: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Shared Tables" {...a11yProps(0)} />
                        <Tab label="My Tables" {...a11yProps(1)} />
                    </Tabs>
                    <TabPanel
                        value={value}
                        index={0}
                        className={'modalTabPanel'}
                    >
                        <ExportDefList id={"loadModalDefTableGlobal"} rows={rowsGlobal} canRename={false}/>
                    </TabPanel>
                    <TabPanel
                        value={value}
                        index={1}
                        className={'modalTabPanel'}
                    >
                        <ExportDefList id={"loadModalDefTableLocal"} rows={rowsLocal} canRename={true}/>
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
