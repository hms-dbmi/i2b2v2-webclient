import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {DefineTable} from "../DefineTable";
import {CustomTabPanel} from "./CustomTabPanel";
import {MakeRequest} from "../MakeRequest";
import {PreviewTable} from "../PreviewTable";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import CloudUploadSharpIcon from '@mui/icons-material/CloudUploadSharp';
import CloudDownloadSharpIcon from '@mui/icons-material/CloudDownloadSharp';
import {LoadTableModal} from "../LoadTableModal";
import {SaveTableModal} from "../SaveTableModal";

export const DataExport = () => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleTabChange = (event, newTab) => { setSelectedTab(newTab); };

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
    const handleSaveOpen = () => setSaveViz(true);
    const handleSaveClose = () => setSaveViz(false);



    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar color="default" sx={{ position:'fixed' }}>
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="Define Table" {...tabProps(0)} />
                        <Tab label="Preview Table" {...tabProps(1)} />
                        <Tab label="Request Export" {...tabProps(2)} />
                    </Tabs>
                    <Stack direction="row" spacing={0} sx={{position:"fixed", right:"1rem", marginTop:"-4px"}}>
                        <Tooltip arrow title="Load">
                            <IconButton aria-label="Load Export Definition" size="large" onClick={handleLoadOpen}  sx={{ "&:hover": {color:'rgb(85, 108, 214)'}, transition:"color" }}>
                                <CloudDownloadSharpIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip arrow title="Save">
                            <IconButton aria-label="Save Definition" size="large" onClick={handleSaveOpen} sx={{ "&:hover": {color:'rgb(85, 108, 214)', transition:"color"} }}>
                                <CloudUploadSharpIcon fontSize="inherit" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </AppBar>
            </Box>
            <CustomTabPanel value={selectedTab} index={0}>
                <DefineTable tabChanger={setSelectedTab}/>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={1}>
                <PreviewTable/>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={2}>
                <MakeRequest/>
            </CustomTabPanel>

            <LoadTableModal handleClose={handleLoadClose} open={showLoad} handleSetScreen={setSelectedTab} />
            <SaveTableModal handleClose={handleSaveClose} open={showSave} />
        </Box>
    )
};
