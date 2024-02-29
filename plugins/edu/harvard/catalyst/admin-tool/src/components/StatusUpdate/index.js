import React, {useEffect, useState} from "react";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export const StatusUpdate = ({isOpen, setIsOpen, severity, message}) => {

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsOpen(false);
    };


    return ( <Snackbar
            open={isOpen}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal : "center" }}
        >
            <Alert
                onClose={handleCloseSaveAlert}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}