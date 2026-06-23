import {useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import {EditParameters} from "../EditParameters";

import "./EditUserParameters.scss";
import {DataType, ParamStatus} from "../../models";
import {getAllGlobalParams} from "../../reducers/allHivesSlice";
import {
    getAllUserParamsStatusConfirmed,
    saveUserParam,
    saveUserParamStatusConfirmed
} from "../../reducers/editUserInfoSlice";

export const EditUserParameters = ({selectedUser,
                                   updatedParams,
                                   updateParams,
                                   title,
                                   paginationModel,
                                   setPaginationModel,
                                   showDeletedParams,
                                   setShowDeletedParams
}) => {
    const allGlobalParams = useSelector((state) => state.allHives?.params );
    const [saveStatus, setSaveStatus] = useState("");
    const [predefinedParams, setPredefinedParams] = useState([]);

    const dispatch = useDispatch();

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveUserParam({user: selectedUser.user, param}));
        }
    };

    const saveStatusConfirm = () =>{
        dispatch(saveUserParamStatusConfirmed());
    }

    const allParamsStatusConfirm = () =>{
        dispatch(getAllUserParamsStatusConfirmed());
    }

    useEffect(() => {
        if(selectedUser.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedUser.paramStatus);
        }
        if(selectedUser.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedUser.paramStatus);
        }

    }, [selectedUser]);

    useEffect(() => {
        dispatch(getAllGlobalParams());
    }, []);

    useEffect(() => {
       if(allGlobalParams && allGlobalParams.length > 0){
           let mappedUserDefParamsList = [];

           const userPredefinedParamsJsonList = allGlobalParams.filter(g => g.name === "Predefined User Params" && g.status === ParamStatus.A);

           userPredefinedParamsJsonList.forEach(userPredefinedParamsJson => {
                try {
                    const userPredefinedParams = JSON.parse(userPredefinedParamsJson.value);
                    userPredefinedParams.forEach(param => {
                        param.dataType = DataType[param.dataType];
                        mappedUserDefParamsList.push(param);
                    });
                }catch(e){
                    console.error("Error parsing User Predefined Params: ", userPredefinedParamsJson.value);
                }
           });

           setPredefinedParams(mappedUserDefParamsList);
       }
    }, [allGlobalParams]);

    return (
        <div className="EditUserParameters" >
            <EditParameters
                rows={updatedParams}
                updateParams={updateParams}
                title={title}
                saveParam={saveParam}
                saveStatus={saveStatus}
                allParamStatus={selectedUser.allUserParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
                predefinedParams={predefinedParams}
                paramTableName={"PM_USER_PARAMS"}
                showDeletedParams = {showDeletedParams}
                setShowDeletedParams = {setShowDeletedParams}
            />
        </div>
    );

};

EditUserParameters.propTypes = {};
