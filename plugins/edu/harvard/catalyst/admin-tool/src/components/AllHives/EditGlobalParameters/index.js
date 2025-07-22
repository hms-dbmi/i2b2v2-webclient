import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import {
    saveGlobalParam,
    saveGlobalParamStatusConfirmed,
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

    }, [allHives]);


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
            />
        </div>
    );

};

EditGlobalParameters.propTypes = {};
