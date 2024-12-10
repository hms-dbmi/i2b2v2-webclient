import React from "react";
import {RequestStatus} from "../../../models";
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";

export const RequestStatusLogView = ({statusLogs}) => {
    const columns = [
        {
            field: 'date',
            headerName: 'Date',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1,
            valueGetter: (value) => {
                if (!value) {
                    return value;
                }

                // Format the Date object
                return value.toLocaleDateString();
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1,
            valueGetter: (value) => {
                if (!value) {
                    return RequestStatus.statuses.UNKNOWN;
                }

                return RequestStatus.statuses[value];
            }
        }
    ];

    return (
        <Box className={"RequestStatusTable"} style={{display: 'flex', flexDirection: 'column'}}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 50 }} size="small" aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="left">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {statusLogs.map((row) => (
                            <TableRow
                                key={row.status}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.date.toLocaleDateString()}
                                </TableCell>
                                <TableCell align="left">{RequestStatus.statuses[row.status]}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}