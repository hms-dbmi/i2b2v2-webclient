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

    const updateRows = (columns) => {
        console.log("column " + JSON.stringify(tableDefRows));

        let newRows = [];
        for (let i = 0; i < 5; i++) {
            let row = {
                id: i
            };
            for (const column of columns) {
                let name = column.name;
                let aggType= column.aggType;

                row[name] = "[Value]";

                switch (name) {
                    case 'Participant ID':
                        row[name] = "RA15432-0000" + i
                        break;
                    case 'Gender':
                        row[name] = ['M','F'].map((a) => ({ sort: Math.random(), value: a }))
                        .sort((a, b) => a.sort - b.sort)
                        .map((a) => a.value)[0];
                        break;
                    case 'Age':
                        row[name] = Math.floor(Math.random() * 81) + 20;
                        break;
                    case 'Deceased':
                        row[name] = "N";
                        break;
                }

                switch (aggType) {
                    case 'Exists':
                        row[name] = ["Yes", "No"].map((a) => ({ sort: Math.random(), value: a }))
                            .sort((a, b) => a.sort - b.sort)
                            .map((a) => a.value)[0];
                        break;
                    case "NumConcepts":
                    case "NumDates":
                    case "NumEncounters":
                    case "NumFacts":
                    case "NumProviders":
                    case "NumValues":
                        row[name] = Math.floor(Math.random() * 101);
                        break;
                    case "MinDate":
                    case "MaxDate":
                        const time = Math.floor(Math.random() * 1577836801) + 1704067200;
                        row[name] = (new Date(time)).toLocaleString();
                        break;
                }
            }

            newRows.push(row);
        }
        setRows(newRows);
    }

    useEffect( ()  =>{
        let columnNames = [];
        setColumns(tableDefRows.filter(p => p.display).map(row => {
            columnNames.push({name: row.name, aggType: row.dataOptions});
            return {
                field: row.name,
                headerName: row.name,
                headerClassName: "header",
                sortable: false,
                hideSortIcons: true,
                disableReorder: true,
                flex: 2
            }
        }));

        updateRows(columnNames);
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