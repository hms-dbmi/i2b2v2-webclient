import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {DataGrid} from "@mui/x-data-grid";
import "./PreviewTable.scss";
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import Button from "@mui/material/Button";

export const PreviewTable = (props) => {
    const tableDefRows = useSelector((state) => state.tableDef.rows);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);

    const updateRows = (columns) => {

        let newRows = [];
        for (let i = 0; i < 5; i++) {
            let row = {
                id: i
            };
            for (const column of columns) {
                let name = column.id;
                let aggType= column.aggType;

                row[name] = "[Value]";

                switch (name) {
                    case 'patient_number':
                    case 'subject_id':
                        row[name] = "RA15432-0000" + i
                        break;
                    case 'gender':
                        row[name] = ['M','F'].map((a) => ({ sort: Math.random(), value: a }))
                        .sort((a, b) => a.sort - b.sort)
                        .map((a) => a.value)[0];
                        break;
                    case 'age':
                        row[name] = Math.floor(Math.random() * 81) + 20;
                        break;
                    case 'vital_status':
                        row[name] = "N";
                        break;
                    default:
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
                    default:
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
            columnNames.push({id:row.id, name: row.name, aggType: row.dataOption});
            return {
                field: row.id,
                headerName: row.name,
                headerClassName: "header",
                sortable: false,
                hideSortIcons: true,
                disableReorder: true,
                flex: 1,
                minWidth: 150
            }
        }));

        updateRows(columnNames);
    },[tableDefRows]);

    return (
        <Stack
            className={"PreviewTable"}
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={3}
            useFlexGap
        >
            <Typography variant="subtitle2" gutterBottom>
            This is an example view of fake data in the format of the table you have defined for export.  This is not real data.
            </Typography>

            <DataGrid
                className={"PreviewTableGrid"}
                style={{background:"white"}}
                rows={rows}
                columns={columns}
                showCellVerticalBorder={true}
                hideFooterSelectedRowCount={true}
                columnVisibilityModel={{order: false}}
                disableColumnSelector={true}
                disableColumnMenu={true}
                initialState={{
                    sorting: {
                        sortModel: [{field:'order',sort:'asc'}]
                    }
                }}
                autoHeight={true}
                hideFooter={true}

            />

            <Stack
                spacing={2}
                direction="row"
                justifyContent="right"
                alignItems="center"
                className={"PreviewTableActions"}
            >
                <Button variant="contained" onClick={()=>props.tabChanger(null,2)}>Select Participants for Table</Button>
            </Stack>
        </Stack>
    )
}