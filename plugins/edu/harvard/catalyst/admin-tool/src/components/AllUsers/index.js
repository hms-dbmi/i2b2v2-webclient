import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { getAllUsers, deleteUser, deleteUserStatusConfirmed } from "actions";
import {EditUserDetails, Confirmation} from "components";
import { User} from "../../models";
import {
    DataGrid,
    GridActionsCellItem,
    gridClasses
} from '@mui/x-data-grid';
import { Loader } from "components";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./AllUsers.scss";


export const AllUsers = () => {
    const allUsers = useSelector((state) => state.allUsers );
    const isI2b2LibLoaded = useSelector((state) => state.isI2b2LibLoaded );
    const [userRows, setUserRows] = useState(allUsers.users);
    const deletedUser = useSelector((state) => state.deletedUser );
    const[selectedUser, setSelectedUser] = useState(null);
    const[isEditingUser, setIsEditingUser] = useState(false);
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
    const [deleteUserConfirmMsg, setDeleteUserConfirmMsg] = useState("");
    const [deleteUsername, setDeleteUsername] = useState("");

    const dispatch = useDispatch();

    const columns = [
        {
            field: 'username',
            headerName: 'User Name',
            flex: 2,
            editable: false,
        },
        { field: 'fullname',
            headerName: 'Full Name',
            flex: 2,
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            editable: false,
        },
        {
            field: 'isAdmin',
            headerName: 'Is Admin',
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

                if(id === "AGG_SERVICE_ACCOUNT"){
                    return [];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={confirmDelete(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];


    const displayUsersTable = () => {
        return (
            <DataGrid
                rows={userRows}
                columns={columns}
                getRowId={getRowId}
                disableRowSelectionOnClick
                initialState={{
                    pagination: { paginationModel: { pageSize: 25 } },
                }}
                pageSizeOptions={[25, 50, 100]}
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

    const getRowId = (row) =>{
        return row.username;
    }

    const handleEditClick = (username) => () => {
        let user = allUsers.users.filter((user) => user.username === username);
        if(user.length === 1) {
            setSelectedUser(user[0]);
            setIsEditingUser(true);
        }
    };

    const confirmDelete = (username) => () => {
        setDeleteUsername(username);
        setDeleteUserConfirmMsg("Are you sure you want to delete user " + username + "?");
        setShowDeleteUserConfirm(true);
    };

    const handleDeleteClick = () => {
        const user = userRows.filter((user) => user.username === deleteUsername).reduce((acc, item) => acc);
        setDeleteUsername("");
        setDeleteUserConfirmMsg("");
        setShowDeleteUserConfirm(false);
        dispatch(deleteUser({user}));
    };

    const handleAddNewUser = () => {
        setSelectedUser(User());
        setIsEditingUser(true);
    };

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSaveStatusMsg("");
        setShowSaveStatus(false);
    };

    const statusUpdate = () => {
       return ( <Snackbar
            open={showSaveStatus}
            autoHideDuration={5000}
            anchorOrigin={{ vertical: 'top', horizontal : "center" }}
        >
            <Alert
                onClose={handleCloseSaveAlert}
                severity={saveStatusSeverity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {saveStatusMsg}
            </Alert>
        </Snackbar>
       );
    }

    useEffect(() => {
        if(isI2b2LibLoaded && !isEditingUser) {
            dispatch(getAllUsers({}));
        }
    }, [isI2b2LibLoaded, isEditingUser]);

    useEffect(() => {

        if(allUsers.users) {
            setUserRows(allUsers.users);
        }
    }, [allUsers]);



    useEffect(() => {
        if(deletedUser.status === "SUCCESS") {
            dispatch(deleteUserStatusConfirmed());
            setSaveStatusMsg("Deleted user " + deletedUser.user.username);
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");

            let filteredRows = userRows.filter((row) => row.username !== deletedUser.user.username);
            setUserRows(filteredRows);
        }

        if(deletedUser.status === "FAIL") {
            dispatch(deleteUserStatusConfirmed());
            setSaveStatusMsg("Error: There was an error deleting user " + deletedUser.user.username);
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
    }, [deletedUser]);

    return (
        <div className="AllUsers">
            { allUsers.isFetching && <Loader/>}
            {!isEditingUser &&
                <Button className="AddUser" size="small" variant="contained" startIcon={<AddIcon/>} onClick={handleAddNewUser}>
                    Add New User
                </Button>
            }
            {!isEditingUser && allUsers.users.length > 0 && displayUsersTable()}
            { isEditingUser && <EditUserDetails user={selectedUser} setIsEditingUser={setIsEditingUser}/>}
            {!isEditingUser && statusUpdate()}

            { showDeleteUserConfirm && <Confirmation
                text={deleteUserConfirmMsg}
                onOk={handleDeleteClick}
                onCancel={() => setShowDeleteUserConfirm(false)}
            />}
        </div>
    );
};

AllUsers.propTypes = {};

