import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    saveUserParam, saveUserParamStatusConfirmed,
    deleteUserParam, deleteUserParamStatusConfirmed, getAllUserParamsStatusConfirmed, deleteGlobalParamStatusConfirmed,
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
    const [userParamStatus, setUserParamStatus] = useState("");

    const dispatch = useDispatch();

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveUserParam({user: selectedUser.user, param}));
        }
    };

    const saveStatusConfirm = () =>{
        dispatch(saveUserParamStatusConfirmed());
    }

    useEffect(() => {
        if(selectedUser.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(selectedUser.paramStatus);
        }
        if(selectedUser.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(selectedUser.paramStatus);
        }

        if(selectedUser.allUserParamStatus === "FAIL"){
            dispatch(getAllUserParamsStatusConfirmed());
            setUserParamStatus("FAIL");
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
                allParamStatus={userParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );

};

EditUserParameters.propTypes = {};
