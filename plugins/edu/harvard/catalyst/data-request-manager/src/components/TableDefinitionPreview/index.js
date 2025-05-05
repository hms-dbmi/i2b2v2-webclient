import React, {useState} from "react";

import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";
import "./TableDefinitionPreview.scss";


export const TableDefinitionPreview = ({tableDefinition, open, onClose}) => {
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0});

    const columns = [
        {
            field: 'name',
            headerName: 'Name',
            headerClassName: "header",
            flex: 2,
            sortable: true,
        },
        {
            field: "constraints",
            headerName: 'Constraints',
            headerClassName: "header",
            disableColumnSorting: true,
            disableColumnMenu: true,
            resizable: true,
            display: "flex",
            sortable: false,
            flex: 1,
            renderCell: (cellValues) => {
                if (cellValues.row.sdxData && (cellValues.row.sdxData.LabValues !== undefined || cellValues.row.sdxData.dateRange !== undefined)) {
                    let func_getDateTxt = function(sdx) {
                        let ret = {txt: false, mouse: false };
                        if (sdx.dateRange) {
                            let start = false;
                            let end = false;
                            if (sdx.dateRange.start && sdx.dateRange.start !== "") start = sdx.dateRange.start;
                            if (sdx.dateRange.end && sdx.dateRange.end !== "") end = sdx.dateRange.end;
                            if (start && end) {
                                ret.txt = start + " to " + end;
                                ret.mouse = "Only find this concept from " + start + " to " + end;
                            } else {
                                if (start) {
                                    ret.txt = ">= " + start;
                                    ret.mouse = "Only find this concept starting from " + start;
                                }
                                if (end) {
                                    ret.txt = "<= " + end;
                                    ret.mouse = "Only find this concept until " + end;
                                }
                            }
                        }
                        return ret;
                    };

                    // lab value constraint
                    let txtLab;
                    let txtMouseover;
                    let labData = cellValues.row.sdxData.LabValues;
                    if (labData !== undefined && labData.ValueType !== undefined && ((labData.Value && labData.Value.length !== 0) || labData.ValueFlag || labData.ValueHigh || labData.ValueLow) ) {
                        switch (labData.ValueType) {
                            case undefined:
                                break;
                            case "LARGETEXT":
                                txtLab = labData.Value;
                                txtMouseover = labData.Value;
                                break;
                            case "TEXT":
                                if (typeof labData.Value ===  'string') {
                                    txtLab = labData.Value;
                                    txtMouseover = labData.Value;
                                } else if (labData.Value.length > 1) {
                                    txtLab = "(" + labData.Value.length + " values)";
                                    txtMouseover = labData.Value.join('\n');
                                } else {
                                    txtLab = labData.Value[0];
                                    txtMouseover = txtLab;
                                }
                                break;
                            case "FLAG":
                                txtLab = "Flag = \"" + labData.ValueFlag + "\"";
                                txtMouseover = txtLab;
                                break;
                            default:
                                switch(labData.ValueOperator) {
                                    case "BETWEEN":
                                        txtLab = "Between " + labData.ValueLow + " - " + labData.ValueHigh;
                                        break;
                                    case "GT":
                                        txtLab = "> " + labData.Value;
                                        break;
                                    case "GE":
                                        txtLab = "≥" + labData.Value;
                                        break;
                                    case "LE":
                                        txtLab = "≤ " + labData.Value;
                                        break;
                                    case "LT":
                                        txtLab = "< " + labData.Value;
                                        break;
                                    case "EQ":
                                        txtLab = "= " + labData.Value;
                                        break;
                                    default:
                                        txtLab = "UNKNOWN";
                                }
                                // add units
                                if (typeof labData.ValueUnit === "string" && labData.ValueUnit !== "") txtLab = txtLab + " " + labData.ValueUnit;
                                txtMouseover = txtLab;
                                break;
                        }
                        let dateInfo = func_getDateTxt(cellValues.row.sdxData);
                        return dateInfo.txt ? (<div className={"Constraints"} title={txtMouseover + '|' + dateInfo.mouse}><span>{txtLab}</span> | <span>{dateInfo.txt}</span></div>) : <div className={"Constraints"} title={txtMouseover}>{txtLab}</div>;
                    } else {
                        const dateInfo = func_getDateTxt(cellValues.row.sdxData);
                        return (<div className={"Constraints"} title={dateInfo.txt}>{dateInfo.txt}</div>);
                    }
                }
            }
        },
        {
            field: 'dataOption',
            headerName: 'Aggregation Method',
            headerClassName: "header",
            flex: 1,
            sortable: true,
        },
    ]

    return (<Dialog
        className={"TableDefinitionPreview"}
        open={open}
        onClose={onClose}
        aria-labelledby="tabledefinitionpreview-dialog-title"
        aria-describedby="tabledefinitionpreview-dialog-description"
        fullWidth={true}
        maxWidth={'xl'}
        PaperProps={{
            sx: {
                minHeight: '80%',
                maxHeight: '80%'
            }
        }}
    >
        <DialogTitle id="tabledefinitionpreview-dialog-title">
            Table Definition: <span className={"TableDefinitionPreviewTitle"}>{tableDefinition.title}</span>
        </DialogTitle>
        <DialogContent>
            <DialogContentText id="confirm-dialog-description">
                <DataGrid
                    style={{background:"white"}}
                    className={"DefineTableGrid"}
                    rows={tableDefinition.concepts}
                    columns={columns}
                    density={'compact'}
                    showCellVerticalBorder={true}
                    hideFooterSelectedRowCount={true}
                    disableColumnSelector={true}
                    pageSizeOptions={[5, 10, 25]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                />
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Ok</Button>
        </DialogActions>
    </Dialog>);
}