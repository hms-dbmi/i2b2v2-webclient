import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import {
    saveProjectParam, saveProjectParamStatusConfirmed,
    deleteProjectParam, deleteProjectParamStatusConfirmed,
    getAllProjectParamsStatusConfirmed
} from "../../actions";
import {EditParameters} from "../EditParameters";
import "./EditProjectParameters.scss";


export const EditProjectParameters = ({selectedProject,
                                          updatedParams,
                                          updateParams,
                                          doSave,
                                          setSaveCompleted,
                                          paginationModel,
                                          setPaginationModel
                                         }) => {
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

    const saveStatusConfirm = () =>{
        dispatch(saveProjectParamStatusConfirmed());
    }

    const deleteStatusConfirm = () =>{
        dispatch(deleteProjectParamStatusConfirmed());
    }

    useEffect(() => {
        if(selectedProject.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedProject.paramStatus);
        }
        if(selectedProject.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedProject.paramStatus);
        }
        if(selectedProject.paramStatus.status === "DELETE_SUCCESS"){
            setDeleteStatus(selectedProject.paramStatus)
        }
        if(selectedProject.paramStatus.status === "DELETE_FAIL"){
            setDeleteStatus(selectedProject.paramStatus)
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
                saveStatusConfirm={saveStatusConfirm}
                deleteStatusConfirm={deleteStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );

};

EditProjectParameters.propTypes = {};
