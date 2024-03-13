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
import {GridRowModes} from "@mui/x-data-grid";

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
        if(selectedProject.saveUserParamStatus.status === "SUCCESS"){
            setSaveStatus(selectedProject.saveUserParamStatus);
        }

        if(selectedProject.saveUserParamStatus.status === "FAIL"){
            setSaveStatus(selectedProject.saveUserParamStatus);
        }

        if(selectedProject.deleteUserParamStatus.status === "SUCCESS"){
            setDeleteStatus(selectedProject.deleteUserParamStatus);
        }

        if(selectedProject.deleteUserParamStatus.status === "FAIL"){
            setDeleteStatus(selectedProject.deleteUserParamStatus);
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
