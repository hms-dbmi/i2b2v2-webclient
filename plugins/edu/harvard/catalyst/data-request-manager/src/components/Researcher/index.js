import React, { useState } from "react";
import {Box} from "@mui/material";
import {ResearcherDetailView} from "./ResearcherDetailView";
import {ResearcherTableView} from "./ResearcherTableView";


export const Researcher = () => {
    const [detailView, setDetailView] = useState(null);

    const setViewRequestTable = () => {
        setDetailView(null);
    }

    return (
        <Box>
            { detailView === null && <ResearcherTableView displayDetailView={setDetailView}/> }
            { detailView !== null && <ResearcherDetailView requestRow={detailView} setViewRequestTable={setViewRequestTable}/> }
        </Box>

    );
}