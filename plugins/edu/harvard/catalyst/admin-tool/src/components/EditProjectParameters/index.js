import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    saveProjectParam, saveProjectParamStatusConfirmed,
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

    const saveStatusConfirm = () =>{
        dispatch(saveProjectParamStatusConfirmed());
    }


    useEffect(() => {
        if(selectedProject.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedProject.paramStatus);
        }
        if(selectedProject.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedProject.paramStatus);
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
                saveStatus={saveStatus}
                allParamStatus={projectParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );

};

EditProjectParameters.propTypes = {};
