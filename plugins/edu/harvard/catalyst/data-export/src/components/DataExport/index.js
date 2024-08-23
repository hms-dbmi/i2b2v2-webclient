import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {DefineTable} from "../DefineTable";
import {CustomTabPanel} from "./CustomTabPanel";
import {MakeRequest} from "../MakeRequest";

export const DataExport = () => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleTabChange = (event, newTab) => { setSelectedTab(newTab); };

    const tabProps= (index) => {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar position="static" color="default">
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="Define Table" {...tabProps(0)} />
                        <Tab label="Preview Table" {...tabProps(1)} />
                        <Tab label="Request Export" {...tabProps(2)} />
                    </Tabs>
                </AppBar>
            </Box>
            <CustomTabPanel value={selectedTab} index={0}>
                <DefineTable tabChanger={setSelectedTab}/>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={1}>
                Show Example table here
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={2}>
                <MakeRequest/>
            </CustomTabPanel>
        </Box>
    )
}