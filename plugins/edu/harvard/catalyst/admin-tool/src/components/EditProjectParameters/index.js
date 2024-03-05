import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {saveProjectStatusConfirmed} from "../../actions";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";
import {
    saveProjectParam, saveProjectParamStatusConfirmed,
    deleteProjectParam, deleteProjectParamStatusConfirmed,
    getAllProjectParamsStatusConfirmed
} from "../../actions";
import {EditParameters} from "../EditParameters";
import "./EditProjectParameters.scss";


export const EditProjectParameters = ({selectedProject, updatedParams, updateParams, doSave, setSaveCompleted}) => {
    const [saveStatus, setSaveStatus] = useState("");
    const [deleteStatus, setDeleteStatus] = useState("");
    const [projectParamStatus, setProjectParamStatus] = useState("");

    const dispatch = useDispatch();

    useEffect(() => {
        if(doSave){
            setSaveCompleted(true);
        }
    }, [doSave]);

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveProjectParam({project: selectedProject.project, param}));
        }
    };

    const handleDeleteClick = (param)  => {
        dispatch(deleteProjectParam({project: selectedProject.project, param}));
    };


    useEffect(() => {
        if(selectedProject.saveStatus === "SUCCESS"){
            dispatch(saveProjectParamStatusConfirmed());
            setSaveStatus("SUCCESS");
        }
        if(selectedProject.saveStatus === "FAIL"){
            dispatch(saveProjectParamStatusConfirmed());
            setSaveStatus("FAIL");
        }
        if(selectedProject.deleteStatus === "SUCCESS"){
            dispatch(deleteProjectParamStatusConfirmed());
            setDeleteStatus("SUCCESS")
        }
        if(selectedProject.deleteStatus === "FAIL"){
            dispatch(deleteProjectParamStatusConfirmed());
            setDeleteStatus("FAIL")
        }

        if(selectedProject.allParamStatus === "FAIL"){
            dispatch(getAllProjectParamsStatusConfirmed());
            setProjectParamStatus("FAIL");
        }

    }, [selectedProject]);


    return (
        <div className="EditProjectParameters" >
            <EditParameters
                rows={updatedParams}
                updateParams={updateParams}
                title={selectedProject.project.name + " - Parameters"}
                saveParam={saveParam}
                deleteParam={handleDeleteClick}
                saveStatus={saveStatus}
                deleteStatus={deleteStatus}
                allParamStatus={projectParamStatus}
            />
        </div>
    );

};

EditProjectParameters.propTypes = {};
