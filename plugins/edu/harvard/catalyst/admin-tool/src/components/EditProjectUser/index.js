import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { User } from "models";
import { ProjectUserInfo, EditUserParameters } from "components";
import {
    getAllProjectUserParams, saveProjectUserStatusConfirmed,
} from "actions";
import {Tab, Tabs} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from '@mui/material/DialogTitle';
import Button from "@mui/material/Button";
import "./EditProjectUser.scss";


export const EditProjectUser = ({project, user,  setIsEditingUser}) => {
    const selectedUser = useSelector((state) => state.selectedUser );
    const [updatedUser, setUpdatedUser] = useState(user);
    const [updatedParams, setUpdatedParams] = useState(selectedUser.params);
    const [open, setOpen] = useState(true);

    const dispatch = useDispatch();
    const EditDetails = {
        USERS: "USERS",
        PARAMS: "PARAMS",
    };
    const [selectedTab, setSelectedTab] = useState(EditDetails.USERS);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const cancelEdit = () => {
        setIsEditingUser(false);
    }

    const onCancel = () => {
        setOpen(false);
        setIsEditingUser(false);
    };

    const onOk = () => {
        setOpen(false);
        setIsEditingUser(false);
    };

    useEffect(() => {
        if(user) {
            dispatch(getAllProjectUserParams({user, project}));
        }
    }, [user]);


    useEffect(() => {
        setUpdatedUser(selectedUser.user);
        setUpdatedParams(selectedUser.params);

    }, [selectedUser]);

    return (
        <Dialog
            className={"EditProjectUser"}
            fullWidth={true}
            maxWidth={"md"}
            open={open}
            onClose={onCancel}
            aria-labelledby="alert-dialog-description"
        >
            <DialogTitle>Edit details for user {user.username}</DialogTitle>
            <DialogContent>
                <div className={"EditProjectUserDetails"}>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
                        aria-label="admin tool navigation"
                        className="BackToUsers"
                        variant="fullWidth"
                        centered
                    >
                        <Tab value={EditDetails.USERS} label="User"/>
                        <Tab value={EditDetails.PARAMS} label="Parameters (Optional)"  disabled={!selectedUser.user.username}/>
                    </Tabs>
                    {
                        selectedTab === EditDetails.USERS &&
                        !selectedUser.isFetching &&
                        <ProjectUserInfo
                            selectedUser={selectedUser}
                            selectedProject={project}
                            cancelEdit={cancelEdit}
                            updateUser={setUpdatedUser}
                            updatedUser={updatedUser}
                        />
                    }
                    {
                        selectedTab === EditDetails.PARAMS &&
                        !selectedUser.isFetching
                        && <EditUserParameters selectedUser={selectedUser} updatedParams={updatedParams} updateParams={setUpdatedParams}/>
                    }
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onOk} color="primary">
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
};

EditProjectUser.propTypes = {
    user: PropTypes.shape(User).isRequired,
    setIsEditingUser: PropTypes.func.isRequired
};

