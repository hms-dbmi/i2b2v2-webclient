import {useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {DataType, ADMIN_ROLES, DATA_ROLES, ProjectUser} from "models";
import {DataGrid, GridActionsCellItem, gridClasses, GridRowModes} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import EditIcon from '@mui/icons-material/Edit';
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { createFilterOptions } from '@mui/material/Autocomplete';
import {
    saveUserParam, saveUserParamStatusConfirmed,
    deleteUserParamStatusConfirmed, saveProjectUser,
    saveProjectUserStatusConfirmed,
    deleteProjectUser,
    deleteProjectUserStatusConfirmed, deleteUser
} from "../../actions";
import {EditProjectUser} from "../EditProjectUser";
import "./EditProjectUserAssociations.scss";
import {Confirmation} from "../index";

export const EditProjectUserAssociations = ({selectedProject, doSave, setSaveCompleted}) => {
    const allUsers = useSelector((state) => state.allUsers );
    const [rows, setRows] = useState(selectedProject.users);
    const [rowModesModel, setRowModesModel] = useState({});
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const[isEditingUser, setIsEditingUser] = useState(false);
    const[selectedUser, setSelectedUser] = useState(null);
    const[userFound, setUserFound] = useState(false);
    const[searchedUsername, setSearchedUsername] = useState({username:""});
    const [usernameInputValue, setUsernameInputValue] = useState({username:""});
    const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
    const [deleteUserConfirmMsg, setDeleteUserConfirmMsg] = useState("");
    const [deleteUsername, setDeleteUsername] = useState("");

    const dispatch = useDispatch();

    const columns = [
        { field: 'username',
            headerName: 'User Name',
            flex: 2,
            editable: false,
        },
        {
            field: 'adminPath',
            headerName: 'Admin Path',
            flex: 1,
            editable: true,
            filterable: false,
            type: 'singleSelect',
            valueOptions: [{
                label: 'Manager',
                value: ADMIN_ROLES.MANAGER
            }, {
                label: 'User',
                value: ADMIN_ROLES.USER
            }]
        },
        {
            field: 'dataPath',
            headerName: 'Data Path',
            flex: 1,
            editable: true,
            filterable: false,
            type: 'singleSelect',
            valueOptions: [{
                label: 'Protected',
                value: DATA_ROLES.DATA_PROT
            }, {
                label: 'De-identified Data',
                value: DATA_ROLES.DATA_DEID
            },
                {
                    label: 'Limited Data Set',
                    value: DATA_ROLES.DATA_LDS
                },
                {
                    label: 'Aggregated',
                    value: DATA_ROLES.DATA_AGG
                },
                {
                    label: 'Obfuscated',
                    value: DATA_ROLES.DATA_OBFSC
                }]
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if(id === "AGG_SERVICE_ACCOUNT"){
                    return [];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={confirmDelete(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };

        let newRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
        setRows(newRows);

        let param = newRows.filter((row) => row.id === newRow.id).reduce((acc, item) => acc);
        setSaveParamId(param.id);

        dispatch(saveUserParam({user: selectedUser.user, param}));

        return updatedRow;
    };

    const onProcessRowUpdateError = (error) => {
        console.warn("Process row error: " + error);
    };
    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const getRowId = (row) =>{
        return row.username;
    }

    const displayParamsTable = () => {
        return (
            <DataGrid
                autoHeight
                rows={rows}
                getRowId={getRowId}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={onProcessRowUpdateError}
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

    const handleCloseAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    const handleEditClick = (username) => () => {
        let user = selectedProject.users.filter((user) => user.username === username);
        if(user.length === 1) {
            setSelectedUser(user[0]);
            setIsEditingUser(true);
        }
    };

    const confirmDelete = (username) => () => {
        let param = rows.filter((row) => row.username === username).reduce((acc, item) => acc);
        setDeleteUsername(username);
        setDeleteUserConfirmMsg("Are you sure you want to remove user " + username + "?");
        setShowDeleteUserConfirm(true);
    };

    const handleDeleteClick = () => {
        setDeleteUsername("");
        setDeleteUserConfirmMsg("");
        setShowDeleteUserConfirm(false);

        let user = rows.filter((row) => row.username === deleteUsername).reduce((acc, item) => acc);
        dispatch(deleteProjectUser({selectedProject, user}));
    };


    const handleAssociateUser = () => {
        const newUser = ProjectUser({
            username: searchedUsername.username,
            adminPath: ADMIN_ROLES.USER,
            dataPath: DATA_ROLES.DATA_OBFSC
        });

        dispatch(saveProjectUser({user: newUser, selectedProject, previousRoles: []}));
    };

    const defaultProps = {
        options: allUsers.users,
        getOptionLabel: (option) => option.username,
    };

    const filterOptions = createFilterOptions({
        matchFrom: 'start',
        limit: 100
    });

    const handleUserInput = (event, newValue) => {
        setUsernameInputValue(newValue);

        const filteredUsers = allUsers.users.filter((user) => user.username === newValue);
        if(filteredUsers.length > 0){
            setUserFound(true);
            setSearchedUsername({username:newValue});
        }else{
            setUserFound(false);
        }
    }

    useEffect(() => {
        if(selectedProject.userStatus.status === "SAVE_SUCCESS"){
            dispatch(saveProjectUserStatusConfirmed());
            setSaveStatusMsg("Saved user " + selectedProject.userStatus.username + " to project");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
            dispatch(saveProjectUserStatusConfirmed());
        }
        if(selectedProject.userStatus.status === "SAVE_FAIL"){
            dispatch(saveProjectUserStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save user " + selectedProject.userStatus.username + " to project");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }

        if(selectedProject.userStatus.status === "DELETE_SUCCESS"){
            dispatch(deleteProjectUserStatusConfirmed());
            setSaveStatusMsg("Removed user " + selectedProject.userStatus.username + " from project");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }

        if(selectedProject.userStatus.status === "DELETE_FAIL"){
            dispatch(deleteProjectUserStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to remove user " + selectedProject.userStatus.username + " from project");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }

       if(selectedUser) {
            let updatedSelectedUser = selectedProject.users.filter((user) => user.username === selectedUser.username).reduce((acc, item) => acc);
            setSelectedUser(updatedSelectedUser);
        }

        setRows(selectedProject.users);

    }, [selectedProject]);

    useEffect(() => {
        if(doSave){
            setSaveCompleted(true);
        }
    }, [doSave]);


    return (
        <div className="EditProjectUserAssociations" >
            <Typography> {selectedProject.project.name + " - User Associations"} </Typography>
            <Stack
                direction={"row"}
                spacing={2}
                className={"UserSearch"}
            >
                <Autocomplete
                    value={searchedUsername}
                    onChange={(event, newValue) => {
                        setSearchedUsername(newValue);
                    }}
                    inputValue={usernameInputValue}
                    onInputChange={handleUserInput}
                    className={"UserInput"}
                    {...defaultProps}
                    filterOptions={filterOptions}
                    freeSolo
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search username"
                            variant="standard"
                        />
                    )}
                />
                <Button className="AddUser" variant="contained" startIcon={<AddIcon />} onClick={handleAssociateUser} disabled={!userFound}>
                    Associate User to Project
                </Button>
            </Stack>
            
            {displayParamsTable()}

            {isEditingUser && <EditProjectUser project={selectedProject} user={selectedUser} setIsEditingUser={setIsEditingUser}/>}

            <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                open={showSaveStatus}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: 'top', horizontal : "center" }}
                onClose={handleCloseAlert}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={saveStatusSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {saveStatusMsg}
                </Alert>
            </Snackbar>

            { showDeleteUserConfirm && <Confirmation
                text={deleteUserConfirmMsg}
                onOk={handleDeleteClick}
                onCancel={() => setShowDeleteUserConfirm(false)}
            />}
        </div>
    );

};

EditProjectUserAssociations.propTypes = {};
