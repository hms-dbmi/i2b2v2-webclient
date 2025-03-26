import React from "react";
import {useSelector} from "react-redux";
import {Box} from "@mui/material";

import "./ResearcherTableView.scss";
import {RequestTableView} from "../../RequestTableView";


export const ResearcherTableView = ({displayDetailView}) => {
    const userInfo= useSelector((state) => state.userInfo);

    return (
        <Box className={"ResearcherTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
            <RequestTableView userInfo={userInfo} displayDetailView={displayDetailView}/>
        </Box>
    )
};