import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    saveProjectUserParam, saveProjectUserParamStatusConfirmed,
    deleteProjectUserParam, deleteProjectUserParamStatusConfirmed,
    getAllProjectUserParamsStatusConfirmed,
} from "../../actions";
import {EditParameters} from "../EditParameters";
import "./EditProjectUserParameters.scss";

export const EditProjectUserParameters = ({selectedProject, projectUser, updatedParams, updateParams, title}) => {
    const [saveStatus, setSaveStatus] = useState("");
    const [deleteStatus, setDeleteStatus] = useState("");
    const [userParamStatus, setUserParamStatus] = useState("");

    const dispatch = useDispatch();

    const handleDeleteClick = (param)  => {
        dispatch(deleteProjectUserParam({selectedProject, projectUser, param}));
    };

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveProjectUserParam({project: selectedProject, projectUser, param}));
        }
    };

    const saveStatusConfirm = () =>{
        dispatch(saveProjectUserParamStatusConfirmed());
    }

    const deleteStatusConfirm = () =>{
        dispatch(deleteProjectUserParamStatusConfirmed());
    }

    useEffect(() => {
        if(selectedProject.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedProject.paramStatus);
        }

        if(selectedProject.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedProject.paramStatus);
        }

        if(selectedProject.paramStatus.status === "DELETE_SUCCESS"){
            setDeleteStatus(selectedProject.paramStatus);
        }

        if(selectedProject.paramStatus.status === "DELETE_FAIL"){
            setDeleteStatus(selectedProject.paramStatus);
        }

        if(selectedProject.userParamStatus === "FAIL"){
            setUserParamStatus("FAIL");
        }
    }, [selectedProject]);


    return (
        <div className="EditProjectUserParameters" >
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

EditProjectUserParameters.propTypes = {};
