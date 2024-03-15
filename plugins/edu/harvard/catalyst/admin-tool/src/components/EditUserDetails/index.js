import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from '@mui/material/Link';
import { User } from "models";
import { UserInfo, EditUserParameters } from "components";

import "./EditUserDetails.scss";
import {
    getAllUserParams, saveUserStatusConfirmed,
} from "actions";
import {Tab, Tabs} from "@mui/material";


export const EditUserDetails = ({user, setIsEditingUser}) => {
    const selectedUser = useSelector((state) => state.selectedUser );
    const [updatedUser, setUpdatedUser] = useState(selectedUser.user);
    const [updatedParams, setUpdatedParams] = useState(selectedUser.params);

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

    useEffect(() => {
        if(user) {
            dispatch(getAllUserParams({user}));
        }
    }, [user]);

    useEffect(() => {
        setUpdatedUser(selectedUser.user);
        setUpdatedParams(selectedUser.params);
    }, [selectedUser]);

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
                <Tab value={EditDetails.PARAMS} label="Parameters(Optional)"  disabled={!selectedUser.user.username}/>
            </Tabs>
            {
            selectedTab === EditDetails.USERS &&
            !selectedUser.isFetching && <UserInfo
                selectedUser={selectedUser}
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
    );
};

EditUserDetails.propTypes = {
    user: PropTypes.shape(User).isRequired,
    setIsEditingUser: PropTypes.func.isRequired
};

