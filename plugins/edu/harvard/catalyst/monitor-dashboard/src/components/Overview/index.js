import React, { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Paper,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {getAllProjects} from "../../reducers/projectsSlice";
import {getUserSessions} from "../../reducers/userSessionsSlice";

import "./Overview.scss";

export const Overview = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const projects  = useSelector((state) => state.projects);
    const userSessions  = useSelector((state) => state.userSessions);
    const ALL_PROJECTS = "ALL_PROJECTS";
    const allProjects = [{id: ALL_PROJECTS, name: ALL_PROJECTS}];
    const [project, setProject] = React.useState(allProjects[0]);
    const [projectListOptions, setProjectListOptions  ] = React.useState(allProjects);

    useEffect(() => {
        if (isI2b2LibLoaded) {
            dispatch(getAllProjects());
            dispatch(getUserSessions());
        }
    }, [isI2b2LibLoaded]);


    useEffect(() => {
        const projs = [...allProjects, ...projects.projectList];
        setProjectListOptions(projs);
    }, [projects.projectList]);

    const getProjectCountText = () => {
        if(!projects.isFetching && project.id === ALL_PROJECTS){
            return "Viewing " + projects.projectList.length + " Projects";
        }else if(!projects.isFetching && project.id !== ""){
            return "Viewing 1 Project";
        }
        else {
            return "";
        }
    }
    return (
        <div className="Overview">
            <div className="ProjectOverviewHeader">
                <Tooltip title={project ? project.name : ""}>
                   <Autocomplete
                       getOptionLabel={(option) => option.name}
                        getOptionKey={(option) => option.id}
                        value={project ? project : {id: "", name: ""}}
                        options={ projectListOptions }
                        onChange={(event, value) => {
                            if(!value){
                                value = {id: "", name: ""};
                            }
                            setProject(value);
                        }}
                       sx={{ minWidth: 320, maxWidth: 540 }}
                       PaperComponent={props => (
                            <Paper {...props} className={"ProjectOverviewSuggest"}/>
                        )}
                        renderInput={(params) => (
                            <TextField
                                label="View Activity Overview for:"
                                variant={"standard"}
                                {...params}
                                InputLabelProps={{
                                    style: { fontSize: 22, fontWeight: "bold" },
                                    shrink: true,
                                }}
                            />
                        )}
                    />
                </Tooltip>
                <Button className={"ViewProjectBtn"} variant="outlined" size="small">View</Button>
                <div className={"ProjectOverviewCount"}>{getProjectCountText()}</div>
            </div>
            <Grid className={"ProjectOverviewInfoGrid"} container spacing={5}>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}> </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}> </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}> </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={"ProjectOverviewInfoContent"}>
                            {userSessions.isFetching && <CircularProgress /> }
                            {!userSessions.isFetching && userSessions.sessionCount &&
                                <Typography variant="body2">
                                    <Box className={"UserSessionCount"}>
                                        {userSessions.sessionCount}
                                    </Box>
                                    <Box>
                                        Current active sessions
                                    </Box>
                                </Typography>
                            }
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};
