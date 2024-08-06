import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {AllProjectsTable} from "./AllProjectsTable";

export const AllProjects = () => {
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0});

    useEffect(() => {
        console.log("all projects update");
    }, []);

    return (
        <div className="AllProject">
            <AllProjectsTable
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );
};

AllProjects.propTypes = {};

