import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Backdrop from '@mui/material/Backdrop';
import BottomNavigation from '@mui/material/BottomNavigation';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { User } from "models";
import { Loader, UserInfo } from "components";

import "./EditUserDetails.scss";
import {getAllUserParams, saveUserDetails, saveUserDetailsStatusConfirmed} from "actions";
import {EditParameters} from "../EditParameters";


export const EditUserDetails = ({user, setSelectedUser}) => {
    const selectedUser = useSelector((state) => state.selectedUser );
    const dispatch = useDispatch();
    const [updatedUser, setUpdatedUser] = useState(selectedUser);
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");

    const handleUpdateUser = (user) => {
        let modUser = updatedUser;
        updatedUser.user = user;
        setUpdatedUser(modUser);
    }

    const handleUpdateUserParams = (params) => {
        let modUser = updatedUser;
        updatedUser.params = params;
        setUpdatedUser(modUser);
    }
    const saveUserAndParams = (user) => {
        console.log("saving user and params " + JSON.stringify(updatedUser));
        setShowSaveBackdrop(true);
        dispatch(saveUserDetails({user: updatedUser}));
    };

    const cancelEdit = () => {
        setSelectedUser(null)
    }

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
    };

    useEffect(() => {
        dispatch(getAllUserParams({user}));
    }, []);

    useEffect(() => {
        if(selectedUser.saveStatus === "SUCCESS"){
            setShowSaveBackdrop(false);
            dispatch(saveUserDetailsStatusConfirmed({}));
            setSaveStatusMsg("Saved user details");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
        if(selectedUser.saveStatus === "FAIL"){
            setShowSaveBackdrop(false);
            dispatch(saveUserDetailsStatusConfirmed({}));
            setSaveStatusMsg("ERROR: failed to save user details");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }
       setUpdatedUser(selectedUser);
    }, [selectedUser]);

    return (
        <div className={"EditUserDetails"}>
            <Link  component="button" onClick={cancelEdit}>back to All Users</Link>
            <Card className="EditUserContent" variant="outline">
                { selectedUser.isFetching && <Loader/>}
                { !selectedUser.isFetching && <UserInfo user={user} updateUser={handleUpdateUser}/>}
                { !selectedUser.isFetching && <EditParameters params={selectedUser.params} title="User Parameters(optional)" updateParams={handleUpdateUserParams}/>}
            </Card>
            <BottomNavigation className={"EditUserActions"}>
                <div  className="EditUserActionSecondary">
                    <Button variant="outlined"> Cancel </Button>
                </div>
                <div className="EditUserActionPrimary">
                    <Button  variant="outlined" onClick={saveUserAndParams}> Save </Button>
                </div>
            </BottomNavigation>
            <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Snackbar
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
       </div>
    );
};

EditUserDetails.propTypes = {
    user: PropTypes.shape(User).isRequired,
    setSelectedUser: PropTypes.func.isRequired
};

