import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import {
    saveProjectUserParam,
    saveProjectUserParamStatusConfirmed,
} from "../../actions";
import {EditParameters} from "../EditParameters";
import "./EditProjectUserParameters.scss";

export const EditProjectUserParameters = ({selectedProject,
                                          projectUser,
                                          updatedParams,
                                          updateParams,
                                          title,
                                          paginationModel,
                                          setPaginationModel
}) => {
    const [saveStatus, setSaveStatus] = useState("");
    const [userParamStatus, setUserParamStatus] = useState("");

    const dispatch = useDispatch();

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveProjectUserParam({project: selectedProject, projectUser, param}));
        }
    };

    const saveStatusConfirm = () =>{
        dispatch(saveProjectUserParamStatusConfirmed());
    }


    useEffect(() => {
        if(selectedProject.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedProject.paramStatus);
        }

        if(selectedProject.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedProject.paramStatus);
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
                saveStatus={saveStatus}
                allParamStatus={userParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );

};

EditProjectUserParameters.propTypes = {};
