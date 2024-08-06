import React, {useEffect, useState} from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export const StatusUpdate = ({isOpen, setIsOpen, severity, message}) => {

    const handleCloseAlert = (event, reason) => {
        setIsOpen(false);
    };


    return ( <Snackbar
            open={isOpen}
            autoHideDuration={4000}
            anchorOrigin={{ vertical: 'top', horizontal : "center" }}
            onClose={handleCloseAlert}
        >
            <Alert
                onClose={handleCloseAlert}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}