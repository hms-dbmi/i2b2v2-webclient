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
    const ONT_PREDEFINED_PARAMS = [
        {
            label: "UI Options Ont Disable Modifiers",
            dataType: "B",
            description: "Whether to disable modifiers in ontology"
        },
        {
            label: "UI Options Ont Enable Patient Counts",
            dataType: "B",
            defaultValue: "true",
            description: "Whether to enable patient counts in the ontology"
        },
        {
            label: "UI Options Ont Show Synonymous Terms",
            dataType: "T",
            description: "Whether to enable patient counts in the ontology"
        },
        {
            label: "UI Options Ont Show Hidden Terms",
            dataType: "B",
            description: "Whether to show hidden terms in the ontology"
        },
        {
            label: "UI Options Ont Show Concept Codes in Tooltips",
            dataType: "B",
            description: "Whether to show concept codes in tooltips in the ontology"
        },
        {
            label: "UI Options Ont Use Short Tooltips",
            dataType: "B",
            description: "Whether to use short tooltips in the ontology"
        },
        {
            label: "UI Options Ont Disable Optimized Search",
            dataType: "B",
            description: "Whether to disable optimized search in the ontology"
        },
        {
            label: "UI Options Ont Max Number of Children to Display",
            dataType: "N",
            defaultValue: "200",
            description: "The maximum number of children to display in the ontology"
        }
    ]

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
        let updatedPredefParams = ONT_PREDEFINED_PARAMS;
        if(allGlobalParams && allGlobalParams.length > 0){
            const projPredefinedParamsJson = allGlobalParams.find(g => g.name === "Predefined Project Params");
            if(projPredefinedParamsJson) {
                const projPredefinedParams = JSON.parse(projPredefinedParamsJson.value);

                projPredefinedParams.forEach(param => {
                    param.dataType= DataType[param.dataType];
                    updatedPredefParams.push(param);
                });
            }
        }
        setPredefinedParams(updatedPredefParams);

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
