import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tab } from "@mui/material/Tab";
import { Tabs } from "@mui/material/Tabs";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import "./Users.scss";

export const Users = () => {
    const users = useSelector((state) => state.users.users );
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
                            users.map((user) => (
                            <TableRow key={user.username}>
                                <TableCell>{user.fullname}</TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.isAdmin ? "Y" : "N"}</TableCell>
                                <TableCell><EditOutlinedIcon fontSize="small" /> <DeleteOutlinedIcon fontSize="small" /></TableCell>
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
        <div className="Users">
            { !users && "This is the users Tabs"}
            { users && users.length > 0 && displayUsersTable()}
        </div>
    );
};

Users.propTypes = {};

