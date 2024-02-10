import { connect } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "@mui/material";

import { Loader } from "components";
import { getAllUsers, i2b2LibLoaded } from "actions";
import { User } from "models";
import "./Header.scss";

//load the i2b2 plugin library
import i2b2Loader from "../../js/i2b2-loader";


const WrappedHeader = ({ dispatch, user, isI2b2LibLoaded }) => {
    const ViewModeTypes = {
        USERS: "USERS",
        PROJECTS: "PROJECTS",
        HIVE: "HIVE"
    };
    const [selectedTab, setSelectedTab] = useState(ViewModeTypes.USERS);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        dispatch(getAllUsers({}));
    };

    const updateI2b2LibLoaded = () => {
        dispatch(i2b2LibLoaded({}));
    };

    useEffect(() => {
        window.addEventListener('I2B2_READY', updateI2b2LibLoaded);

        //test get all users call
        if(isI2b2LibLoaded) {
            dispatch(getAllUsers({}));
        }
    }, [updateI2b2LibLoaded]);

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
            {!i2b2LibLoaded && <Loader />}
        </div>
    );
};

WrappedHeader.propTypes = {
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.shape(User.propTypes).isRequired,
    i2b2LibLoaded: PropTypes.bool.isRequired
};

const mapStateToProps = ({ user, i2b2LibLoaded }) => ({
    user: user,
    isI2b2LibLoaded: i2b2LibLoaded
});

const Header = connect(mapStateToProps)(WrappedHeader);
export { Header };
