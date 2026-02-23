import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import {EditUserDetails} from "components";
import { User} from "../../models";
import { DataGrid, GridActionsCellItem, gridClasses, useGridApiRef} from '@mui/x-data-grid';
import { Loader } from "components";
import {getAllUsers} from "../../reducers/allUsersSlice.js";
import "./AllUsersTable.scss";
import {Tooltip} from "@mui/material";


export const AllUsersTable = ({paginationModel,
                               setPaginationModel
}) => {
    const allUsers = useSelector((state) => state.allUsers );
    const isI2b2LibLoaded = useSelector((state) => state.isI2b2LibLoaded );
    const [userRows, setUserRows] = useState(allUsers.users);
    const[selectedUser, setSelectedUser] = useState(null);
    const[isEditingUser, setIsEditingUser] = useState(false);
    const[isCreatingUser, setIsCreatingUser] = useState(false);
    const apiRef = useGridApiRef();

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
            valueGetter: (param) => {
                return param.value ? param.value : "";
            }
        },
        {
            field: 'session',
            headerName: 'Session',
            flex: 1,
            editable: false,
            valueGetter: (param) => {
                let sessionItems = [];
                if(param.value.isLockedOut){
                    sessionItems.push("Locked")
                }

                if(param.value.isActive){
                    sessionItems.push("Active");
                }

                return sessionItems.join(", ");
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            cellClassName: 'actions',
            getActions: ({id, row}) => {

                if(id === "AGG_SERVICE_ACCOUNT"){
                    return [];
                }

                let actions = [
                    <Tooltip title="Edit user">
                        <GridActionsCellItem
                            icon={<EditIcon/>}
                            label="Edit"
                            className="textPrimary"
                            onClick={handleEditClick(id)}
                            color="inherit"
                        />
                    </Tooltip>,
                    <Tooltip title="User details">
                        <GridActionsCellItem
                            icon={<InfoOutlinedIcon/>}
                            label="Details"
                            className="textPrimary"
                            color="inherit"
                        />
                    </Tooltip>
                ];

                if(row.session.isActive){
                    actions.push(
                    <Tooltip title="Terminate user session">
                            <GridActionsCellItem
                            icon={<LoginOutlinedIcon/>}
                            label="Terminate user session"
                            className="textPrimary"
                            color="inherit"
                        />
                    </Tooltip>);
                }
                return actions;
            },
        },
    ];


    const displayUsersTable = () => {
        return (
            <DataGrid
                rows={userRows}
                columns={columns}
                apiRef={apiRef}
                getRowId={getRowId}
                disableRowSelectionOnClick
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onSortModelChange={(model) => {
                    apiRef.current.setPage(0);
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


    const handleAddNewUser = () => {
        setSelectedUser(User());
        setIsCreatingUser(true);
    };


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

    return (
        <div className="AllUsers">
            { allUsers.isFetching && <Loader/>}
            {!isEditingUser &&
                <Button className="AddUser" size="small" variant="contained" startIcon={<AddIcon/>} onClick={handleAddNewUser}>
                    Add New User
                </Button>
            }
            {!isEditingUser && !isCreatingUser && allUsers.users.length > 0 && displayUsersTable()}
            { (isEditingUser || isCreatingUser) && <EditUserDetails user={selectedUser} setIsEditingUser={setIsEditingUser}  setIsCreatingUser={setIsCreatingUser} isCreatingUser={isCreatingUser}/>}
        </div>
    );
};

AllUsersTable.propTypes = {};

