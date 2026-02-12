import React, { useEffect } from "react";
import {useSelector, useDispatch} from "react-redux";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    MenuItem,
    Paper,
    TextField,
    Tooltip, Typography
} from "@mui/material";
import "./Query.scss";
import {getAllDataSources} from "../../reducers/dataSourcesSlice";
import {QueryTableView} from "./QueryTableView";
import {getAllQueries} from "../../reducers/queriesSlice";

export const Query = () => {
    const dispatch = useDispatch();
    const [dataSource, setDataSource] = React.useState("");
    const ALL_PROJECTS = "@";
    const allProjects = [{id: ALL_PROJECTS, name: "All Projects"}];
    const [projectListOptions, setProjectListOptions  ] = React.useState(allProjects);
    const [project, setProject] = React.useState(allProjects[0]);
    const [selectedProjectId, setSelectedProjectId] = React.useState("");
    const [fetchSetting, setFetchSetting] = React.useState( 30);
    const [selectedFetchSetting, setSelectedFetchSetting] = React.useState({type: "date", value: fetchSetting});
    const [includeDeletedQueries, setIncludeDeletedQueries] = React.useState(false);
    const {isObfuscated} = useSelector((state) => state.userInfo);
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const dataSources  = useSelector((state) => state.dataSources);
    const queries  = useSelector((state) => state.queries);
    const projects  = useSelector((state) => state.projects);

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

    const handleViewQueryTable = () => {
        setSelectedProjectId(project.id);
        dispatch(getAllQueries({
            projectId: project.id,
            isObfuscated,
            fetchSetting: selectedFetchSetting,
            showDeleted: includeDeletedQueries
        }));
    }

    const handleIncludeDeletedQueriesChange = () => {
        setIncludeDeletedQueries(!includeDeletedQueries);
    }

    return (
        <Box className={"Query"}>
            <Box className="QueryHeader">
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

                        sx={{ minWidth: 240, maxWidth: 520 }}
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
                {dataSource &&
                    <>
                        <Typography className={"optionLinkText"}> for </Typography>

                        <Box className={"ProjectSelection"}>

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
                                    sx={{minWidth: 210, maxWidth: 520}}
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
                        </Box>

                        <Typography className={"optionLinkText"}> last </Typography>
                        <TextField
                            select
                            value={fetchSetting}
                            variant={"standard"}
                            size="small"
                            className={"queryFetchSizeOptions"}
                            InputLabelProps={{
                                style: {fontSize: 22, fontWeight: "bold", minWidth: "100"},
                            }}
                            onChange={(event, targetData) => {
                                setFetchSetting(event.target.value);

                                const type = targetData.props['data-type'];
                                setSelectedFetchSetting({
                                    type: type,
                                    value: event.target.value
                                });
                            }}
                        >
                            <MenuItem key={30} value={30} data-type={"date"}>
                                30 days
                            </MenuItem>
                            <MenuItem key={60} value={60} data-type={"date"}>
                                60 days
                            </MenuItem>
                            <MenuItem key={90} value={90} data-type={"date"}>
                                90 days
                            </MenuItem>
                            <MenuItem key={100} value={100} data-type={"size"}>
                                100 queries
                            </MenuItem>
                        </TextField>
                        <FormControlLabel className={"deletedQueriesOption"} control={<Checkbox size="small" checked={includeDeletedQueries} onChange={handleIncludeDeletedQueriesChange}/>} label="include deleted queries"/>
                        <Button className={"ViewProjectBtn"} variant="contained" size="small" onClick={handleViewQueryTable}>View</Button>
                    </>
                }
            </Box>
            <Box>
                {selectedProjectId && <QueryTableView queries={queries} isObfuscated={isObfuscated} projectIdList={projectListOptions}/>}
            </Box>
        </Box>
    )
}

