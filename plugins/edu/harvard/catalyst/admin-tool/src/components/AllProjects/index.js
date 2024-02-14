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
import { Loader } from "components";

import "./AllProjects.scss";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";

export const AllProjects = () => {
    const allProjects = useSelector((state) => state.allProjects );
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
                            allProjects.projects.map((user) => (
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
            { allProjects.isFetching && <Loader/>}
            <Button className="AddProject" size="small" variant="contained" startIcon={<AddIcon />}>
                Add New Project
            </Button>
            { allProjects.projects.length > 0 && displayProjectsTable()}
        </div>
    );
};

AllProjects.propTypes = {};

