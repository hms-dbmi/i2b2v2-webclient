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

export const Overview = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const projects  = useSelector((state) => state.projects);
    const userSessions  = useSelector((state) => state.userSessions);
    const userLogins = useSelector((state) => state.userLogins);
    const userRoleCounts = useSelector((state) => state.userRoleCounts);
    const users = useSelector((state) => state.users);

    const ALL_PROJECTS_ID = "@";
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
            const roleProject = selectedProject.id === ALL_PROJECTS_ID ? "" : selectedProject.id;
            dispatch(getAllUserRoleCounts({project: roleProject}));

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
                                <Typography variant="body2" className={"ProjectOverviewInfoContentCentered"}>
                                    {userLogins.isFetching && (
                                        <Box
                                            className={"LoadingContent"}
                                        >
                                            <CircularProgress className={"ContentProgress"}/>
                                        </Box>
                                    )}
                                    <Box className={"ProjectOverviewInfoContentCount"}>
                                        {userLogins.loginSuccessCount + userLogins.loginFailCount}
                                    </Box>
                                    <Box>
                                        login attempts in last
                                    </Box>
                                    <Box>
                                        <TextField
                                            select
                                            value={loginsSinceInDays}
                                            onChange={(event) => handleUpdateLoginsSince(event.target.value)}
                                            variant="standard"
                                        >
                                            <MenuItem value={"1"}>1 day</MenuItem>
                                            <MenuItem value={"7"}>7 days</MenuItem>
                                            <MenuItem value={"30"}>30 days</MenuItem>
                                            <MenuItem value={"60"}>60 days</MenuItem>
                                            <MenuItem value={"90"}>90 days</MenuItem>
                                        </TextField>
                                    </Box>
                                    <Box className={"ProjectOverviewInfoContentCountDetail"}>
                                        <Box className={"ProjectOverviewInfoContentCountDetailItem"}>
                                            Success: {userLogins.loginSuccessCount}
                                        </Box>
                                        <Box className={"ProjectOverviewInfoContentCountDetailItem"}>
                                            Failed: {userLogins.loginFailCount}
                                        </Box>
                                    </Box>
                                </Typography>
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={"ProjectOverviewInfoContent"}>
                            {selectedProject.id === ALL_PROJECTS_ID &&
                                <Typography variant="body2" className={"ProjectOverviewInfoContentCentered"}>
                                    {userSessions.isFetching && (
                                        <Box className={"LoadingContent"}>
                                            <CircularProgress className={"ContentProgress"}/>
                                        </Box>
                                    )}
                                    <Box className={"ProjectOverviewInfoContentCount"}>
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
