import {useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
    saveGlobalParam,
    saveGlobalParamStatusConfirmed
} from "../../../reducers/allHivesSlice";

import {EditParameters} from "../../EditParameters";
import {AuthenticationConfigModal} from "./AuthenticationConfigModal";
import "./EditGlobalParameters.scss";
import {DataType, ParamStatus} from "models";

export const EditGlobalParameters = ({allHives,
                                     updatedParams,
                                     updateParams,
                                     paginationModel,
                                     setPaginationModel,
}) => {
    const allGlobalParams = useSelector((state) => state.allHives?.params );
    const [predefinedParams, setPredefinedParams] = useState([]);
    const [saveStatus, setSaveStatus] = useState("");
    const [showAuthConfig, setShowAuthConfig] = useState(false);
    const [showDeletedParams, setShowDeletedParams] = useState(false);
    const GLOBAL_PREDEFINED_PARAMS = [
        {
            label: "Predefined Global Params",
            dataType: "T",
            description: "A JSON formatted string defining available global parameter names"
        },
        {
            label: "Predefined Project Params",
            dataType: "T",
            description: "A JSON formatted string defining available project parameter names"
        },
        {
            label: "Predefined User Params",
            dataType: "T",
            description: "A JSON formatted string defining available user parameter names"
        },
    ]
    const dispatch = useDispatch();

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveGlobalParam({param}));
        }
    };

    const saveStatusConfirm = () =>{
        dispatch(saveGlobalParamStatusConfirmed());
    }

    const onClose = () => {
        setShowAuthConfig(false);
    };

    useEffect(() => {
        if(allHives.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(allHives.paramStatus);
        }
        if(allHives.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(allHives.paramStatus);
        }

    }, [allHives]);


    useEffect(() => {
        let mappedGlobalDefParamsList = GLOBAL_PREDEFINED_PARAMS;

        if(allGlobalParams && allGlobalParams.length > 0){
            const globalPredefinedParamsJsonList = allGlobalParams.filter(g => g.name === "Predefined Global Params" && g.status === ParamStatus.A);
            globalPredefinedParamsJsonList.forEach(globalPredefinedParamsJson => {
                try {
                    const globalPredefinedParams = JSON.parse(globalPredefinedParamsJson.value);
                    globalPredefinedParams.forEach(param => {
                        param.dataType = DataType[param.dataType];
                        mappedGlobalDefParamsList.push(param);
                    });
                }catch(e){
                    console.error("Error parsing Global Predefined Params ", globalPredefinedParamsJson.value);
                }
            });

            setPredefinedParams(mappedGlobalDefParamsList);
        }
    }, [allGlobalParams]);

    const authTemplateActions = ["Define Auth Template"];
    const handleConfigureAuth = (actionName) => {
        if(actionName === authTemplateActions[0]) {
            setShowAuthConfig(true);
        }
    }
    return (
        <div className="EditGlobalParameters" >
            <EditParameters
                rows={updatedParams}
                updateParams={updateParams}
                saveParam={saveParam}
                saveStatus={saveStatus}
                allParamStatus={allHives.allGlobalParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
                customActions={authTemplateActions}
                customActionsHandler={handleConfigureAuth}
                customActionsBtnOption={{startIcon: <AddIcon />}}
                predefinedParams={predefinedParams}
                paramTableName={"PM_GLOBAL_PARAMS"}
                showDeletedParams = {showDeletedParams}
                setShowDeletedParams = {setShowDeletedParams}
            />
            {showAuthConfig && <AuthenticationConfigModal onOk={onClose} onCancel={onClose}/>}
        </div>
    );
};

EditGlobalParameters.propTypes = {};
