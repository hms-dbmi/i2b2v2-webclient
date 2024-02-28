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
    const dispatch = useDispatch();

    const saveParam = (param) => {
        dispatch(saveUserParam({user: selectedUser.user, param}));
    };

    const handleDeleteClick = (param)  => {
        dispatch(deleteUserParam({param}));
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
            />
        </div>
    );

};

EditUserParameters.propTypes = {};
