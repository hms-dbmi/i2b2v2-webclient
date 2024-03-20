import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    saveUserParam, saveUserParamStatusConfirmed,
    deleteUserParam, deleteUserParamStatusConfirmed, getAllUserParamsStatusConfirmed, deleteGlobalParamStatusConfirmed,
} from "../../actions";
import {EditParameters} from "../EditParameters";

import "./EditUserParameters.scss";

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

    const saveStatusConfirm = () =>{
        dispatch(saveUserParamStatusConfirmed());
    }

    const deleteStatusConfirm = () =>{
        dispatch(deleteUserParamStatusConfirmed());
    }

    useEffect(() => {
        if(selectedUser.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedUser.paramStatus);
        }
        if(selectedUser.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedUser.paramStatus);
        }
        if(selectedUser.paramStatus.status === "DELETE_SUCCESS"){
            setDeleteStatus(selectedUser.paramStatus);
        }
        if(selectedUser.paramStatus.status === "DELETE_FAIL"){
            setDeleteStatus(selectedUser.paramStatus);
        }

        if(selectedUser.allUserParamStatus === "FAIL"){
            dispatch(getAllUserParamsStatusConfirmed());
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
                saveStatusConfirm={saveStatusConfirm}
                deleteStatusConfirm={deleteStatusConfirm}
            />
        </div>
    );

};

EditUserParameters.propTypes = {};
