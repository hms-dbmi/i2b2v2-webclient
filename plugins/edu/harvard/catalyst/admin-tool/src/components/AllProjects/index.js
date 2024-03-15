import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import {DataGrid, GridActionsCellItem, gridClasses} from "@mui/x-data-grid";
import PersonIcon from '@mui/icons-material/Person';
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {EditProjectDetails, Loader, StatusUpdate} from "components";
import {Project} from "models";

import {deleteProject, deleteProjectStatusConfirmed, getAllProjects} from "actions";
import "./AllProjects.scss";

export const AllProjects = () => {
    const allProjects = useSelector((state) => state.allProjects );
    const deletedProject = useSelector((state) => state.deletedProject);
    const [projectRows, setProjectRows] = useState(allProjects.projects);
    const[selectedProject, setSelectedProject] = useState(null);
    const[isEditingProject, setIsEditingProject] = useState(false);
    const[isEditUsers, setIsEditUsers] = useState(false);
    const [showBackdrop, setSaveBackdrop] = useState(false);
    const [showStatus, setShowStatus] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [statusSeverity, setStatusSeverity] = useState("info");

    const dispatch = useDispatch();

    const columns = [
        {   field: 'name',
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
                        icon={<PersonIcon/>}
                        label="Edit Users"
                        className="textPrimary"
                        onClick={handleEditUsersClick(id)}
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

    const handleNewProject = () => {
        setSelectedProject(Project());
        setIsEditingProject(true);
        setIsEditUsers(false);
    };

    const handleEditClick = (id) => () => {
        let projects = allProjects.projects.filter((project) => project.id === id);
        if(projects.length === 1) {
            setSelectedProject(projects[0]);
            setIsEditingProject(true);
            setIsEditUsers(false);
        }
    };

    const handleEditUsersClick = (id) => () => {
        let projects = allProjects.projects.filter((project) => project.id === id);
        if(projects.length === 1) {
            setSelectedProject(projects[0]);
            setIsEditingProject(true);
            setIsEditUsers(true);
        }
    };

    const handleDeleteClick = (id) => () => {
        const project = projectRows.filter((project) => project.id === id).reduce((acc, item) => acc);
        dispatch(deleteProject({project}))
    };

    const displayProjectsTable = () => {
        return (
            <DataGrid
                rows={projectRows}
                columns={columns}
                disableRowSelectionOnClick
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                pageSizeOptions={[5, 10, 25]}
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
        if(!isEditingProject) {
            dispatch(getAllProjects({}));
        }
    }, [isEditingProject]);

    useEffect(() => {
        if(allProjects.projects) {
            setProjectRows(allProjects.projects);
        }
    }, [allProjects]);

    useEffect(() => {
        if(deletedProject.status === "SUCCESS") {
            dispatch(deleteProjectStatusConfirmed());
            setStatusMsg("Deleted project " + deletedProject.project.name);
            setShowStatus(true);
            setStatusSeverity("success");
        }
        if(deletedProject.status === "FAIL") {
            dispatch(deleteProjectStatusConfirmed());
            setStatusMsg("Error: There was an error deleting project " + deletedProject.project.name);
            setShowStatus(true);
            setStatusSeverity("success");
        }
    }, [deletedProject]);



    return (
        <div className="AllProjects">
            { allProjects.isFetching && <Loader/>}
            {!isEditingProject && <Button className="AddProject" size="small"
                variant="contained" onClick={handleNewProject} startIcon={<AddIcon />}>
                Add New Project
            </Button>}
            { !isEditingProject && displayProjectsTable()}
            { isEditingProject && <EditProjectDetails project={selectedProject} setIsEditingProject={setIsEditingProject}
                                                      isEditUsers={isEditUsers}
            />}
            <StatusUpdate isOpen={showStatus} setIsOpen={setShowStatus} severity={statusSeverity} message={statusMsg}/>
        </div>
    );
};

AllProjects.propTypes = {};

