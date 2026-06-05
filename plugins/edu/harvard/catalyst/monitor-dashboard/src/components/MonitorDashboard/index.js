import {useSelector, useDispatch} from "react-redux";
import React, { useState, useEffect } from "react";
import { IconButton, Tabs, Tab } from "@mui/material";
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import {updateI2b2LibLoaded} from "../../reducers/i2b2LibLoadedSlice";
import {getUserInfo} from "../../reducers/userInfoSlice";

import AppBar from '@mui/material/AppBar';

import "./MonitorDashboard.scss";
import {Overview} from "../Overview";
import {Query} from "../Query";

export const MonitorDashboard = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);

    const ViewModeTypes = {
        OVERVIEW: "OVERVIEW",
        QUERY: "QUERY",
    };
    const [selectedTab, setSelectedTab] = useState(ViewModeTypes.OVERVIEW);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const i2b2LibLoaded = () => {
        dispatch(updateI2b2LibLoaded());
    }

    useEffect(() => {
        if (!isI2b2LibLoaded) {
            window.addEventListener('I2B2_READY', i2b2LibLoaded);
        } else {
            console.log("i2b2 lib is loaded");
            dispatch(getUserInfo());
        }
    }, [isI2b2LibLoaded]);

    return (
        <div className={"MonitorDashboard"}>
            <AppBar className="HeaderNav" position="static">
                <Tabs
                    value={selectedTab}
                    textColor="inherit"
                    onChange={handleTabChange}
                    aria-label="Monitor i2b2 activity"
                >
                    <Tab value={ViewModeTypes.OVERVIEW} label="Overview"/>
                    <Tab value={ViewModeTypes.QUERY} label="Query" />
                    <IconButton className={"help"} href="assets/i2B2_Admin_Help_Documentation_06_04_2026.pdf" target="_blank" variant="contained">
                        <HelpOutlineOutlinedIcon />
                    </IconButton>
                </Tabs>
            </AppBar>

            {selectedTab === ViewModeTypes.OVERVIEW && <Overview/>}
            {selectedTab === ViewModeTypes.QUERY && <Query/>}
        </div>
    );
};

MonitorDashboard.propTypes = {};


