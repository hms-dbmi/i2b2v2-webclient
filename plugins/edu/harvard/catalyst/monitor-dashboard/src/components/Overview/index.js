import React, { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    Grid,
    Paper,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {getAllProjects} from "../../reducers/projectsSlice";
import {getUserSessions} from "../../reducers/userSessionsSlice";
import {getUserLogins} from "../../reducers/userLoginsSlice";
import {getAllUserRoleCounts} from "../../reducers/userRoleCountsSlice";
import {getAllUsers} from "../../reducers/usersSlice";
import {getQueryMetrics} from "../../reducers/queryMetricsSlice";
import {UserRoleCountView} from "./UserRoleCountView";
import {UserLoginView} from "./UserLoginView";
import {UserSessionView} from "./UserSessionView";
import {NewUsersView} from "./NewUsersView";
import {getNewUsers} from "../../reducers/newUsersSlice";
import {TotalQueryView} from "./TotalQueryView";
import {QueryActivityInDaysView} from "./QueryActivityInDaysView";
import {TopUsersByQueryView} from "./TopUsersByQueryView";
import {QueryActivityByMonthView} from "./QueryActivityByMonthView";
import "./Overview.scss";

export const Overview = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const projects  = useSelector((state) => state.projects);
    const userSessions  = useSelector((state) => state.userSessions);
    const userLogins = useSelector((state) => state.userLogins);
    const userRoleCounts = useSelector((state) => state.userRoleCounts);
    const users = useSelector((state) => state.users);
    const newUsers = useSelector((state) => state.newUsers);
    const queryMetrics  = useSelector((state) => state.queryMetrics);

    const ALL_PROJECTS_ID = "";
    const allProjects = [{id: ALL_PROJECTS_ID, name: "All Projects"}];
    const [project, setProject] = React.useState(allProjects[0]);
    const [selectedProject, setSelectedProject] = React.useState(allProjects[0]);
    const [projectListOptions, setProjectListOptions  ] = React.useState(allProjects);
    const [loginsSinceInDays, setLoginsSinceInDays] = React.useState(7);
    const [newUsersSinceInDays, setNewUsersSinceInDays] = React.useState(30);
    const [totalQueriesInDays, setTotalQueriesInDays] = React.useState(1);

    const handleUpdateLoginsSince = (days) => {
        setLoginsSinceInDays(days);
        dispatch(getUserLogins({loginsSinceInDays: days}));
    }

    const handleUpdateNewUsersSince = (days) => {
        setNewUsersSinceInDays(days);
        dispatch(getNewUsers({newUsersSinceInDays: days, projectId: selectedProject.id}));
    }

    useEffect(() => {
        if (isI2b2LibLoaded) {
            dispatch(getAllProjects());
            dispatch(getUserSessions());
            dispatch(getUserLogins({loginsSinceInDays}));
            dispatch(getAllUsers({projectId: selectedProject.id}));
            dispatch(getAllUserRoleCounts({projectId: selectedProject.id}));
            dispatch(getNewUsers({newUsersSinceInDays, projectId: selectedProject.id}));
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
        setLoginsSinceInDays(7);
        setNewUsersSinceInDays(30);
        dispatch(getAllUsers({projectId: project.id}));
        dispatch(getAllUserRoleCounts({projectId: project.id}));
        dispatch(getNewUsers({newUsersSinceInDays, projectId: project.id}));
        dispatch(getQueryMetrics({projectId: project.id}));
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
                <div className={"ProjectOverviewCount"}>
                    {getProjectCountText()}
                </div>
                {selectedProject.createDate && <Typography className={"ProjectDate"}><span className={"ProjectDateLabel"}>Date Created: </span> {selectedProject.createDate.toLocaleDateString()}</Typography>}

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
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={userRoleCounts.isFetching ? "ProjectOverviewInfoContent LoadingContent" : "ProjectOverviewInfoContent" }>
                            <NewUsersView newUsers={newUsers} newUsersSinceInDays={newUsersSinceInDays} updateNewUsersSince={handleUpdateNewUsersSince} />
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={userLogins.isFetching ? "ProjectOverviewInfoContent LoadingContent" : "ProjectOverviewInfoContent" }>
                            {selectedProject.id === ALL_PROJECTS_ID &&
                                <UserLoginView userLogins={userLogins} loginsSinceInDays={loginsSinceInDays} updateLoginDaysSince={handleUpdateLoginsSince}/>
                            }

                            {selectedProject.id !== ALL_PROJECTS_ID &&
                                <TotalQueryView queryMetrics={queryMetrics}/>
                            }
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={3}>
                    <Card className={"ProjectOverviewInfo"}>
                        <CardContent className={"ProjectOverviewInfoContent"}>
                            {selectedProject.id === ALL_PROJECTS_ID && <UserSessionView userSessions={userSessions}/>}
                            {selectedProject.id !== ALL_PROJECTS_ID && <QueryActivityInDaysView
                                queryMetrics={queryMetrics}/>}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            {   selectedProject.id !== ALL_PROJECTS_ID &&
                <Grid className={"ProjectOverviewInfoGrid"} container spacing={5}>
                    <Grid size={6}>
                        <QueryActivityByMonthView queryMetrics={queryMetrics}/>
                    </Grid>
                    <Grid size={6}>
                        <TopUsersByQueryView queryMetrics={queryMetrics}/>
                    </Grid>
                </Grid>
            }
        </div>
    );
};
