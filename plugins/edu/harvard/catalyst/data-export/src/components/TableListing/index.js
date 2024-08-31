import React, { useState } from "react";

import {DataGrid} from "@mui/x-data-grid";

export const TableListing = ({id, rows, canRename, onSelect}) => {
    const columns = [
        {
            field: 'title',
            headerName: 'Table Definition Name',
            minWidth: 450,
            flex:1,
            sortable: true,
            editable: canRename,
            disableReorder: true,
            type: 'string',
        }, {
            field: 'create_date',
            headerName: 'Created',
            width: 100,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'date'
        }, {
            field: 'edit_date',
            headerName: 'Edited',
            width: 100,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'date'
        }, {
            field: 'column_count',
            headerName: 'Columns',
            width: 100,
            sortable: true,
            headerAlign: 'center',
            align: 'center',
            disableReorder: true,
            type: 'number'
        }
    ];
    const [rowSelectionModel, setRowSelectionModel] = useState([]);


    const onSelectionModelChange = (selectionModel, {api} )  =>{
        setRowSelectionModel(selectionModel);

        if (selectionModel.length > 0){
            onSelect(api.getRow(selectionModel[0]));
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
                onRowSelectionModelChange={onSelectionModelChange}
                rowSelectionModel={rowSelectionModel}
                pageSizeOptions={[4, 8, 16]}
            />
        </div>
    )
}