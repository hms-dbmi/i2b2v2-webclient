import React, {useEffect} from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from "@mui/material";

export const AlertDialog = ({msg, title, onOk, customOkLabel }) => {
    const [okLabel, setOklabel] = React.useState("Ok");
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
        className={"AlertDialog"}
        open={open}
        onClose={handleOk}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">
            {title}
        </DialogTitle>
        <DialogContent dividers>
            <DialogContentText id="alert-dialog-description">
                {msg}
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button variant="contained" onClick={handleOk}>{okLabel}</Button>
        </DialogActions>
    </Dialog>)
}