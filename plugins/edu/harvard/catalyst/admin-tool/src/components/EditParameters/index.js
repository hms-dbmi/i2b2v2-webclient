import { useDispatch } from "react-redux";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DataType } from "models";
import {DataGrid, GridActionsCellItem, gridClasses, GridRowModes} from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import {
    saveUserParam, saveUserParamStatusConfirmed,
    deleteUserParam, deleteUserParamStatusConfirmed
} from "../../actions";

import "./EditParameters.scss";

export const EditParameters = ({selectedUser, params, title}) => {
    const [rows, setRows] = useState(params);
    const [rowModesModel, setRowModesModel] = useState({});
    const [showSaveBackdrop, setShowSaveBackdrop] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [saveStatusMsg, setSaveStatusMsg] = useState("");
    const [saveStatusSeverity, setSaveStatusSeverity] = useState("info");
    const [saveParamId, setSaveParamId] = useState(null);
    const dispatch = useDispatch();

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

        let param = newRows.filter((row) => row.id === newRow.id).reduce((acc, item) => acc);
        setSaveParamId(param.id);

        dispatch(saveUserParam({user: selectedUser.user, param}));

        return updatedRow;
    };

    const onProcessRowUpdateError = (error) => {
        console.warn("Process row error: " + error);
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
                onProcessRowUpdateError={onProcessRowUpdateError}
                columns={columns}
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
        let savedRow = rows.filter((row) => row.id === id);

        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const handleDeleteClick = (id) => () => {
        let param = rows.filter((row) => row.id === id).reduce((acc, item) => acc);
        setSaveParamId(param.id);
        dispatch(deleteUserParam({param}));
    };

    const handleAddParam = () => {
        const id = rows.length+1;
        let newParams = [...params, { id, name: '', value: '', dataType: DataType.T, isUpdated: true, isNew: true }];

        setRows(newParams);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    useEffect(() => {
        if(selectedUser.saveStatus === "SUCCESS"){
            dispatch(saveUserParamStatusConfirmed());
            setSaveStatusMsg("Saved user parameter");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
            setRowModesModel({ ...rowModesModel, [saveParamId]: { mode: GridRowModes.View } });
            setSaveParamId(null);
        }
        if(selectedUser.saveStatus === "FAIL"){
            dispatch(saveUserParamStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to save user param");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
            setSaveParamId(null);
        }
        if(selectedUser.deleteStatus === "SUCCESS"){
            dispatch(deleteUserParamStatusConfirmed());
            setSaveStatusMsg("Deleted user parameter");
            setShowSaveStatus(true);
            setSaveStatusSeverity("success");
            setRowModesModel({ ...rowModesModel, [saveParamId]: { mode: GridRowModes.View } });
        }
        if(selectedUser.deleteStatus === "FAIL"){
            dispatch(deleteUserParamStatusConfirmed());
            setSaveStatusMsg("ERROR: failed to delete user param");
            setShowSaveStatus(true);
            setSaveStatusSeverity("error");
        }

        setRows(selectedUser.params);

    }, [selectedUser]);


    return (
        <div className="EditParameters" >
            <h3> {title} </h3>
            {displayParamsTable()}
            <IconButton color="primary" aria-label="add params" onClick={handleAddParam} variant={"outlined"}>
                <AddIcon />
            </IconButton>

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
        </div>
    );

};

EditParameters.propTypes = {};
