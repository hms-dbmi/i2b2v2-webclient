import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
    saveGlobalParam, saveGlobalParamStatusConfirmed,
    deleteGlobalParam, deleteGlobalParamStatusConfirmed,
    getAllGlobalParamsStatusConfirmed
} from "actions";
import {EditParameters} from "../../EditParameters";
import "./EditGlobalParameters.scss";

export const EditGlobalParameters = ({allHives, updatedParams, updateParams, title}) => {
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


    useEffect(() => {
        if(allHives.saveParamStatus === "SUCCESS"){
            dispatch(saveGlobalParamStatusConfirmed());
            setSaveStatus("SUCCESS");
        }
        if(allHives.saveParamStatus === "FAIL"){
            dispatch(saveGlobalParamStatusConfirmed());
            setSaveStatus("FAIL");
        }

        if(allHives.deleteParamStatus === "SUCCESS"){
            dispatch(deleteGlobalParamStatusConfirmed());
            setDeleteStatus("SUCCESS")
        }
        if(allHives.deleteParamStatus === "FAIL"){
            dispatch(deleteGlobalParamStatusConfirmed());
            setDeleteStatus("FAIL")
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
                title={title}
                saveParam={saveParam}
                deleteParam={handleDeleteClick}
                saveStatus={saveStatus}
                deleteStatus={deleteStatus}
                allParamStatus={allParamStatus}
            />
        </div>
    );

};

EditGlobalParameters.propTypes = {};
