import React, { useState } from "react";
import {AllUsersTable} from "./AllUsersTable";


export const AllUsers = () => {
    const [paginationModel, setPaginationModel] = useState({ pageSize: 25, page: 0});

    return (
        <div className="AllUsers">
            <AllUsersTable
                paginationModel={paginationModel}
                setPaginationModel={setPaginationModel}
            />
        </div>
    );
};

AllUsers.propTypes = {};

