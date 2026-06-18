import React from "react";
import PropTypes from "prop-types";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";

export default function Confirmation({ onOk, onCancel, text }) {
    return (
        <Dialog
            open={true}
            onClose={onCancel}
            aria-labelledby="alert-dialog-description"
        >
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onOk} color="primary">
                    Yes
                </Button>
                <Button onClick={onCancel} color="primary">
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

Confirmation.propTypes = {
    onOk: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired
};