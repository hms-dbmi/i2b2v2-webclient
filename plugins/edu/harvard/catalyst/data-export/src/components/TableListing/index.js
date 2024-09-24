import React from "react";

import {DataGrid} from "@mui/x-data-grid";

export const TableListing = ({id, rows, canRename, onSelect, onSelectionModelChange, selectionModel}) => {
    const columns = [
        {
            field: 'title',
            headerName: 'Table Definition Name',
            minWidth: 438,
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
            width: 97,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'number'
        }
    ];

    function handleOnSelectionModelChange(selection, {api} ) {
        if (selection.length > 0) onSelect(api.getRow(selection[0]));

        if (onSelectionModelChange !== undefined) {
            onSelectionModelChange(selection);
        }
    }


    return (
        <div id={id} style={{height: 400}} >
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
                autoPageSize
            />
        </div>
    )
}