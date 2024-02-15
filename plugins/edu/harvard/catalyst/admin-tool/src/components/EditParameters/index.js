import { useDispatch, useSelector} from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { DataType } from "models";
import "./EditParameters.scss";
import {DataGrid, GridActionsCellItem, gridClasses, GridRowModes} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import IconButton from '@mui/material/IconButton';

export const EditParameters = ({params, title, updateParams}) => {
    const [rows, setRows] = useState(params);
    const [rowModesModel, setRowModesModel] = useState({});

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
                    value={item.row.dataType}
                    label="DataType"
                    onChange={handleDataTypeChange}
                >
                    <MenuItem value={DataType.T}>Text</MenuItem>
                    <MenuItem value={DataType.N}>Numeric</MenuItem>
                    <MenuItem value={DataType.D}>Date</MenuItem>
                    <MenuItem value={DataType.I}>Integer</MenuItem>
                    <MenuItem value={DataType.B}>Boolean</MenuItem>
                    <MenuItem value={DataType.C}>Reference Binary</MenuItem>
                    <MenuItem value={DataType.RTF}>RTF</MenuItem>
                    <MenuItem value={DataType.DOC}>Word</MenuItem>
                    <MenuItem value={DataType.XLS}>Excel</MenuItem>
                    <MenuItem value={DataType.XML}>XML</MenuItem>
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

    const processRowUpdate = (newRow) => {
        const updatedRow = { ...newRow, isNew: false };

        let newRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
        setRows(newRows);

        console.log("final updating my newrows " + JSON.stringify(newRows));

        updateParams(newRows);
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const displayParamsTable = () => {
        return (
            <DataGrid
                autoHeight
                rows={rows}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                processRowUpdate={processRowUpdate}
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
        //console.log("rows updated " + JSON.stringify(rows));
    }, [rows]);

    const handleAddParam = () => {
        const id = params.length;
        setRows((oldRows) => {
            let id = oldRows.length;
            let newParams = [...oldRows, { id, name: '', value: '', dataType: DataType.T }];
            return newParams;
        });
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <div className="EditParameters" >
            <h3> {title} </h3>
            {displayParamsTable()}
            <IconButton color="primary" aria-label="add params" onClick={handleAddParam} variant={"outlined"}>
                <AddIcon />
            </IconButton>

        </div>
    );

};

EditParameters.propTypes = {};
