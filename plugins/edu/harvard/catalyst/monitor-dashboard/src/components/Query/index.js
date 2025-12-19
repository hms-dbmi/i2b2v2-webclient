import React, { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import {Autocomplete, Box, Button, Paper, TextField, Tooltip} from "@mui/material";
import "./Query.scss";
import {getAllDataSources} from "../../reducers/dataSourcesSlice";

export const Query = () => {
    const dispatch = useDispatch();
    const [dataSource, setDataSource] = React.useState("");
    const ALL_PROJECTS = "ALL_PROJECTS";
    const allProjects = [{id: ALL_PROJECTS, name: "All Projects"}];
    const projects  = useSelector((state) => state.projects);
    const [projectListOptions, setProjectListOptions  ] = React.useState(allProjects);
    const [project, setProject] = React.useState(allProjects[0]);

    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const dataSources  = useSelector((state) => state.dataSources);

    useEffect(() => {
        if (isI2b2LibLoaded) {
            dispatch(getAllDataSources());
        }
    }, [isI2b2LibLoaded]);

    useEffect(() => {
        const projs = [...allProjects, ...projects.projectList];
    }, [projects.projectList]);

    const handleUpdateProjectList = (datasource) => {
        const trimmedProjPaths = datasource.projectPaths.map(p => p.replace(/\/$/, ''));
        const filteredProjectsList = projects.projectList.filter(proj => {
            let newPath = proj.path.trim().replace(/\/$/, '');
            return trimmedProjPaths.includes(newPath);
        }).map(p => {
            const modProject = {...p};
            modProject.name = p.name + " Project";
            return modProject;
        });
        const newProjectList = [...allProjects, ...filteredProjectsList];
        setProjectListOptions(newProjectList);
        setProject(allProjects[0]);
    }

    return (
        <Box className={"Query"}>
            <div className="QueryHeader">
                {dataSources.isFetching || dataSources.dataSourceList.length > 1 && <Tooltip title={dataSource ? dataSource.dbSchema : ""}>
                    <Autocomplete
                        getOptionLabel={(option) => option.dbSchema ? option.dbSchema: ""}
                        getOptionKey={(option) => option.id}
                        value={dataSource ? dataSource : ""}
                        options={ dataSources.dataSourceList }
                        onChange={(event, value) => {
                            if(!value){
                                value = {id: "", dbSchema: "", projectPaths: []};
                            }
                            setDataSource(value);
                            handleUpdateProjectList(value);
                        }}

                        sx={{ minWidth: 320, maxWidth: 540 }}
                        PaperComponent={props => (
                            <Paper {...props}/>
                        )}
                        renderInput={(params) => (
                            <TextField
                                label="View Query Activity for:"
                                variant={"standard"}
                                {...params}
                                placeholder={"Select a database"}
                                InputLabelProps={{
                                    style: { fontSize: 22, fontWeight: "bold" },
                                    shrink: true,
                                }}
                            />
                        )}
                    />
                </Tooltip>
                }
                <Box className={"ProjectSelection"}>
                    {projectListOptions.length > 2 &&
                        <Tooltip title={project ? project.name : ""}>
                            <Autocomplete
                                getOptionLabel={(option) => option.name}
                                getOptionKey={(option) => option.id}
                                value={project ? project : {id: "", name: ""}}
                                options={projectListOptions}
                                onChange={(event, value) => {
                                    if (!value) {
                                        value = {id: "", name: ""};
                                    }
                                    setProject(value);
                                }}
                                sx={{minWidth: 320, maxWidth: 540}}
                                PaperComponent={props => (
                                    <Paper {...props}/>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        variant={"standard"}
                                        {...params}
                                        placeholder={"Select a project"}
                                        InputLabelProps={{
                                            style: {fontSize: 22, fontWeight: "bold"},
                                        }}
                                    />
                                )}
                            />
                        </Tooltip>
                    }
                    {projectListOptions.length === 2 && <Box className>{projectListOptions[1].name}</Box>}
                </Box>
                {projectListOptions.length > 2 && <Button className={"ViewProjectBtn"} variant="outlined" size="small">View</Button>}
            </div>
        </Box>
    )
}

