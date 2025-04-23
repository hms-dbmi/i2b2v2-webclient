import React, {useEffect, useState} from "react";

import {DataGrid, GridActionsCellItem, GridRowModes} from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import "./TableListing.scss";
import {Alert, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import Button from "@mui/material/Button";
import {AlertDialog} from "../AlertDialog";

import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';

export const TableListing = ({id, rows, canRename, onSelect, onSelectionModelChange, selectionModel,
                                 hasError, isLoading, onDelete, deleteFailed, onDeleteAlertClose,
                                 onRename, renameFailed, onRenameAlertClose, showLastEditedBy}) => {
    const [rowToRename, setRowToRename] = useState({});
    const [rowToDelete, setRowToDelete] = useState({});
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const [alertMsgInfo, setAlertMsgInfo] = useState({});
    const [rowModesModel, setRowModesModel] = useState({});
    const [inValidCells, setInValidCells] = useState({});
    const [showInValidCellsMsg, setShowInValidCellsMsg] = useState(false);
    const [inValidCellsMsg, setInValidCellsMsg] = useState("");

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

    const handleEditClick = (params) => () => {
        setRowModesModel({ ...rowModesModel, [params.id]: { mode: GridRowModes.Edit } });
        setRowToRename( params.row.title);
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
        clearInvalidCellAlertError();
    };

    const clearInvalidCellAlertError = () => {
        setShowInValidCellsMsg("");
        setShowInValidCellsMsg(false);
    }
    const processRowUpdate = (editedRow, previousRow) => {
        const MAX_FILENAME_LENGTH = 200;
        const matchedRows = rows.filter(srow => srow.title?.toUpperCase() === editedRow.title.toUpperCase());

        if((previousRow.title.toUpperCase() === editedRow.title.toUpperCase())
            || (editedRow.title.length > 0 && editedRow.title.length <= MAX_FILENAME_LENGTH &&  matchedRows.length === 0)){

            if(previousRow.title.toUpperCase() !== editedRow.title.toUpperCase()) {
                onRename(editedRow.id, editedRow.title);
            }

            const updatedInValidCells = Object.keys(inValidCells).filter(i => inValidCells[i] === editedRow.id)
            setInValidCells(updatedInValidCells);
            clearInvalidCellAlertError();
            return editedRow;
        }
        else{
            let errorMsg = "";
            if(matchedRows.length !== 0){
                errorMsg = "File name already exists";
            }else if(editedRow.title.length > MAX_FILENAME_LENGTH){
                errorMsg = "File name must be less than 200 characters";
            }else{
                errorMsg = "Please enter a file name";
            }

            let updatedInValidCells = {
                ...inValidCells
            };
            updatedInValidCells[editedRow.id] = {
                title: editedRow.title,
            }

            setInValidCells(updatedInValidCells);
            setInValidCellsMsg(errorMsg);
            setShowInValidCellsMsg(true);
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
        },{
            field: 'column_count',
            headerName: 'Columns',
            width: 92,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'number'
        },
    ];

    //add rename and delete icons if user has rename privileges
    if(canRename){
        columns.push({
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
                        onClick={handleEditClick(params)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon/>}
                        label="Delete"
                        onClick={() => handleConfirmDelete(params.id, params.row.title)}
                    />,
                ];
            },
        });
    }

    if(showLastEditedBy){
        columns.splice(3,0 ,
        {
            field: 'creator_id',
            headerName: 'Last Edited By',
            width: 115,
            sortable: true,
            headerAlign: 'center',
            disableReorder: true,
        });
    }

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
                title: "Delete File",
                msg: "An error occurred deleting file \"" + rowToDelete.fileName + "\"",
                onOk: () => {setShowAlertDialog(false); onDeleteAlertClose();}
            })
        }
    }, [deleteFailed]);

    useEffect(() => {
        if(renameFailed){
            setShowAlertDialog(true);
            setAlertMsgInfo({
                title: "Rename File",
                msg: "An error occurred renaming file \"" + rowToRename + "\"",
                onOk: () => {setShowAlertDialog(false); onRenameAlertClose();}
            })
        }
    }, [renameFailed]);

    return (
        <div className={"TableListing"} id={id} style={{height: 400}} >
            {showInValidCellsMsg &&
                <Alert
                    className={"TableListingAlert"}
                    severity="error"
                    sx={{position: 'absolute', 'z-index': '1000'}}
                >
                    {inValidCellsMsg}
                </Alert>
            }
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
                        return (inValidCells[paramId] !== undefined) ? 'missing' : '';
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
                initialState={{
                    sorting: {
                        sortModel: [{field:'create_date',sort:'desc'}]
                    }
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
                    <Button variant="contained" onClick={handleDeleteRow}>
                        Yes
                    </Button>
                    <Button variant="contained" onClick={handleCancelDeleteRow}>
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