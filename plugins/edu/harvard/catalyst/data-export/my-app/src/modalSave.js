import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import * as React from "react";
import ExportDefList from "./definitionListing";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


export default function ModalSave({open, handleClose}) {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Save Table Definition
                </Typography>
                <Typography id="modal-modal-description" sx={{mt: 2}}>
                    Enter a table definition name to save as or select from the list to overwrite.
                </Typography>

                <Stack
                    spacing={2}
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                    style={{width:"100%", margin:"auto", marginTop: "16px"}}
                >
                    <Button variant="outlined" onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={()=>alert("save")}>Save</Button>
                </Stack>
            </Box>
        </Modal>
    );
}
