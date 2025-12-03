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
import {DataType} from "models";

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
        if(allGlobalParams && allGlobalParams.length > 0){
            const userPredefinedParamsJson = allGlobalParams.find(g => g.name === "Predefined Global Params");
            if(userPredefinedParamsJson) {
                const globalPredefinedParams = JSON.parse(userPredefinedParamsJson.value);
                const mappedPredefParams = globalPredefinedParams.map(param => {
                    param.dataType= DataType[param.dataType];
                    return param;
                });

                setPredefinedParams(mappedPredefParams);
            }
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
            />
            {showAuthConfig && <AuthenticationConfigModal onOk={onClose} onCancel={onClose}/>}
        </div>
    );
};

EditGlobalParameters.propTypes = {};
