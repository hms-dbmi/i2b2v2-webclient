import React, { useState } from "react";
import {Box} from "@mui/material";
import {AdminTableView} from "./AdminTableView";
import {AdminDetailView} from "./AdminDetailView";

export const Admin = () => {
    const [detailView, setDetailView] = useState(null);

    const setViewRequestTable = () => {
        setDetailView(null);
    }

    return (
        <Box>
            { detailView === null && <AdminTableView displayDetailView={setDetailView}/> }
            { detailView !== null && <AdminDetailView requestRow={detailView} setViewRequestTable={setViewRequestTable}/> }
        </Box>

    );
}