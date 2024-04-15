import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataType } from "models";
import {DataGrid, GridActionsCellItem, gridClasses, GridRowModes, useGridApiRef} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { Confirmation,  StatusUpdate } from "components";

import "./EditParameters.scss";
import {Typography} from "@mui/material";

export const EditParameters = ({rows, title, updateParams, saveParam, deleteParam,
                                   saveStatus, deleteStatus,
                                   allParamStatus,
                                   saveStatusConfirm,
                                   deleteStatusConfirm,
                                   paginationModel,
                                   setPaginationModel
}) => {
    const [rowModesModel, setRowModesModel] = useState({});
    const [showStatus, setShowStatus] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");
    const [statusSeverity, setStatusSeverity] = useState("info");
    const [showDeleteParamConfirm, setShowDeleteParamConfirm] = useState(false);
    const [deleteParamConfirmMsg, setDeleteParamConfirmMsg] = useState("");
    const [deleteParamData, setDeleteParamData] = useState(null);
    const apiRef = useGridApiRef();

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
            type: 'singleSelect',
            valueOptions: [{
                label: 'Text',
                value: DataType.T
            }, {
                label: 'Numeric',
                value: DataType.N
            }, {
                label: 'Date',
                value: DataType.D
            }, {
                label: 'Integer',
                value: DataType.I
            }, {
                label : 'Boolean',
                value: DataType.B
            }, {
                label : 'Reference Binary',
                value: DataType.C
            },{
                label: 'RTF',
                value: DataType.RTF
            }, {
                label: 'Word',
                value: DataType.DOC
            }, {
                label: 'Excel',
                value: DataType.XLS
            }, {
                label : 'XML',
                value: DataType.XML
            }]
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            flex: 1,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={confirmDelete(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];

    const getRowId = (row) =>{
        return row.id;
    }

    const processRowUpdate = (newRow) => {
        if(newRow.name.length > 0) {
            const updatedRow = {...newRow, isNew: false};

            let newRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
            updateParams(newRows);

            let param = newRows.filter((row) => row.id === newRow.id).reduce((acc, item) => acc);

            saveParam(param);
            return updatedRow;
        }
        return false;
    };

    const onProcessRowUpdateError = (error) => {
        console.error("Process update error rows is " + JSON.stringify(rows));
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    useEffect(() => {
        if(saveStatus.status === "SAVE_SUCCESS"){
            setStatusMsg("Saved parameter " + saveStatus.param.name);
            setShowStatus(true);
            setStatusSeverity("success");
            setRowModesModel({ ...rowModesModel, [saveStatus.param]: { mode: GridRowModes.View } });
        }
        if(saveStatus.status === "SAVE_FAIL"){
            setStatusMsg("ERROR: failed to save parameter " + saveStatus.param.name);
            setShowStatus(true);
            setStatusSeverity("error");
        }
        if(deleteStatus.status === "DELETE_SUCCESS"){
            setStatusMsg("Deleted parameter " + deleteStatus.param.name);
            setShowStatus(true);
            setStatusSeverity("success");
        }
        if(deleteStatus.status === "DELETE_FAIL"){
            setStatusMsg("ERROR: failed to delete parameter " + deleteStatus.param.name);
            setShowStatus(true);
            setStatusSeverity("error");
        }

        if(allParamStatus === "FAIL"){
            setStatusMsg("ERROR: failed to reload parameters");
            setShowStatus(true);
            setStatusSeverity("error");
        }
    }, [saveStatus, deleteStatus]);

    useEffect(() => {
        saveStatusConfirm();
        deleteStatusConfirm();
    }, []);

    const isCellEditable = (params) => {
        return  (params.field !== "name" || (params.field === "name" && !params.row.internalId));
    }
    const displayParamsTable = () => {
        return (
            <DataGrid
                autoHeight
                rows={rows}
                getRowId={getRowId}
                editMode="row"
                rowModesModel={rowModesModel}
                isCellEditable={isCellEditable}
                apiRef={apiRef}
                onRowModesModelChange={handleRowModesModelChange}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={onProcessRowUpdateError}
                columns={columns}
                disableRowSelectionOnClick
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25]}
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

    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            updateParams(rows.filter((row) => row.id !== id));
        }
    };

    const confirmDelete = (id) => () => {
        let param = rows.filter((row) => row.id === id).reduce((acc, item) => acc);
        setDeleteParamData(param);

        setDeleteParamConfirmMsg("Are you sure you want to delete parameter " + param.name + "?");
        setShowDeleteParamConfirm(true);
    };

    const handleDeleteClick = () => {
        let param = rows.filter((row) => row.id === deleteParamData.id).reduce((acc, item) => acc);
        setDeleteParamData(null);
        setDeleteParamConfirmMsg("");
        setShowDeleteParamConfirm(false);

        deleteParam(param);
    };

    const handleAddParam = () => {
        const id = rows.length;
        let newParams = [ ...rows, { id, name: '', value: '', dataType: DataType.T, isUpdated: true, isNew: true }];

        updateParams(newParams);
        setRowModesModel((oldModel) => ({
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
            ...oldModel,
        }));

        const lastPage = Math.floor((rows.length+1) / paginationModel.pageSize);
        apiRef.current.setPage(lastPage);
    };


    const handleStatusClose = () => {
        saveStatusConfirm();
        deleteStatusConfirm();
        setShowStatus(false);
    };

    return (
        <div className="EditParameters" >
            <Typography> {title} </Typography>
            <Button className="AddParam" variant="contained" startIcon={<AddIcon />} onClick={handleAddParam}>
                Add
            </Button>

            {displayParamsTable()}

            <StatusUpdate isOpen={showStatus} setIsOpen={handleStatusClose} severity={statusSeverity} message={statusMsg}/>

            { showDeleteParamConfirm && <Confirmation
                text={deleteParamConfirmMsg}
                onOk={handleDeleteClick}
                onCancel={() => setShowDeleteParamConfirm(false)}
            />}
        </div>
    );

};

EditParameters.propTypes = {};
