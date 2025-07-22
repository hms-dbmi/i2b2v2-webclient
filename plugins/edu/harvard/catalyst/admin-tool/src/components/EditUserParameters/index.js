import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import {
    saveUserParam, saveUserParamStatusConfirmed,
    getAllUserParamsStatusConfirmed,
} from "../../actions";
import {EditParameters} from "../EditParameters";

import "./EditUserParameters.scss";

export const EditUserParameters = ({selectedUser,
                                   updatedParams,
                                   updateParams,
                                   title,
                                   paginationModel,
                                   setPaginationModel
}) => {
    const [saveStatus, setSaveStatus] = useState("");

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
            />
        </div>
    );

};

EditUserParameters.propTypes = {};
