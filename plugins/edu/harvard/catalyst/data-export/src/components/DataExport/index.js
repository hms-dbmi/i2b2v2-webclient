import React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {DefineTable} from "../DefineTable";
import {CustomTabPanel} from "./CustomTabPanel";
import {MakeRequest} from "../MakeRequest";
import {PreviewTable} from "../PreviewTable";
import Stack from "@mui/material/Stack";

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloudUploadSharpIcon from '@mui/icons-material/CloudUploadSharp';
import CloudDownloadSharpIcon from '@mui/icons-material/CloudDownloadSharp';
import {LoadTableModal} from "../LoadTableModal";
import {SaveTableModal} from "../SaveTableModal";
import {useSelector} from "react-redux";

export const DataExport = () => {
    const [selectedTab, setSelectedTab] = React.useState(0);
    const handleTabChange = (event, newTab) => {
        if (tableDefRows.filter((x)=> x.name.trim().length === 0).length > 0) {
            handleSnackbarOpen('Please fix the errors in the table definition.');
        } else {
            if (newTab === 0) {
                document.querySelector("#save-load").style.display = "";
            } else {
                document.querySelector("#save-load").style.display = "none";
            }
            setSelectedTab(newTab);
        }
    };

    const tabProps= (index) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }


    const [showLoad, setLoadViz] = React.useState(false);
    const handleLoadOpen = () => setLoadViz(true);
    const handleLoadClose = () => setLoadViz(false);
    const [showSave, setSaveViz] = React.useState(false);
    const handleSaveOpen = () => {
        if (tableDefRows.filter((x)=> x.name.trim().length === 0).length > 0) {
            handleSnackbarOpen('Please fix the errors in the table definition.');
        } else {
            setSaveViz(true);
        }
    }
    const handleSaveClose = () => setSaveViz(false);

    const tableDefRows = useSelector((state) => state.tableDef.rows);
    const [snackbarShown, setSnackbarViz] = React.useState(false);
    const [snackbarMsg, setSnackbarMsg] = React.useState('');
    const handleSnackbarOpen = (msg) => {
        setSnackbarMsg(msg);
        setSnackbarViz(true);
    }
    const handleSnackbarClose = () => { setSnackbarViz(false); }

    return (
        <Box sx={{ width: '100%' }}>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={snackbarShown}
                onClose={handleSnackbarClose}
                autoHideDuration={5000}
                key={'topcenter'}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMsg}
                </Alert>
            </Snackbar>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar color="default" sx={{ position:'fixed' }}>
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="Design Table" {...tabProps(0)} />
                        <Tab label="Preview Table" {...tabProps(1)} />
                        <Tab label="Select Participants for Table" {...tabProps(2)} />
                    </Tabs>
                    <Stack direction="row" spacing={0} sx={{position:"fixed", right:"1rem", marginTop:"-4px"}} id="save-load">
                        <IconButton aria-label="Load Export Definition" size="large" onClick={handleLoadOpen}  sx={{ "&:hover": {color:'rgb(85, 108, 214)'}, transition:"color" }}>
                            <CloudDownloadSharpIcon fontSize="inherit" />
                            <span className='icon-text'>Load</span>
                        </IconButton>
                        <IconButton aria-label="Save Definition" size="large" onClick={handleSaveOpen} sx={{ "&:hover": {color:'rgb(85, 108, 214)', transition:"color"} }}>
                            <CloudUploadSharpIcon fontSize="inherit" />
                            <span className='icon-text'>Save</span>
                        </IconButton>
                    </Stack>
                </AppBar>
            </Box>
            <CustomTabPanel value={selectedTab} index={0}>
                <DefineTable tabChanger={handleTabChange}/>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={1}>
                <PreviewTable tabChanger={handleTabChange}/>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={2}>
                <MakeRequest/>
            </CustomTabPanel>

            <LoadTableModal handleClose={handleLoadClose} open={showLoad} handleSetScreen={setSelectedTab} />
            <SaveTableModal handleClose={handleSaveClose} open={showSave} />
        </Box>
    )
};
