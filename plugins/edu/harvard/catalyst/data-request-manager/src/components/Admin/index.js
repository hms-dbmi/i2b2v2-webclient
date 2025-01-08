import React, { useState } from "react";
import {Box} from "@mui/material";
import {AdminTableView} from "./AdminTableView";
import {AdminDetailView} from "./AdminDetailView";

export const Admin = () => {
    const [detailViewId, setDetailViewId] = useState(null);

    const setViewRequestTable = () => {
        setDetailViewId(null);
    }

    return (
        <Box>
            { detailViewId === null && <AdminTableView displayDetailViewId={setDetailViewId}/> }
            { detailViewId !== null && <AdminDetailView requestId={detailViewId} setViewRequestTable={setViewRequestTable}/> }
        </Box>

    );
}