import React, {useEffect, useState} from "react";

import {DataGrid, GridActionsCellItem, GridRowModes} from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import "./TableListing.scss";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import Button from "@mui/material/Button";
import {AlertDialog} from "../AlertDialog";

import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

export const TableListing = ({id, rows, canRename, onSelect, onSelectionModelChange, selectionModel,
                                 hasError, isLoading, onDelete, deleteFailed, onDeleteAlertClose, renameTable}) => {
    const [rowToDelete, setRowToDelete] = useState({});
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const [alertMsgInfo, setAlertMsgInfo] = useState({});
    const [rowModesModel, setRowModesModel] = useState({});
    const [inValidCells, setInValidCells] = useState({});

    const handleConfirmDelete = (id, fileName) => {
        setRowToDelete({id, fileName});
        setShowConfirmDelete(true);
    }

    const handleDeleteRow = (id) => {
        setShowConfirmDelete(false);
        onDelete(rowToDelete.id);
    }

    const handleCancelDeleteRow = () => {
        setShowConfirmDelete(false);
    }


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

        let updatedInValidCells = Object.keys(inValidCells).filter(i => inValidCells[i] === id)
        setInValidCells(updatedInValidCells);
    };

    const processRowUpdate = (editedRow) => {
        if(editedRow.title.length > 0){
            renameTable(editedRow.id, editedRow.title);

            const updatedInValidCells = Object.keys(inValidCells).filter(i => inValidCells[i] === editedRow.id)
            setInValidCells(updatedInValidCells);

            return editedRow;
        }
        else{
            let updatedInValidCells = {
                ...inValidCells
            };
            updatedInValidCells[editedRow.id] = {
                title: editedRow.title,
            }

            setInValidCells(updatedInValidCells);
        }
        return false;
    };

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const onProcessRowUpdateError = (error) => {
        console.error("Process update error rows is " + JSON.stringify(rows));
    };

    const columns = [
        {
            field: 'title',
            headerName: 'Table Definition Name',
            minWidth: 380,
            flex:1,
            sortable: true,
            editable: canRename,
            disableReorder: true,
            type: 'string',
        }, {
            field: 'create_date',
            headerName: 'Created',
            width: 98,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'date'
        }, {
            field: 'edit_date',
            headerName: 'Edited',
            width: 98,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'date'
        }, {
            field: 'column_count',
            headerName: 'Columns',
            width: 92,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'number'
        },
        {
            field: 'actions',
            type: 'actions',
            width: 77,
            getActions: (params) => {
                const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon/>}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(params.id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon/>}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(params.id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon/>}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(params.id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={() => handleConfirmDelete(params.id, params.row.title)}
                    />,
                ];
            },
        },
    ];

    function handleOnSelectionModelChange(selection, {api} ) {
        if (selection.length > 0) onSelect(api.getRow(selection[0]));

        if (onSelectionModelChange !== undefined) {
            onSelectionModelChange(selection);
        }
    }

    const CustomNoRowsOverlay = () => {
        return (
            <div className={"tableListingOverlay"}>
                { !hasError && <div className={"listingStatusMsg"} >No results</div> }
                { hasError && <div className={"listingStatusMsg listingStatusErrorMsg"} >There was an error retrieving existing table definitions</div>}
            </div>
        );
    }

    useEffect(() => {
        if(deleteFailed){
            setShowAlertDialog(true);
            setAlertMsgInfo({
                title: "DeleteFile",
                msg: "An error occurred deleting file \"" + rowToDelete.fileName + "\"",
                onOk: () => {setShowAlertDialog(false); onDeleteAlertClose();}
            })
        }
    }, [deleteFailed]);

    return (
        <div className={"TableListing"} id={id} style={{height: 400}} >
            <DataGrid
                height={280}
                columnHeaderHeight={40}
                style={{background:"white"}}
                columns={columns}
                rows={rows}
                showCellVerticalBorder={true}
                density={'compact'}
                disableColumnResize={true}
                onRowSelectionModelChange = {handleOnSelectionModelChange}
                rowSelectionModel = {selectionModel}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={onProcessRowUpdateError}
                getCellClassName={(params) => {
                    let paramId = params.id;

                    if(params.field ==="title"){
                        return (inValidCells[paramId] !== undefined && inValidCells[paramId].title.length < 1) ? 'missing' : '';
                    }
                    else{
                        return '';
                    }
                }}

                loading={isLoading}
                slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                }}
                slotProps={{
                    loadingOverlay: {
                        variant: 'circular-progress',
                        noRowsVariant: 'linear-progress',
                    },
                }}
                autoPageSize
            />

            <Dialog
                open={showConfirmDelete}
                onClose={handleCancelDeleteRow}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete File
                </DialogTitle>
                <DialogContent dividers>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete file {rowToDelete.fileName} ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" autoFocus onClick={handleDeleteRow}>
                        Yes
                    </Button>
                    <Button variant="contained" autoFocus onClick={handleCancelDeleteRow}>
                        No
                    </Button>
                </DialogActions>
            </Dialog>

            {showAlertDialog && <AlertDialog
                msg={alertMsgInfo.msg}
                title={alertMsgInfo.title}
                onOk = {alertMsgInfo.onOk}
            />
            }
        </div>
    )
}