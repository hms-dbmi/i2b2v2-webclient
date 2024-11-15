import "../../css/modals.scss";

import {Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText} from "@mui/material";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import React from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import ReplayIcon from '@mui/icons-material/Replay';
import IconButton from '@mui/material/IconButton';

export const DateModal = ({open, handleClose, startDate, endDate, setStartDate, setEndDate, saveUpdate}) => {

    const [canSave, setCanSave] = React.useState(true);

    let handleSetStartValue = (val) => {
        setStartDate(val);
    };
    let handleSetEndValue = (val) => {
        setEndDate(val);
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
                    <div style={{textAlign: 'center', marginTop: '1rem'}}>
                        <DatePicker
                            label="Start Date"
                            views={['year','month','day']}
                            onError={(a) => {
                                if (a === null) {
                                    setCanSave(true);
                                } else {
                                    setCanSave(false);
                                }
                            }}
                            value={startDate}
                            maxDate={endDate}
                            onChange={handleSetStartValue}
                            onAccept={handleSetStartValue}
                            disableFuture={true}
                            sx={{ minWidth: 250 }}
                        />
                    <IconButton
                        aria-label="reset date"
                        size="large"
                        onClick={() => handleSetStartValue()}
                    ><ReplayIcon fontSize="inherit"/></IconButton>
                    </div>
                    <div style={{textAlign: 'center', marginTop: '1rem'}}><DatePicker
                        label="End Date"
                        views={['year','month','day']}
                        onError={(a) => {
                            if (a === null) {
                                setCanSave(true);
                            } else {
                                setCanSave(false);
                            }
                        }}
                        value={endDate}
                        minDate={startDate}
                        onChange={handleSetEndValue}
                        onAccept={handleSetEndValue}
                        disableFuture={true}
                        sx={{ minWidth: 250 }}
                    />
                    <IconButton
                        aria-label="reset date"
                        size="large"
                        onClick={()=> handleSetEndValue()}
                    ><ReplayIcon fontSize="inherit"/></IconButton>
                    </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={()=>{handleClose()}}>Cancel</Button>
                <Button variant="contained" onClick={handleDateUpdate} disabled={!canSave}>Save</Button>
            </DialogActions>
        </Dialog>
    );
};
