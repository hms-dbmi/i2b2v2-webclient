import React from "react";
import {useSelector} from "react-redux";
import {Box} from "@mui/material";

import "./AdminTableView.scss";
import {RequestTableView} from "../../RequestTableView";


export const AdminTableView = ({displayDetailView}) => {
    const userInfo = useSelector((state) => state.userInfo);

    return (
        <Box className={"AdminTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
            <RequestTableView userInfo={userInfo} displayDetailView={displayDetailView}/>
        </Box>
    )
};