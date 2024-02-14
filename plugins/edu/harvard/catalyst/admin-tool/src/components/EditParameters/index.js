import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { DataType } from "models";
import "./EditParameters.scss";
import {DataGrid, GridActionsCellItem, gridClasses} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";

export const EditParameters = ({params, title, updateParams}) => {

    const handleEditClick = (username) => () => {
    };

    const handleDeleteClick = (id) => () => {
    };

    const handleDataTypeChange = (dataType) => () => {
    };
    const getRowId = (row) =>{
        return row.id;
    }
    const columns = [
        { field: 'name',
            headerName: 'Name',
            flex: 2,
            editable: true,
        },
        {
            field: 'value',
            headerName: 'Value',
            flex: 2,
            editable: true,
        },
        {
            field: 'dataType',
            headerName: 'Data Type',
            flex: 1,
            editable: true,
            filterable: false,
            renderCell: (item) => {
                console.log("item row is: " + JSON.stringify(item.row));
                return (
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={DataType[item.row.dataType].value}
                    label="DataType"
                    onChange={handleDataTypeChange}
                >
                    <MenuItem value={"T"}>Text</MenuItem>
                    <MenuItem value={"N"}>Numeric</MenuItem>
                    <MenuItem value={"D"}>Date</MenuItem>
                    <MenuItem value={"I"}>Integer</MenuItem>
                    <MenuItem value={"B"}>Boolean</MenuItem>
                    <MenuItem value={"C"}>Reference Binary</MenuItem>
                    <MenuItem value={"RTF"}>RTF</MenuItem>
                    <MenuItem value={"DOC"}>Word</MenuItem>
                    <MenuItem value={"XLS"}>Excel</MenuItem>
                    <MenuItem value={"XML"}>XML</MenuItem>
                </Select>
            )}
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            cellClassName: 'actions',
            getActions: ({id}) => {

                if(id === "AGG_SERVICE_ACCOUNT"){
                    return [];
                }

                return [
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];


    const displayParamsTable = () => {
        return (
            <DataGrid
                rows={params}
                columns={columns}
                getRowId={getRowId}
                disableRowSelectionOnClick
                sx={{
                    [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                        outline: 'none',
                    },
                    [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                        {
                            outline: 'none',
                        },
                }}
            />
        );
    };

    useEffect(() => {
    }, []);

    return (
        <div className="EditParameters" >
            <h3> {title} </h3>
            {displayParamsTable()}
        </div>
    );
};

EditParameters.propTypes = {};

