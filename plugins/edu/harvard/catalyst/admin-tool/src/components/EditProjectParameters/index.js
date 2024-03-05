import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import "./EditProjectParameters.scss";
import {saveProjectStatusConfirmed} from "../../actions";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";
import Typography from "@mui/material/Typography";

export const EditProjectParameters = ({selectedProject, params, title, doSave, setSaveCompleted}) => {
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);

    useEffect(() => {
        if(doSave){
            setSaveCompleted(true);
        }
    }, [doSave]);

    return (
        <div className="EditProjectParameters" >
            <Typography> {selectedProject.project.name + " - Parameters"} </Typography>

            <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );

};

EditProjectParameters.propTypes = {};