import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import "./AllUsers.scss";

export const AllUsers = () => {
    const allUsers = useSelector((state) => state.allUsers.users );
    //const dispatch = useDispatch();

    const displayUsersTable = () => {
        return (
            <TableContainer className={"Users"}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>isAdmin</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            allUsers.map((user) => (
                            <TableRow key={user.username}>
                                <TableCell>{user.fullname}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.isAdmin ? "Y" : "N"}</TableCell>
                                <TableCell>
                                    <IconButton color="secondary" aria-label="edit project">
                                        <EditOutlinedIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton color="secondary" aria-label="delete project">
                                        <DeleteOutlinedIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    useEffect(() => {
    }, []);

    return (
        <div className="AllUsers">
            { !allUsers && "This is the users Tabs"}
            { allUsers && allUsers.length > 0 && displayUsersTable()}
        </div>
    );
};

AllUsers.propTypes = {};

