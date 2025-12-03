import {useSelector, useDispatch} from "react-redux";
import React, { useState, useEffect } from "react";
import { Tabs, Tab } from "@mui/material";
import {updateI2b2LibLoaded} from "../../reducers/i2b2LibLoadedSlice";
import AppBar from '@mui/material/AppBar';

import "./MonitorDashboard.scss";
import {Overview} from "../Overview";

export const MonitorDashboard = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);

    const ViewModeTypes = {
        OVERVIEW: "OVERVIEW",
        QUERY: "QUERY",
        USERS: "USERS"

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
            console.log("i2b2 is loaded");
        }
    }, [isI2b2LibLoaded]);

    return (
        <div className={"MonitorDashboard"}>
            <AppBar className="HeaderNav" position="static">
                <Tabs
                    value={selectedTab}
                    textColor="inherit"
                    onChange={handleTabChange}
                    aria-label="admin tool navigation"

                >
                    <Tab value={ViewModeTypes.OVERVIEW} label="Overview"/>
                    <Tab value={ViewModeTypes.QUERY} label="Query" />
                    <Tab value={ViewModeTypes.USERS} label="Users" />
                </Tabs>
            </AppBar>

            {selectedTab === ViewModeTypes.OVERVIEW && <Overview/>}

        </div>
    );
};

MonitorDashboard.propTypes = {};


