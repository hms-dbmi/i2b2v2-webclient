import React, { useState } from "react";
import {Box} from "@mui/material";
import {AdminTableView} from "./AdminTableView";

export const Admin = () => {
    const [detailViewId, setDetailViewId] = useState(null);

    const setViewRequestTable = () => {
        setDetailViewId(null);
    }

    return (
        <Box>
            { detailViewId === null && <AdminTableView displayDetailViewId={setDetailViewId}/> }
        </Box>

    );
}