import {useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import {
    saveUserParam, saveUserParamStatusConfirmed,
    getAllUserParamsStatusConfirmed,
} from "../../actions";
import {EditParameters} from "../EditParameters";

import "./EditUserParameters.scss";
import {DataType} from "../../models";
import {getAllGlobalParams} from "../../reducers/allHivesSlice";

export const EditUserParameters = ({selectedUser,
                                   updatedParams,
                                   updateParams,
                                   title,
                                   paginationModel,
                                   setPaginationModel
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
           const userPredefinedParamsJson = allGlobalParams.find(g => g.name === "Predefined User Params");
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
            />
        </div>
    );

};

EditUserParameters.propTypes = {};
