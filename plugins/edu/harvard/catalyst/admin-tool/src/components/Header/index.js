import { connect } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "@mui/material";
import Button from '@mui/material/Button';

import { getAllUsers } from "actions";
import { User } from "models";
import "./Header.scss";


const WrappedHeader = ({ dispatch, user }) => {
    const ViewModeTypes = {
        USERS: "USERS",
        PROJECTS: "PROJECTS",
        HIVE: "HIVE"
    };
    const [selectedTab, setSelectedTab] = useState(ViewModeTypes.USERS);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    useEffect(() => {
    }, []);

    return (
        <div>
            <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="admin tool navigation"
            >
                <Tab value={ViewModeTypes.USERS} label="Users"/>
                <Tab value={ViewModeTypes.PROJECTS} label="Projects" />
                <Tab value={ViewModeTypes.HIVE} label="Hive Settings" />
            </Tabs>
        </div>
    );
};

WrappedHeader.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.shape(User.propTypes).isRequired,
};

const mapStateToProps = ({ viewMode, user }) => ({
    user: user,
});

const Header = connect(mapStateToProps)(WrappedHeader);
export { Header };
