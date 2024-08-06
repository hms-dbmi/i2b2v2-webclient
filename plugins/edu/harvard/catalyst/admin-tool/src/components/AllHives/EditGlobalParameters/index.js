import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    saveGlobalParam, saveGlobalParamStatusConfirmed,
    deleteGlobalParam, deleteGlobalParamStatusConfirmed,
    getAllGlobalParamsStatusConfirmed,
} from "actions";
import {EditParameters} from "../../EditParameters";
import "./EditGlobalParameters.scss";

export const EditGlobalParameters = ({allHives,
                                     updatedParams,
                                     updateParams,
                                     paginationModel,
                                     setPaginationModel
}) => {
    const [saveStatus, setSaveStatus] = useState("");
    const [deleteStatus, setDeleteStatus] = useState("");
    const [allParamStatus, setAllParamStatus] = useState("");

    const dispatch = useDispatch();

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveGlobalParam({param}));
        }
    };

    const handleDeleteClick = (param)  => {
        dispatch(deleteGlobalParam({param}));
    };

    const saveStatusConfirm = () =>{
        dispatch(saveGlobalParamStatusConfirmed());
    }

    const deleteStatusConfirm = () =>{
        dispatch(deleteGlobalParamStatusConfirmed());
    }
    useEffect(() => {
        if(allHives.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(allHives.paramStatus);
        }
        if(allHives.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(allHives.paramStatus);
        }

        if(allHives.paramStatus.status === "DELETE_SUCCESS"){
            setDeleteStatus(allHives.paramStatus);
        }
        if(allHives.paramStatus.status === "DELETE_FAIL"){
            setDeleteStatus(allHives.paramStatus);
        }

        if(allHives.allGlobalParamStatus === "FAIL"){
            dispatch(getAllGlobalParamsStatusConfirmed());
            setAllParamStatus("FAIL");
        }

    }, [allHives]);


    return (
        <div className="EditGlobalParameters" >
            <EditParameters
                rows={updatedParams}
                updateParams={updateParams}
                saveParam={saveParam}
                deleteParam={handleDeleteClick}
                saveStatus={saveStatus}
                deleteStatus={deleteStatus}
                allParamStatus={allParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                deleteStatusConfirm={deleteStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );

};

EditGlobalParameters.propTypes = {};
