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

    useEffect(() => {
        if(selectedProject.saveUserParamStatus.status === "SUCCESS"){
            dispatch(saveProjectUserParamStatusConfirmed());
            setSaveStatus("SUCCESS");
        }

        if(selectedProject.saveUserParamStatus.status === "FAIL"){
            dispatch(saveProjectUserParamStatusConfirmed());
            setSaveStatus("FAIL");
        }

        if(selectedProject.deleteUserParamStatus.status === "SUCCESS"){
            dispatch(deleteProjectUserParamStatusConfirmed());
            setDeleteStatus("SUCCESS")
        }

        if(selectedProject.deleteUserParamStatus.status === "FAIL"){
            dispatch(deleteProjectUserParamStatusConfirmed());
            setDeleteStatus("FAIL")
        }

        if(selectedProject.userParamStatus === "FAIL"){
            dispatch(getAllProjectUserParamsStatusConfirmed());
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
            />
        </div>
    );

};

EditProjectUserParameters.propTypes = {};
