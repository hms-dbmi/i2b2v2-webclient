import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import DataTable from "./DefTable";

import AppBar from '@mui/material/AppBar';
import Typography from "@mui/material/Typography";


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

export default function BasicTabs() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <AppBar position="static" color="default">
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Define Table" {...a11yProps(0)} />
                        <Tab label="Request Export" {...a11yProps(1)} />
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
            <CustomTabPanel value={value} index={0}>
                <DataTable props={{tabChanger: handleChange}}/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                Anupama's "Make Request" screen goes here...
            </CustomTabPanel>
        </Box>
    );
}