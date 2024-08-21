/* global i2b2 */

import './App.css';
import * as React from 'react';
import ExportDefList from "./definitionListing";
import DataTable from "./DefTable";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import sdxDropHandler from "./dropHandler"

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



function App() {
    const [selectedTab, setSelectedTab] = React.useState(0);
    const handleTabChange = (event, newTab) => { setSelectedTab(newTab); };

    return (
    <div className="App">
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar position="static" color="default">
                    <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="Define Table" {...a11yProps(0)} />
                        <Tab label="Preview Table" {...a11yProps(1)} />
                        <Tab label="Request Export" {...a11yProps(2)} />
                    </Tabs>
                    <Typography
                        style={{
                            position:"absolute",
                            top: "12px",
                            fontWeight: "bold",
                            left: "50%",
                            transform: "translate(-50%)"
                        }}
                    >Data Export Tool</Typography>
                </AppBar>
            </Box>
            <CustomTabPanel value={selectedTab} index={0}>
                <DataTable props={{tabChanger: setSelectedTab}}/>
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={1}>
                Show Example table here
            </CustomTabPanel>
            <CustomTabPanel value={selectedTab} index={2}>
                Anupama's "Make Request" screen goes here...
            </CustomTabPanel>
        </Box>
    </div>
  );
}

export default App;




// ---------------------------------------------------------------------------------------
window.addEventListener("I2B2_READY", ()=> {
    debugger;
    // the i2b2 framework is loaded and ready (including population of i2b2.model namespace)
    if (i2b2.model.tableDef === undefined) {
        i2b2.model.tableDef = {};
    } else {
        console.log("load previous table state");
    }
    // attach the drop handler after initialization
    i2b2.sdx.AttachType("dropTrgt", "CONCPT");
    i2b2.sdx.setHandlerCustom("dropTrgt", "CONCPT", "DropHandler", sdxDropHandler);
});
