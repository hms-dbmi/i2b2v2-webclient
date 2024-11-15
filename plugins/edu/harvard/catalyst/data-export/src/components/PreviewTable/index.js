import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {DataGrid} from "@mui/x-data-grid";
import "./PreviewTable.scss";
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import Button from "@mui/material/Button";


import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
const CustomTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 500,
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
        fontSize: '0.8rem'
    },
});


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
                description: row.name,
                headerClassName: "header",
                sortable: false,
                hideSortIcons: true,
                disableReorder: true,
                flex: 1,
                minWidth: 150,
                renderHeader: (data) => {
                    let ret = [row.name];
                    ret.push('['+row.dataOption+']');
                    if (row.sdxData.LabValues) {
                        let labData = row.sdxData.LabValues;
                        let txtLab="";
                        if (labData !== undefined && labData.ValueType !== undefined && ((labData.Value && labData.Value.length !== 0) || labData.ValueFlag || labData.ValueHigh || labData.ValueLow)) {
                            switch (labData.ValueType) {
                                case undefined:
                                    break;
                                case "LARGETEXT":
                                    txtLab = labData.Value;
                                    break;
                                case "TEXT":
                                    if (typeof labData.Value === "string") {
                                        txtLab = labData.Value;
                                    } else if (labData.Value.length > 1) {
                                        txtLab = labData.Value.join('\n');
                                        // txtLab = "(" + labData.Value.length + " values)";
                                    } else {
                                        txtLab = labData.Value[0];
                                    }
                                    break;
                                case "FLAG":
                                    txtLab = "Flag = \"" + labData.ValueFlag + "\"";
                                    break;
                                default:
                                    switch(labData.ValueOperator) {
                                        case "BETWEEN":
                                            txtLab = "Between " + labData.ValueLow + " - " + labData.ValueHigh;
                                            break;
                                        case "GT":
                                            txtLab = ">" + labData.Value;
                                            break;
                                        case "GE":
                                            txtLab = "≥" + labData.Value;
                                            break;
                                        case "LE":
                                            txtLab = "≤" + labData.Value;
                                            break;
                                        case "LT":
                                            txtLab = "<" + labData.Value;
                                            break;
                                        case "EQ":
                                            txtLab = "=" + labData.Value;
                                            break;
                                        default:
                                            txtLab = "UNKNOWN";
                                    }
                                    // add units
                                    if (typeof labData.ValueUnit === "string" && labData.ValueUnit !== "") txtLab = txtLab + " " + labData.ValueUnit;
                                    break;
                            }
                        }
                        if(txtLab.length > 0) {
                            ret.push('[ ' + txtLab + ' ]');
                        }
                    }
                    if (row.sdxData.dateRange) {
                        let sdxDate = row.sdxData.dateRange;
                        let start = false;
                        let end = false;
                        if (sdxDate.start && sdxDate.start !== "") start = sdxDate.start;
                        if (sdxDate.end && sdxDate.end !== "") end = sdxDate.end;
                        if (start && end) {
                            ret.push('[ '+start + " to " + end +' ]');
                        } else {
                            if (start) {
                                ret.push("[ From " + start + ' ]');
                            }
                            if (end) {
                                ret.push("[ Until " + end + ' ]');
                            }
                        }
                    }
                    let tooltip = ret.join("\n\n");
                    return (<CustomTooltip title={tooltip}>{row.name}</CustomTooltip>);
                }
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