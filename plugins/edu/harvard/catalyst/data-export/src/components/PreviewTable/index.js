import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {DataGrid} from "@mui/x-data-grid";
import "./PreviewTable.scss";
import Stack from "@mui/material/Stack";
import {gridClasses} from "@mui/material";

export const PreviewTable = () => {
    const tableDefRows = useSelector((state) => state.tableDef.rows);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);

    useEffect( ()  =>{
        setColumns(tableDefRows.filter(p =>p.display).map(row => {
            return {
                field: row.name,
                headerName: row.name,
                headerClassName: "header",
                sortable: true,
                sortingOrder: "ASC",
                hideSortIcons: true,
                disableReorder: true,
                flex: 1
            }
        }));
    },[tableDefRows]);

    return (
        <Stack
            className={"PreviewTable"}
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={3}
            useFlexGap
        >
            <DataGrid
                className={"PreviewTableGrid"}
                style={{background:"white"}}
                rows={rows}
                columns={columns}
                showCellVerticalBorder={true}
                hideFooterSelectedRowCount={true}
                columnVisibilityModel={{order: false}}
                disableColumnSelector={true}
                initialState={{
                    sorting: {
                        sortModel: [{field:'order',sort:'asc'}]
                    }
                }}
                autoHeight={true}
                hideFooter={true}

            />
        </Stack>
    )
}