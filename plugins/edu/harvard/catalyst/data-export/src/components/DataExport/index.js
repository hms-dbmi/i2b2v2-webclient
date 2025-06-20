import React, {useEffect} from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {DefineTable} from "../DefineTable";
import {CustomTabPanel} from "./CustomTabPanel";
import {PreviewTable} from "../PreviewTable";
import Stack from "@mui/material/Stack";

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloudUploadSharpIcon from '@mui/icons-material/CloudUploadSharp';
import CloudDownloadSharpIcon from '@mui/icons-material/CloudDownloadSharp';
import {LoadTableModal} from "../LoadTableModal";
import {SaveTableModal} from "../SaveTableModal";
import {useDispatch, useSelector} from "react-redux";
import {getUserInfo} from "../../reducers/userInfoSlice";

import {
    loadTable
} from "../../reducers/tableDefSlice";

import {updateI2b2LibLoaded} from "../../reducers/i2b2LibLoadedSlice";

/* global i2b2 */

export const DataExport = () => {
    const dispatch = useDispatch();

    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const [selectedTab, setSelectedTab] = React.useState(0);

    const getDupRows = () => {
        return tableDefRows.filter(r => {
            let trimmedName = r.name.trim();
            const regex = /\([0-9]*\)$/;
            const splitName = trimmedName.split(regex);
            const parsedNewName = splitName[0].trim();

            return tableDefRows.filter(p => parsedNewName !== trimmedName && p.name.trim().toLowerCase() === parsedNewName.trim().toLowerCase()).length > 0;
        });
    }
    const handleTabChange = (event, newTab) => {
        const dupRows =  getDupRows();

        if (tableDefRows.filter((x)=> x.name.trim().length === 0).length > 0 ||  dupRows.length > 0) {
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
        const dupRows = getDupRows();

        if (tableDefRows.filter((x)=> x.name.trim().length === 0).length > 0 ||  dupRows.length > 0) {
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

    const i2b2LibLoaded = () => {
        dispatch(updateI2b2LibLoaded());
    }

    useEffect(() => {
        if (isI2b2LibLoaded && i2b2.sdx !== undefined) {
            dispatch(getUserInfo({}));
            dispatch(loadTable({}));
        } else {
            window.addEventListener('I2B2_READY', i2b2LibLoaded);
        }
    }, [isI2b2LibLoaded]);

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
                <DefineTable tabChanger={handleTabChange} dispSnackbar={handleSnackbarOpen}/>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={1}>
                <PreviewTable tabChanger={handleTabChange} dispSnackbar={handleSnackbarOpen} />
            </CustomTabPanel>

            <LoadTableModal handleClose={handleLoadClose} open={showLoad} handleSetScreen={setSelectedTab} dispSnackbar={handleSnackbarOpen} />
            <SaveTableModal handleClose={handleSaveClose} open={showSave} dispSnackbar={handleSnackbarOpen} />
        </Box>
    )
};
