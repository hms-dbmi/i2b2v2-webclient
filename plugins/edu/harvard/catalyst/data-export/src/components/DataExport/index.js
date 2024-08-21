import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {DefineTable} from "../DefineTable";
import PropTypes from "prop-types";

export const DataExport = () => {
    const [selectedTab, setSelectedTab] = React.useState(0);

    const handleTabChange = (event, newTab) => { setSelectedTab(newTab); };

    // ======================================================
    function CustomTabPanel(props) {
        const { children, value, index, ...other } = props;
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
            >
                {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
            </div>
        );
    }
    CustomTabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
    };
    function a11yProps(index) {
        return {
            id: `simple-tab-${index}`,
            'aria-controls': `simple-tabpanel-${index}`,
        };
    }
    // ======================================================

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar position="static" color="default">
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="Define Table" {...a11yProps(0)} />
                        <Tab label="Preview Table" {...a11yProps(1)} />
                        <Tab label="Request Export" {...a11yProps(2)} />
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
                Anupama's "Make Request" screen goes here...
            </CustomTabPanel>
        </Box>
    )
}