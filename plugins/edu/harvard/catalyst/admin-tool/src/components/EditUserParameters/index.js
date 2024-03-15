import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    saveUserParam, saveUserParamStatusConfirmed,
    deleteUserParam, deleteUserParamStatusConfirmed,
} from "../../actions";

import "./EditUserParameters.scss";
import {EditParameters} from "../EditParameters";

export const EditUserParameters = ({selectedUser, updatedParams, updateParams, title}) => {
    const [saveStatus, setSaveStatus] = useState("");
    const [deleteStatus, setDeleteStatus] = useState("");
    const [userParamStatus, setUserParamStatus] = useState("");

    const dispatch = useDispatch();

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveUserParam({user: selectedUser.user, param}));
        }
    };

    const handleDeleteClick = (param)  => {
        dispatch(deleteUserParam({user: selectedUser.user, param}));
    };


    useEffect(() => {
        if(selectedUser.saveStatus === "SUCCESS"){
            dispatch(saveUserParamStatusConfirmed());
            setSaveStatus("SUCCESS");
        }
        if(selectedUser.saveStatus === "FAIL"){
            dispatch(saveUserParamStatusConfirmed());
            setSaveStatus("FAIL");
        }
        if(selectedUser.deleteStatus === "SUCCESS"){
            dispatch(deleteUserParamStatusConfirmed());
            setDeleteStatus("SUCCESS")
        }
        if(selectedUser.deleteStatus === "FAIL"){
            dispatch(deleteUserParamStatusConfirmed());
            setDeleteStatus("FAIL")
        }

        if(selectedUser.userParamStatus === "FAIL"){
            dispatch(allUserParamStatusConfirmed());
            setUserParamStatus("FAIL");
        }

    }, [selectedUser]);


    return (
        <div className="EditUserParameters" >
            <EditParameters
                rows={updatedParams}
                updateParams={updateParams}
                title={title}
                saveParam={saveParam}
                deleteParam={handleDeleteClick}
                saveStatus={saveStatus}
                deleteStatus={deleteStatus}
                allParamStatus={userParamStatus}
            />
        </div>
    );

};

EditUserParameters.propTypes = {};
