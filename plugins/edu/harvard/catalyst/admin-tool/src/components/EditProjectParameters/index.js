import React, { useState, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    saveProjectParam, saveProjectParamStatusConfirmed,
    getAllProjectParamsStatusConfirmed,
} from "../../actions";
import {EditParameters} from "../EditParameters";
import "./EditProjectParameters.scss";
import {DataType} from "models";
import {getAllGlobalParams} from "../../reducers/allHivesSlice";

export const EditProjectParameters = ({selectedProject,
                                          updatedParams,
                                          updateParams,
                                          projectParamStatus,
                                          doSave,
                                          setSaveCompleted,
                                          paginationModel,
                                          setPaginationModel
                                         }) => {
    const allGlobalParams = useSelector((state) => state.allHives?.params );
    const [saveStatus, setSaveStatus] = useState("");
    const [predefinedParams, setPredefinedParams] = useState([]);

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


    useEffect(() => {
        dispatch(getAllGlobalParams());
    }, []);

    useEffect(() => {
        if(allGlobalParams && allGlobalParams.length > 0){
            const userPredefinedParamsJson = allGlobalParams.find(g => g.name === "Predefined Project Params");
            if(userPredefinedParamsJson) {
                const userPredefinedParams = JSON.parse(userPredefinedParamsJson.value);

                const mappedUserDefParams = userPredefinedParams.map(param => {
                    param.dataType= DataType[param.dataType];
                    return param;
                });

                setPredefinedParams(mappedUserDefParams);
            }
        }
    }, [allGlobalParams]);

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
