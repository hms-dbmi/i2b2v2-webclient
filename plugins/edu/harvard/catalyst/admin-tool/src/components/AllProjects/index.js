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

import "./AllProjects.scss";

export const AllProjects = () => {
    const allProjects = useSelector((state) => state.allProjects.projects );
    //const dispatch = useDispatch();

    const displayProjectsTable = () => {
        return (
            <TableContainer className={"Projects"}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Id</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Key</TableCell>
                            <TableCell>Wiki</TableCell>
                            <TableCell>Path</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            allProjects.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.description}</TableCell>
                                    <TableCell>{user.key}</TableCell>
                                    <TableCell>{user.wiki}</TableCell>
                                    <TableCell>{user.path}</TableCell>
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
        <div className="AllProjects">
            { !allProjects && "This is the projects Tabs"}
            { allProjects && allProjects.length > 0 && displayProjectsTable()}
        </div>
    );
};

AllProjects.propTypes = {};

