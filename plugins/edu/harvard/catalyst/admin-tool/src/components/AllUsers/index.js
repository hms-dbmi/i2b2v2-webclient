import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { getAllUsers } from "actions";
import {EditUserDetails} from "components";
import { User} from "../../models";
import {
    DataGrid,
    GridActionsCellItem,
    gridClasses
} from '@mui/x-data-grid';
import { Loader } from "components";
import "./AllUsers.scss";


export const AllUsers = () => {
    const allUsers = useSelector((state) => state.allUsers );
    const isI2b2LibLoaded = useSelector((state) => state.isI2b2LibLoaded );
    const dispatch = useDispatch();
    const[selectedUser, setSelectedUser] = useState(null);
    const[isEditingUser, setIsEditingUser] = useState(false);

    const handleEditClick = (username) => () => {
        let user = allUsers.users.filter((user) => user.username === username);
        if(user.length === 1) {
            setSelectedUser(user[0]);
            setIsEditingUser(true);
            console.log("selected user in handle edit user[0]" + user[0]);
        }
    };

    const handleDeleteClick = (id) => () => {
    };

    const getRowId = (row) =>{
        return row.username;
    }
    const columns = [
        { field: 'fullname',
            headerName: 'Full Name',
            flex: 2,
        },
        {
            field: 'username',
            headerName: 'User Name',
            flex: 2,
            editable: false,
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
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];


    const displayUsersTable = () => {
        return (
            <DataGrid
                rows={allUsers.users}
                columns={columns}
                getRowId={getRowId}
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

    const handleAddNewUser = () => {
        setSelectedUser(User());
        setIsEditingUser(true);
    };

    useEffect(() => {
        if(isI2b2LibLoaded && !isEditingUser) {
            dispatch(getAllUsers({}));
        }
    }, [isI2b2LibLoaded, isEditingUser]);

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
        </div>
    );
};

AllUsers.propTypes = {};

