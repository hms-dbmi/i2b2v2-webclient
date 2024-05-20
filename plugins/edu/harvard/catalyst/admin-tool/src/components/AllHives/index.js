import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {Tab, Tabs} from "@mui/material";
import {
    deleteProjectUserParamStatusConfirmed,
    getAllGlobalParams,
    getAllHives,
    saveProjectUserParamStatusConfirmed
} from "actions";
import {Loader, DomainSettings, EditGlobalParameters} from "components";
import "./AllHives.scss";

export const AllHives = () => {
    const allHives = useSelector((state) => state.allHives );
    const isI2b2LibLoaded = useSelector((state) => state.isI2b2LibLoaded );
    const [updatedDomainSettings, setUpdatedDomainSettings ] = useState(allHives.hiveDomains);
    const [updatedParams, setUpdatedParams] = useState(allHives.params);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0});

    const AllHives = {
        DOMAIN: "DOMAIN",
        PARAMS: "PARAMS",
    };
    const [selectedTab, setSelectedTab] = useState(AllHives.DOMAIN);

    const dispatch = useDispatch();

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    useEffect(() => {
        if(isI2b2LibLoaded) {
            dispatch(getAllHives({}));
            dispatch(getAllGlobalParams({}));
        }
    }, []);

    useEffect(() => {
        setUpdatedDomainSettings(allHives.hiveDomains[0]);
        setUpdatedParams(allHives.params);

    }, [allHives]);

    return (
        <div className="AllHives">
            { allHives.isFetching && <Loader/>}
            <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="all hive domains page"
                variant="fullWidth"
                centered
            >
                <Tab value={AllHives.DOMAIN} label="Hive Domain Settings"/>
                <Tab value={AllHives.PARAMS} label="Global Parameters (Optional)" />
            </Tabs>
            {  selectedTab === AllHives.DOMAIN &&  updatedDomainSettings &&
                <DomainSettings
                    allHives={allHives}
                    updatedDomainSettings={updatedDomainSettings}
                    updateDomainSettings={setUpdatedDomainSettings}
                />
            }
            {  selectedTab === AllHives.PARAMS
                && <EditGlobalParameters
                    allHives={allHives}
                    updatedParams={updatedParams}
                    updateParams={setUpdatedParams}
                    paginationModel={paginationModel}
                    setPaginationModel={setPaginationModel}
                />

            }
        </div>
    );
};

AllHives.propTypes = {};

