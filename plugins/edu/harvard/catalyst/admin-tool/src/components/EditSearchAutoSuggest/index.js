import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import Typography from "@mui/material/Typography";

export const EditSearchAutoSuggest = ({selectedProject}) => {

    return (
        <div className="EditSearchAutoSuggest" >
            <Typography> {selectedProject.project.name + " - Search/AutoSuggest"} </Typography>
        </div>
    );
}
