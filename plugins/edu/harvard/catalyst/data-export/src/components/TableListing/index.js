import React, {useState} from "react";

import {DataGrid, GridActionsCellItem} from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import "./TableListing.scss";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import Button from "@mui/material/Button";

export const TableListing = ({id, rows, canRename, onSelect, onSelectionModelChange, selectionModel, hasError, isLoading, onDelete}) => {
    const [rowToDelete, setRowToDelete] = useState({});
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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

    const columns = [
        {
            field: 'title',
            headerName: 'Table Definition Name',
            minWidth: 405,
            flex:1,
            sortable: true,
            editable: canRename,
            disableReorder: true,
            type: 'string',
        }, {
            field: 'create_date',
            headerName: 'Created',
            width: 99,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'date'
        }, {
            field: 'edit_date',
            headerName: 'Edited',
            width: 99,
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
            width: 36,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleConfirmDelete(params.id, params.row.title)}
                />
            ],
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
        </div>
    )
}