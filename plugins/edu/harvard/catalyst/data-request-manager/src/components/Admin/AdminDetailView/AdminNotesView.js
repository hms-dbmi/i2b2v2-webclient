import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import "./AdminNotesView.scss";
import {
    Box, Button, Card, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {getAdminNotes} from "../../../reducers/adminNotesSlice";


export const AdminNotesView = ({}) => {
    const dispatch = useDispatch();
    const { notes } = useSelector((state) => state.adminNotes);

    const getNotesTable = () => {
       return ( <TableContainer className={"AdminNotesTable"} component={Paper} sx={{ maxHeight: 200 }}>
            <Table stickyHeader sx={{ minWidth: 50 }} size="small" aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Note</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {notes.map((row) => (
                        <TableRow
                            key={row.status}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.date.toLocaleDateString()}
                            </TableCell>
                            <TableCell align="left">{row.note}</TableCell>
                        </TableRow>
                    ))}
                    {notes.length === 0 && <TableRow> <TableCell colSpan={2}>No notes found</TableCell> </TableRow>}
                </TableBody>
            </Table>
        </TableContainer>
       );
    }

    useEffect(() => {
        dispatch(getAdminNotes());

    }, []);

    return (
        <Box className={"AdminNotesView"}>
            <Typography className={"RequestDetailNotesTitle"}>
                Admin Notes
            </Typography>
            <Card  className={"RequestDetailNotesContent"}>
                <Grid className={"AddNotesMain"} container spacing={2}>
                    <Grid size={11}>
                        <TextField
                            multiline
                            rows={3}
                        />
                    </Grid>
                    <Grid size={1}>
                        <Button variant="contained" className={"AddNote"}>Add</Button>
                    </Grid>
                </Grid>
                {getNotesTable()}
            </Card>
        </Box>
    )
}