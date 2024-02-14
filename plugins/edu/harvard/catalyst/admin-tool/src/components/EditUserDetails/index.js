import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';

import { User } from "models";
import { Loader, UserInfo } from "components";

import "./EditUserDetails.scss";
import {getAllUserParams} from "actions";
import {EditParameters} from "../EditParameters";


export const EditUserDetails = ({user, setSelectedUser}) => {
    const selectedUser = useSelector((state) => state.selectedUser );
    const dispatch = useDispatch();
    const [updatedUser, setUpdatedUser] = useState(user);
    const [updatedParams, setUpdatedParams] = useState(selectedUser.params);

    useEffect(() => {
        dispatch(getAllUserParams({user}));
    }, []);


    const updateUser = (user) => {
        setUpdatedUser(user);
    };

    const updateProjects = (projects) => {
        setUpdatedUser(user);
    };

    return (
        <div className="EditUserDetails">
            <Link  component="button" onClick={() => setSelectedUser(null)}>back to All Users</Link>
            <Card className="EditUserContent" variant="outline">
                { selectedUser.isFetching && <Loader/>}
                { !selectedUser.isFetching && <UserInfo user={user} updateUser={updateUser}/>}
                { !selectedUser.isFetching && <EditParameters params={selectedUser.params} title="User Parameters(optional)" updateParams={setUpdatedParams}/>}
            </Card>
       </div>
    );
};

EditUserDetails.propTypes = {
    user: PropTypes.shape(User).isRequired,
    setSelectedUser: PropTypes.func.isRequired
};

