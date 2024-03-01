import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataType } from "models";
import {DataGrid, GridActionsCellItem, gridClasses, GridRowModes} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { Confirmation } from "components";

import "./EditParameters.scss";

export const EditParameters = ({rows, title, updateParams, saveParam, deleteParam, saveStatus, deleteStatus, allParamStatus}) => {
    const [rowModesModel, setRowModesModel] = useState({});
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const [saveParamId, setSaveParamId] = useState(null);
    const [showDeleteParamConfirm, setShowDeleteParamConfirm] = useState(false);
    const [deleteParamConfirmMsg, setDeleteParamConfirmMsg] = useState("");
    const [deleteParamId, setDeleteParamId] = useState(null);

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

    const processRowUpdate = (newRow) => {
        if(newRow.name.length > 0) {
            const updatedRow = {...newRow, isNew: false};

            let newRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
            updateParams(newRows);

            let param = newRows.filter((row) => row.id === newRow.id).reduce((acc, item) => acc);
            setSaveParamId(param.id);

            saveParam(param);
            return updatedRow;
        }
        return false;
    };

    const onProcessRowUpdateError = (error) => {
        console.warn("Process row error: " + error);
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    useEffect(() => {
        if(saveStatus === "SUCCESS"){
            setSaveStatusMsg("Saved user parameter");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
            setRowModesModel({ ...rowModesModel, [saveParamId]: { mode: GridRowModes.View } });
            setSaveParamId(null);
        }
        if(saveStatus === "FAIL"){
            setSaveStatusMsg("ERROR: failed to save parameter");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
            setSaveParamId(null);
        }
        if(deleteStatus === "SUCCESS"){
            setSaveStatusMsg("Deleted user parameter");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
        }
        if(deleteStatus === "FAIL"){
            setSaveStatusMsg("ERROR: failed to delete parameter");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
            setSaveParamId(null);
        }

        if(allParamStatus === "FAIL"){
            setSaveStatusMsg("ERROR: failed to reload parameter");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }
    }, [saveStatus, deleteStatus]);

    const displayParamsTable = () => {
        return (
            <DataGrid
                autoHeight
                rows={rows}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={onProcessRowUpdateError}
                columns={columns}
                disableRowSelectionOnClick
                initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                }}
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

    const handleCloseSaveAlert = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setShowSaveStatus(false);
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
        setDeleteParamId(id);

        let param = rows.filter((row) => row.id === id).reduce((acc, item) => acc);
        setDeleteParamConfirmMsg("Are you sure you want to delete param " + param.name + "?");
        setShowDeleteParamConfirm(true);
    };

    const handleDeleteClick = () => {
        let param = rows.filter((row) => row.id === deleteParamId).reduce((acc, item) => acc);
        setDeleteParamId(null);
        setDeleteParamConfirmMsg("");
        setShowDeleteParamConfirm(false);

        deleteParam(param);
    };

    const handleAddParam = () => {
        const id = rows.length+1;
        let newParams = [ { id, name: '', value: '', dataType: DataType.T, isUpdated: true, isNew: true }, ...rows,];

        updateParams(newParams);
        setRowModesModel((oldModel) => ({
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
            ...oldModel,
        }));
    };


    return (
        <div className="EditParameters" >
            <h3> {title} </h3>
            <Button className="AddParam" variant="contained" startIcon={<AddIcon />} onClick={handleAddParam}>
                Add
            </Button>

            {displayParamsTable()}

            <Backdrop className={"SaveBackdrop"} open={showSaveBackdrop}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Snackbar
                open={showSaveStatus}
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'top', horizontal : "center" }}
            >
                <Alert
                    onClose={handleCloseSaveAlert}
                    severity={saveStatusSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {saveStatusMsg}
                </Alert>
            </Snackbar>

            { showDeleteParamConfirm && <Confirmation
                text={deleteParamConfirmMsg}
                onOk={handleDeleteClick}
                onCancel={() => setShowDeleteParamConfirm(false)}
            />}
        </div>
    );

};

EditParameters.propTypes = {};
