import React, {useEffect} from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Typography
} from "@mui/material";

export const AlertDialog = ({msg, title, onOk, customOkLabel }) => {
    const [okLabel, setOklabel] = React.useState("Ok");
    const [cancelLabel, setCancelLabel] = React.useState("Cancel");
    const [open, setOpen] = React.useState(true);

    const handleOk = () => {
        setOpen(false);
        if(onOk){
            onOk();
        }
    };

    useEffect(() => {
        if(customOkLabel) {
            setOklabel(customOkLabel);
        }
    }, []);

    return (<Dialog
        className={"ConfirmDialog"}
        open={open}
        onClose={handleOk}
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
        </DialogActions>
    </Dialog>)
}