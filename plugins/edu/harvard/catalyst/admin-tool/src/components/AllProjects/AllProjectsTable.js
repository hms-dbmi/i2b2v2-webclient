import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import {DataGrid, GridActionsCellItem, gridClasses, useGridApiRef} from "@mui/x-data-grid";
import PersonIcon from '@mui/icons-material/Person';
import {EditProjectDetails, Loader, StatusUpdate} from "components";
import {Project} from "models";
import {getAllProjects} from "actions";
import "./AllProjectsTable.scss";

export const AllProjectsTable = ({paginationModel,
                                  setPaginationModel
})=> {
    const allProjects = useSelector((state) => state.allProjects );
    const [projectRows, setProjectRows] = useState(allProjects.projects);
    const[selectedProject, setSelectedProject] = useState(null);
    const[isEditingProject, setIsEditingProject] = useState(false);
    const[isEditUsers, setIsEditUsers] = useState(false);
    const apiRef = useGridApiRef();

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

    const displayProjectsTable = () => {
        return (
            <DataGrid
                rows={projectRows}
                columns={columns}
                apiRef={apiRef}
                disableRowSelectionOnClick
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onSortModelChange={(model) => {
                    apiRef.current.setPage(0);
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
        </div>
    );
};

AllProjectsTable.propTypes = {};

