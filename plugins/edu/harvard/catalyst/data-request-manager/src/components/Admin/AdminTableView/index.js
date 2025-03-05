import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";

import {Box} from "@mui/material";

import "./AdminTableView.scss";
import {RequestTableView} from "../../RequestTableView";
import {listRequestTable} from "../../../reducers/requestTableSlice";


export const AdminTableView = ({displayDetailView}) => {
    const dispatch = useDispatch();
    const { rows, isFetching } = useSelector((state) => state.requestTable);
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const { username }  = useSelector((state) => state.userInfo);


    useEffect(() => {
        if (isI2b2LibLoaded) {
            dispatch(listRequestTable({isManager: true, username}));
        }
    }, [isI2b2LibLoaded]);

    return (
        <Box className={"AdminTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
            <RequestTableView rows={rows} isLoading={isFetching || !isI2b2LibLoaded} isManager={true} displayDetailView={displayDetailView}/>
        </Box>
    )
};