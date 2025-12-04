import React, { useState, useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import {Button, FormControl, Grid, MenuItem, TextField, Tooltip, Typography} from "@mui/material";
import {getAllProjects} from "../../reducers/projectsSlice";
import "./Overview.scss";

export const Overview = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const projects  = useSelector((state) => state.projects);
    const ALL_PROJECTS = "ALL_PROJECTS";
    const [project, setProject] = React.useState(ALL_PROJECTS);

    useEffect(() => {
        if (isI2b2LibLoaded) {
            dispatch(getAllProjects());
        }
    }, [isI2b2LibLoaded]);

    useEffect(() => {

    }, [projects]);

    return (
        <div className="Overview">
            <div className="ProjectOverviewHeader">
                <Tooltip title={project}>
                    <TextField
                        select
                        value={project}
                        label="View Activity Overview for:"
                        onChange={(event)=> {
                            setProject(event.target.value);
                        }}
                        variant="standard"
                        size="large"
                        sx={{ minWidth: 220, maxWidth: 520 }}
                        InputLabelProps={{
                            style: { fontSize: 22, fontWeight: "bold" },
                        }}
                    >
                        <MenuItem key={ALL_PROJECTS} value={ALL_PROJECTS}>
                            All Projects
                        </MenuItem>
                        {projects.projectList.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Tooltip>
                <Button className={"ViewProjectBtn"} variant="outlined" size="small">View</Button>
                <div className={"ProjectOverviewCount"}>{project === ALL_PROJECTS ? "Viewing " + projects.projectList.length + " Projects": ""}</div>
            </div>
        </div>
    );
};
