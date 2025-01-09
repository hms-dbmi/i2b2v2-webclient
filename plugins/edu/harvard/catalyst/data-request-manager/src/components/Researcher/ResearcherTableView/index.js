import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";

import {Box} from "@mui/material";

import {listRequestTable} from "../../../reducers/requestTableSlice";

import "./ResearcherTableView.scss";
import {RequestTableView} from "../../RequestTableView";


export const ResearcherTableView = ({displayDetailViewId}) => {
    const dispatch = useDispatch();
    const { rows, isFetching } = useSelector((state) => state.requestTable);
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);


    useEffect(() => {
        if (isI2b2LibLoaded) {
            dispatch(listRequestTable({isAdmin: false}));
        }
    }, [isI2b2LibLoaded]);

    return (
        <Box className={"ResearcherTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
            <RequestTableView rows={rows} isLoading={isFetching || !isI2b2LibLoaded} isAdmin={false} displayDetailViewId={displayDetailViewId}/>
        </Box>
    )
};