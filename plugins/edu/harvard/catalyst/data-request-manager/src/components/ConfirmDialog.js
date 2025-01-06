import React, {useEffect} from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Typography
} from "@mui/material";

export const ConfirmDialog = ({msg, title, onOk, onCancel, customOkLabel, customCancelLabel }) => {
    const [okLabel, setOklabel] = React.useState("Ok");
    const [cancelLabel, setCancelLabel] = React.useState("Cancel");
    const [open, setOpen] = React.useState(true);

    const handleOk = () => {
        setOpen(false);
        if(onOk){
            onOk();
        }
    };

    const handleCancel = () => {
        setOpen(false);
        if(onCancel) {
            onCancel();
        }
    };

    useEffect(() => {
        if(customOkLabel) {
            setOklabel(customOkLabel);
        }
        if(customCancelLabel) {
            setCancelLabel(customCancelLabel);
        }
    }, []);

    return (<Dialog
        className={"ConfirmDialog"}
        open={open}
        onClose={handleCancel}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="confirm-dialog-title">
            {title}
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="confirm-dialog-description">
                {msg}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleOk}>{okLabel}</Button>
            <Button onClick={handleCancel} autoFocus>
                {cancelLabel}
            </Button>
        </DialogActions>
    </Dialog>)
}