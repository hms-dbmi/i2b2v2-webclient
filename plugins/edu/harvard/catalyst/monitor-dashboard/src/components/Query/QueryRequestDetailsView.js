import React  from "react";
import {useSelector} from "react-redux";

import "./QueryTableView.scss";
import {CustomTabs} from "./CustomTabs";

import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";
import Button from "@mui/material/Button";

export const QueryRequestDetailsView = ({onClose}) => {
    const queryRequestDetails  = useSelector((state) => state.queryRequestDetails);
    const [open, setOpen] = React.useState(true);

    const handleOk = () => {
        setOpen(false);
        onClose();
    };


    const getXmlTab = () => {
        return (
            <Box>
                <pre>
                    {queryRequestDetails.queryRequestXml}
                </pre>
            </Box>
        )
    }

    return(
        <Dialog
            className={"QueryRequestDetails"}
            open={open}
            onClose={handleOk}
            aria-labelledby="query-request-details-title"
            aria-describedby="query-request-details-description"
            fullWidth={true}
            maxWidth={'xl'}
            PaperProps={{
                sx: {
                    minHeight: "95%",
                },
            }}
        >
            <DialogTitle id="query-request-details-title">
                Query Run Details for {queryRequestDetails.queryName}
            </DialogTitle>
            <DialogContent dividers>
                <Typography>
                    <CustomTabs tabData={
                        [{
                            label: "XML",
                            content: getXmlTab()
                        }]
                        }
                    />
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleOk}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}
