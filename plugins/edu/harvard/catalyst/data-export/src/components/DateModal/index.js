import "../../css/modals.scss";

import {Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import React from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import ReplayIcon from '@mui/icons-material/Replay';
import IconButton from '@mui/material/IconButton';

export const DateModal = ({open, handleClose, startDate, endDate, setStartDate, setEndDate, saveUpdate}) => {

    const [isChanged, setIsChanged] = React.useState(false);
    let handleSetStartValue = (val) => {
        setStartDate(val);
        setIsChanged(true);
    };
    let handleSetEndValue = (val) => {
        setEndDate(val);
        setIsChanged(true);
    };

    let handleDateUpdate = () => {
        saveUpdate();
        handleClose();
    }


    return (
        <Dialog
            className={"ModalDialog"}
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            fullWidth={true}
            maxWidth={'xl'}
        >
            <DialogTitle>Constrain {} By Date Range</DialogTitle>
            <DialogContent className={"ModalDialogContent"}>
                <DialogContentText className={"ModalDialogContentText"}>
                    <Typography id="modal-description">
                        Set a start and end date to select a constraint range.
                    </Typography>
                </DialogContentText>
                    <div style={{textAlign: 'center', marginTop: '1rem'}}><DatePicker
                        label="Start Date"
                        views={['year','month','day']}
                        value={startDate}
                        maxDate={endDate}
                        onChange={handleSetStartValue}
                        disableFuture={true}
                        sx={{ minWidth: 250 }}
                    />
                    <IconButton
                        aria-label="reset date"
                        size="large"
                        onClick={()=> handleSetStartValue()}
                    >
                        <ReplayIcon fontSize="inherit" label="reset start date" />
                    </IconButton>
                    </div>
                    <div style={{textAlign: 'center', marginTop: '1rem'}}><DatePicker
                        label="End Date"
                        views={['year','month','day']}
                        value={endDate}
                        minDate={startDate}
                        onChange={handleSetEndValue}
                        disableFuture={true}
                        sx={{ minWidth: 250 }}
                    />
                    <IconButton
                        aria-label="reset date"
                        size="large"
                        onClick={()=> handleSetEndValue()}
                    >
                        <ReplayIcon fontSize="inherit" label="reset end date" />
                    </IconButton>
                    </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={handleDateUpdate} disabled={!isChanged}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};
