import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from '@mui/material/Link';
import { User } from "models";
import { UserInfo, EditUserParameters } from "components";

import "./EditUserDetails.scss";
import {
    clearSelectedUser,
    getAllUserParams,
} from "actions";
import {Tab, Tabs} from "@mui/material";


export const EditUserDetails = ({user, setIsEditingUser, setIsCreatingUser, isCreatingUser}) => {
    const selectedUser = useSelector((state) => state.selectedUser );
    const [updatedUser, setUpdatedUser] = useState(selectedUser.user);
    const [updatedParams, setUpdatedParams] = useState(selectedUser.params);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0});

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
        setIsCreatingUser(false);
    }

    useEffect(() => {
        if(user.username) {
            dispatch(getAllUserParams({user}));
        }else{
            dispatch(clearSelectedUser());
        }
    }, [user]);

    useEffect(() => {
        setUpdatedUser(selectedUser.user);
        setUpdatedParams(selectedUser.params);
    }, [selectedUser.user, selectedUser.params]);

    return (
        <div className={"EditUserDetails"}>
            <Link  className="BackToUsers" component="button" onClick={cancelEdit}>back to All Users</Link>
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
            !selectedUser.isFetching && <UserInfo
                selectedUser={selectedUser}
                cancelEdit={cancelEdit}
                updateUser={setUpdatedUser}
                updatedUser={updatedUser}
                isNewUser={isCreatingUser}
            />
            }
            {
                selectedTab === EditDetails.PARAMS &&
                !selectedUser.isFetching
                && <EditUserParameters
                    selectedUser={selectedUser}
                    updatedParams={updatedParams}
                    updateParams={setUpdatedParams}
                    paginationModel={paginationModel}
                    setPaginationModel={setPaginationModel}
                />
            }
       </div>
    );
};

EditUserDetails.propTypes = {
    user: PropTypes.shape(User).isRequired,
    setIsEditingUser: PropTypes.func.isRequired
};

