import React, { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid, MenuItem,
    Paper,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import {getAllProjects} from "../../reducers/projectsSlice";
import {getUserSessions} from "../../reducers/userSessionsSlice";
import {getUserLogins} from "../../reducers/userLoginsSlice";
import {getAllUserRoleCounts} from "../../reducers/userRoleCountsSlice";
import "./Overview.scss";
import {getAllUsers} from "../../reducers/usersSlice";
import {UserRoleCountView} from "./UserRoleCountView";
import {UserLoginView} from "./UserLoginView";
import {UserSessionView} from "./UserSessionView";

export const Overview = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const projects  = useSelector((state) => state.projects);
    const userSessions  = useSelector((state) => state.userSessions);
    const userLogins = useSelector((state) => state.userLogins);
    const userRoleCounts = useSelector((state) => state.userRoleCounts);
    const users = useSelector((state) => state.users);

    const ALL_PROJECTS_ID = "";
    const allProjects = [{id: ALL_PROJECTS_ID, name: "All Projects"}];
    const [project, setProject] = React.useState(allProjects[0]);
    const [selectedProject, setSelectedProject] = React.useState(allProjects[0]);
    const [projectListOptions, setProjectListOptions  ] = React.useState(allProjects);
    const [loginsSinceInDays, setLoginsSinceInDays] = React.useState(7);

    const handleUpdateLoginsSince = (days) => {
        setLoginsSinceInDays(days);
        dispatch(getUserLogins({loginsSinceInDays: days}));
    }
    useEffect(() => {
        if (isI2b2LibLoaded) {
            dispatch(getAllProjects());
            dispatch(getUserSessions());
            dispatch(getUserLogins({loginsSinceInDays}));
            dispatch(getAllUsers());
            dispatch(getAllUserRoleCounts({project: selectedProject.id}));

        }
    }, [isI2b2LibLoaded]);


    useEffect(() => {
        const projs = [...allProjects, ...projects.projectList];
        setProjectListOptions(projs);
    }, [projects.projectList]);

    const getProjectCountText = () => {
        if(!projects.isFetching && selectedProject.id === ALL_PROJECTS_ID){
            return "Viewing " + projects.projectList.length + " Projects";
        }else if(!projects.isFetching && selectedProject.id !== ""){
            return "Viewing 1 Project";
        }
        else {
            return "";
        }
    }
    const handleViewProjectOverview = () => {
        setSelectedProject(project);
        dispatch(getAllUserRoleCounts({projectId: project.id}));
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
                <Button className={"ViewProjectBtn"} variant="contained" size="small" onClick={handleViewProjectOverview}>View</Button>
                <div className={"ProjectOverviewCount"}>{getProjectCountText()}</div>
            </div>
            <Grid className={"ProjectOverviewInfoGrid"} container spacing={5}>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={userRoleCounts.isFetching ? "ProjectOverviewInfoContent LoadingContent" : "ProjectOverviewInfoContent" }>
                            <UserRoleCountView userRoleCounts={userRoleCounts} users={users} projectId={selectedProject.id}/>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}> </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={userLogins.isFetching ? "ProjectOverviewInfoContent LoadingContent" : "ProjectOverviewInfoContent" }>
                            {selectedProject.id === ALL_PROJECTS_ID &&
                                <UserLoginView userLogins={userLogins} loginsSinceInDays={loginsSinceInDays} updateLoginDaysSince={handleUpdateLoginsSince}/>
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={"ProjectOverviewInfoContent"}>
                            {selectedProject.id === ALL_PROJECTS_ID && <UserSessionView userSessions={userSessions}/>}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};
