import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import {EditProjectDetails, Loader} from "components";
import {DataGrid, GridActionsCellItem, gridClasses} from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { getAllProjects } from "actions";
import "./AllProjects.scss";

export const AllProjects = () => {
    const allProjects = useSelector((state) => state.allProjects );
    const[selectedProject, setSelectedProject] = useState(null);
    const[isEditingProject, setIsEditingProject] = useState(false);
    const dispatch = useDispatch();

    const columns = [
        { field: 'name',
            headerName: 'Name',
            flex: 2,
        },
        {
            field: 'description',
            headerName: 'Description',
            flex: 2,
            editable: false,
        },
        {
            field: 'key',
            headerName: 'Key',
            flex: 1,
            editable: false,
        },
        {
            field: 'wiki',
            headerName: 'Wiki',
            flex: 1,
            editable: false,
        },
        {
            field: 'path',
            headerName: 'Path',
            flex: 1,
            editable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            cellClassName: 'actions',
            getActions: ({id}) => {

                return [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    const handleEditClick = (id) => () => {
        let projects = allProjects.projects.filter((project) => project.id === id);
        if(projects.length === 1) {
            setSelectedProject(projects[0]);
            setIsEditingProject(true);
        }
    };

    const handleDeleteClick = (id) => () => {
    };

    const displayProjectsTable = () => {
        return (
            <DataGrid
                rows={allProjects.projects}
                columns={columns}
                disableRowSelectionOnClick
                sx={{
                    [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                        outline: 'none',
                    },
                    [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                        {
                            outline: 'none',
                        },
                }}
            />
        );
    };

    useEffect(() => {
        dispatch(getAllProjects({}));
    }, []);

    return (
        <div className="AllProjects">
            { allProjects.isFetching && <Loader/>}
            {!isEditingProject && <Button className="AddProject" size="small" variant="contained" startIcon={<AddIcon />}>
                Add New Project
            </Button>}
            { !isEditingProject && allProjects.projects.length > 0 && displayProjectsTable()}
            { isEditingProject && <EditProjectDetails project={selectedProject} setIsEditingProject={setIsEditingProject}/>}

        </div>
    );
};

AllProjects.propTypes = {};

