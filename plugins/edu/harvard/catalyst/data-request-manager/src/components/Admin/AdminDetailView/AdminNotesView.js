import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import "./AdminNotesView.scss";
import {
    Box, Button, Card, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {addAdminNote, getAdminNotes} from "../../../reducers/adminNotesSlice";
import {visuallyHidden} from "@mui/utils";
import {DateTime} from "luxon";


export const AdminNotesView = ({requestId}) => {
    const dispatch = useDispatch();
    const { notes } = useSelector((state) => state.adminNotes);
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('date');
    const [newNote, setNewNote] = React.useState('');

    const EnhancedTableHead = (props) => {
        const { order, orderBy, onRequestSort } = props;
        const headCells = [
            {
                id: 'date',
                numeric: false,
                disablePadding: false,
                label: 'Date',
            },
            {
                id: 'note',
                numeric: false,
                disablePadding: false,
                label: 'Note',
            },
        ];

        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };

        return (
            <TableHead>
                <TableRow>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? 'right' : 'left'}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                </TableRow>
            </TableHead>
        );
    }

    const descendingComparator = (a, b, orderBy) => {
        if(orderBy === "date"){

        }
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    const getComparator = (order, orderBy) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    }

    const sortedNotes = [...notes].sort(getComparator(order, orderBy));

    const getNotesTable = () => {
        const handleRequestSort = (event, property) => {
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);
        };

       return ( <TableContainer className={"AdminNotesTable"} component={Paper} sx={{ maxHeight: 200 }}>
            <Table stickyHeader sx={{ minWidth: 50 }} size="small" aria-label="simple table">
                <EnhancedTableHead
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={notes.length}
                />
                <TableBody>
                    {sortedNotes.map((row) => (
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

    const handleAddNote = (event) => {
        dispatch(addAdminNote({note: newNote, requestId: requestId, date: DateTime.now().toISODate()}));
    }
    useEffect(() => {
        dispatch(getAdminNotes({requestId}));

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
                            label={"Enter note"}
                            rows={3}
                            value={newNote}
                            onChange={(event) => {
                                setNewNote(event.target.value);
                            }}
                        />
                    </Grid>
                    <Grid size={1}>
                        <Button variant="contained" disabled={newNote.length === 0} className={"AddNote"} onClick={handleAddNote}>Add</Button>
                    </Grid>
                </Grid>
                {getNotesTable()}
            </Card>
        </Box>
    )
}