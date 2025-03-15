import React, {useEffect} from "react";
import {
    Box, IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from '@mui/utils';
import './RequestStatusLogs.scss';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const RequestStatusLogView = ({requestStatusLog}) => {
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('date');
    const [sortedStatusLogs, setSortedStatusLogs] = React.useState([]);
    const [expandRowList, setExpandRowList] = React.useState([]);

    const headCells = [
        {
            id: 'requestType',
            numeric: false,
            disablePadding: false,
            label: 'Request',
        },
        {
            id: 'date',
            numeric: false,
            disablePadding: false,
            label: 'Date',
        },
        {
            id: 'status',
            numeric: false,
            disablePadding: false,
            label: 'Status',
        },
    ];

    const EnhancedTableHead = (props) => {
        const { order, orderBy, onRequestSort } =
            props;
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

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const getLatestRequestStatusLog = (statusLogs) => {
        const recentStatusLogList = statusLogs.map(requestLog => {
            const logItemsSorted = requestLog.logItems.sort((a, b) => {
                if(a.date === b.date){
                    return a.order > b.order;
                }
                else {
                    return a.date > b.date;
                }
            });

            let requestStatusLog = {
                description: requestLog.description,
                date: '',
                status: '',
                logItems:  requestLog.logItems
            }
            if(logItemsSorted.length > 0){
                requestStatusLog.date = logItemsSorted[0].date;
                requestStatusLog.status = logItemsSorted[0].status;
            }

            return requestStatusLog;
        });

        return recentStatusLogList;
    }

    useEffect(() => {
        if(requestStatusLog.length > 0){
            const sLogs = getLatestRequestStatusLog(requestStatusLog);
            setSortedStatusLogs(sLogs);
        }
    }, [requestStatusLog]);

    const updateExpandList = (rowDescription) => {
        const newExpandList = [...expandRowList];

        const rowDescIndex = expandRowList.indexOf(rowDescription);
        if(rowDescIndex !== -1){
            newExpandList.splice(rowDescIndex, 1);
        }
        else{
            newExpandList.push(rowDescription);
        }
        setExpandRowList(newExpandList);
    }

    const truncateDescriptionName = (name) => {
        let truncatedName = name;
        const maxLength = 20;
        if(truncatedName.length > maxLength){
            truncatedName = truncatedName.slice(0, maxLength) + "...";
        }
        return truncatedName;
    }

    return (
        <Box className={"RequestStatusTable"} style={{display: 'flex', flexDirection: 'column'}}>
            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                <Table stickyHeader sx={{ minWidth: 50 }} size="small" aria-label="simple table">
                    <EnhancedTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                        rowCount={sortedStatusLogs.length}
                    />
                    <TableBody>
                        {sortedStatusLogs.map((row) => (
                            <>
                            <TableRow
                                key={row.status}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row" title={row.description}>
                                    <IconButton aria-label="expand" onClick={() => updateExpandList(row.description)}>
                                        {!expandRowList.includes(row.description) ? <ChevronRightIcon/> : <ExpandMoreIcon />}
                                    </IconButton>
                                    {truncateDescriptionName(row.description)}
                                </TableCell>
                                <TableCell align="left">
                                    {row.date.toLocaleDateString()}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    {row.status.name}
                                </TableCell>
                            </TableRow>
                            {expandRowList.includes(row.description) &&
                                row.logItems.map(logItem => {
                                    return (
                                        <TableRow
                                            key={logItem.status}
                                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                        >
                                            <TableCell component="th" scope="row">
                                            </TableCell>
                                            <TableCell align="left">
                                                {logItem.date.toLocaleDateString()}
                                            </TableCell>
                                            <TableCell component="th" scope="row">
                                                {logItem.status.name}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                            </>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}