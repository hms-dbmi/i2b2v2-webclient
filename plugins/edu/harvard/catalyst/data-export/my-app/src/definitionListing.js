import * as React from 'react';
import {DataGrid} from "@mui/x-data-grid";

const columns = [
    {
        field: 'name',
        headerName: 'Table Definition Name',
        minWidth: 450,
        flex:1,
        sortable: true,
        editable: true,
        disableReorder: true,
        type: 'string'
    }, {
        field: 'create',
        headerName: 'Created',
        width: 100,
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        disableReorder: true,
        type: 'date'
    }, {
        field: 'edit',
        headerName: 'Edited',
        width: 100,
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        disableReorder: true,
        type: 'date'
    }, {
        field: 'columns',
        headerName: 'Columns',
        width: 100,
        sortable: true,
        headerAlign: 'center',
        align: 'center',
        disableReorder: true,
        type: 'number'
    }
];



export default function ExportDefList({id, rows, canRename}) {

    columns[0].editable = canRename;

    return (
        <div id={id}>
            <DataGrid
                columnHeaderHeight={40}
                style={{background:"white"}}
                columns={columns}
                rows={rows}
                showCellVerticalBorder={true}
                density={'compact'}
                disableColumnResize={true}
                // hideFooter={true}
                // autoHeight={true}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 4 },
                    },
                }}
                pageSizeOptions={[4, 8, 16]}
            ></DataGrid>
        </div>
    )
}