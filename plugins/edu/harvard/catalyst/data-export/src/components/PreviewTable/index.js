import React, {useState, useEffect} from "react";
import {useSelector} from "react-redux";
import {DataGrid} from "@mui/x-data-grid";
import "./PreviewTable.scss";
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';


import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import Button from "@mui/material/Button";
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
                index: i+1,
                id: i
            };
            for (const column of columns) {
                let id = column.id;
                const regex = /[0-9]*$/;
                const splitName = id.split(regex);
                let rowName = splitName[0];
                let aggType= column.aggType;

                row[id] = "[Value]";

                switch (rowName) {
                    case 'Gender':
                        row[id] = ['Male','Female'].map((a) => ({ sort: Math.random(), value: a }))
                            .sort((a, b) => a.sort - b.sort)
                            .map((a) => a.value)[0];
                        break;
                    case 'Race':
                        row[id] = ['American Indian',
                            'Alaska Native',
                            'Asian',
                            'Black or African American',
                            'Multiple race',
                            'Native Hawaiian or Other Pacific Islander',
                            'No Information',
                            'White'].map((a) => ({ sort: Math.random(), value: a }))
                            .sort((a, b) => a.sort - b.sort)
                            .map((a) => a.value)[0];
                        break;
                    case 'Age':
                        row[id] = Math.floor(Math.random() * 72) + 18;
                        break;
                    case 'Ethnicity':
                        row[id] = ['Not Hispanic','Hispanic'].map((a) => ({ sort: Math.random(), value: a }))
                            .sort((a, b) => a.sort - b.sort)
                            .map((a) => a.value)[0];
                        break;
                    default:
                        break;
                }

                switch (aggType) {
                    case 'Exists':
                        row[id] = ["Yes", "No"].map((a) => ({ sort: Math.random(), value: a }))
                            .sort((a, b) => a.sort - b.sort)
                            .map((a) => a.value)[0];
                        break;
                    case "NumConcepts":
                    case "NumDates":
                    case "NumEncounters":
                    case "NumFacts":
                    case "NumProviders":
                    case "NumValues":
                        row[id] = Math.floor(Math.random() * 101);
                        break;
                    case "MinDate":
                    case "MaxDate":
                        const time = Math.floor(Math.random() * 1577836801) + 1704067200;
                        row[id] = (new Date(time)).toLocaleString();
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
        let rowData = [];
        let colNames = tableDefRows.filter(p => p.display).map((row, idx) => {
            rowData.push({id:row.id, name: row.name, aggType: row.dataOption});
            let index = -1;
            let dupIndex = -1;
            tableDefRows.forEach(p => {
                if(p.name === row.name){
                    index++;
                }
                if(p.id === row.id){
                    dupIndex = index;
                }
            });
            let duplicateCountStr = "";
            if(dupIndex > 0){
                duplicateCountStr = " (" + dupIndex + ")";
            }
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
                    let ret = [row.name + duplicateCountStr];
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
                    return (<CustomTooltip title={tooltip}>{row.name + duplicateCountStr}</CustomTooltip>);
                }
            }
        });

        colNames.unshift({
            field: "index",
            headerName: "",
            description: "",
            headerClassName: "header",
            sortable: false,
            hideSortIcons: true,
            disableReorder: true,
            width: 40,
        });
        setColumns(colNames);
        updateRows(rowData);
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
                <Button variant="contained" onClick={()=>props.tabChanger(null,0)}>Back to Design Table</Button>
            </Stack>
        </Stack>
    )
}