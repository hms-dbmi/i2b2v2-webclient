import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    saveProjectParam, saveProjectParamStatusConfirmed,
    getAllProjectParamsStatusConfirmed,
} from "../../actions";
import {EditParameters} from "../EditParameters";
import "./EditProjectParameters.scss";
import {DataType} from "models";


export const EditProjectParameters = ({selectedProject,
                                          updatedParams,
                                          updateParams,
                                          projectParamStatus,
                                          doSave,
                                          setSaveCompleted,
                                          paginationModel,
                                          setPaginationModel
                                         }) => {
    const [saveStatus, setSaveStatus] = useState("");
    const predefinedParams = [
        { label: 'Announcement', type: DataType.T },
        { label: 'Data Request Email Address', type: DataType.T },
        { label: "Data Request Template", type: DataType.T},
        { label: "Data Request Letter", type: DataType.T},
        { label: "Data Request Subject", type: DataType.T}
    ];

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

    const saveStatusConfirm = () =>{
        dispatch(saveProjectParamStatusConfirmed());
    }

    const allParamsStatusConfirm = () =>{
        dispatch(getAllProjectParamsStatusConfirmed());
    }

    useEffect(() => {
        if(selectedProject.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedProject.paramStatus);
        }
        if(selectedProject.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedProject.paramStatus);
        }

    }, [selectedProject]);


    return (
        <div className="EditProjectParameters" >
            <EditParameters
                rows={updatedParams}
                updateParams={updateParams}
                title={selectedProject.project.name + " - Parameters"}
                saveParam={saveParam}
                saveStatus={saveStatus}
                allParamStatus={projectParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
                predefinedParams={predefinedParams}
            />
        </div>
    );

};

EditProjectParameters.propTypes = {};
