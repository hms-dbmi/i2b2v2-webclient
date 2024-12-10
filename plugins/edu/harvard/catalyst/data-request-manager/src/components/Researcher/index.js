import React, { useState } from "react";
import {Box} from "@mui/material";
import {ResearcherDetailView} from "./ResearcherDetailView";
import {ResearcherTableView} from "./ResearcherTableView";


export const Researcher = () => {
    const [detailViewId, setDetailViewId] = useState(null);

    const setViewRequestTable = () => {
        setDetailViewId(null);
    }

    return (
        <Box>
            { detailViewId === null && <ResearcherTableView displayDetailViewId={setDetailViewId}/> }
            { detailViewId !== null && <ResearcherDetailView requestId={detailViewId} setViewRequestTable={setViewRequestTable}/> }
        </Box>


);
}