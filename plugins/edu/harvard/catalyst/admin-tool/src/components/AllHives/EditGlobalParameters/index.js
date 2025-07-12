import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import {
    saveGlobalParam,
    saveGlobalParamStatusConfirmed,
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
    const [allParamStatus, setAllParamStatus] = useState("");

    const dispatch = useDispatch();

    const saveParam = (param) => {
        if(param && param.name.length > 0) {
            dispatch(saveGlobalParam({param}));
        }
    };

    const saveStatusConfirm = () =>{
        dispatch(saveGlobalParamStatusConfirmed());
    }

    useEffect(() => {
        if(allHives.paramStatus.status === "SAVE_SUCCESS"){
            setSaveStatus(allHives.paramStatus);
        }
        if(allHives.paramStatus.status === "SAVE_FAIL"){
            setSaveStatus(allHives.paramStatus);
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
                saveStatus={saveStatus}
                allParamStatus={allParamStatus}
                saveStatusConfirm={saveStatusConfirm}
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );

};

EditGlobalParameters.propTypes = {};
