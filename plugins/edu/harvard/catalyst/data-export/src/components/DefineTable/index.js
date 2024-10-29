import React, { useEffect } from "react";

import '../../css/tableDef.scss';
import {
    DataGrid,
    GridActionsCellItem,
    GridCellModes,
    GridEditInputCell
} from '@mui/x-data-grid';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';

import {
    handleRowDelete,
    handleRowInsert,
    handleRowExported,
    handleRowAggregation,
    handleRowName,
    handleRowSdx,
    loadStatusConfirmed
} from "../../reducers/loadTableSlice";
import {useDispatch, useSelector} from "react-redux";
import {updateI2b2LibLoaded} from "../../reducers/i2b2LibLoadedSlice";
import "./DefineTable.scss";
import {DATATYPE, generateTableDefRowId} from "../../models/TableDefinitionRow";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Link} from "@mui/material";
import XMLParser from "react-xml-parser";

/* global i2b2 */

export const DefineTable = (props) => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const { rows, statusInfo } = useSelector((state) => state.tableDef);
    const [cellModesModel, setCellModesModel] = React.useState({});


    const columns = [
        {
            field: 'order',
            headerName: 'order',
            headerClassName: "header",
            width: 1,
            sortable: true,
            resizable: false,
            sortingOrder: "ASC",
            hideSortIcons: true,
            disableReorder: true
        },
        {
            field: 'name',
            headerName: 'Column Title',
            headerClassName: "header",
            flex:1,
            editable: true,
            sortable: false,
            resizable: true,
            disableColumnSorting: true,
            disableColumnMenu: false,
            renderCell: ({row}) =>  (
                <Tooltip title={row.sdxData.renderData?.moreDescriptMinor ? row.sdxData.renderData.moreDescriptMinor : "This column was originally called \""+ row.id+"\""} >
                    { row.name.length ? <span className="tabledef-cell-trucate">{row.name}</span>  : <div className="tabledef-cell-trucate">&nbsp;</div> }
                </Tooltip>
            ),
            renderEditCell: (params) => (
                <GridEditInputCell
                    {...params}
                    inputProps={{ maxLength: 255 }}
                />
            ),
            valueSetter: (value, row) => {
                dispatch(handleRowName({id: row.id, value: value}));
                return { ...row };
            },
        },
        {
            field: "constraints",
            headerName: 'Constraints',
            headerClassName: "header",
            disableColumnSorting: true,
            disableColumnMenu: true,
            resizable: true,
            editable: false,
            sortable: false,
            display: "flex",
            flex:0.5,
            renderCell: (cellValues) => {
                if (!cellValues.row.required) {
                    let txtLab;
                    let txtMouseover;
                    let labData = cellValues.row.sdxData.LabValues;
                    if (labData !== undefined && labData.ValueType !== undefined) {
                        switch (labData.ValueType) {
                            case undefined:
                                break;
                            case "TEXT":
                                if (labData.Value.length > 1) {
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
                                txtMouseover = txtLab;
                                break;
                        }

                        return <Link href={`#${cellValues.row.id}`} title={txtMouseover} onClick={(event) => {
                            handleSetValueClick(event, cellValues);
                        }}>{txtLab}</Link>;
                    } else {
                        return <Link href={`#${cellValues.row.id}`} onClick={(event) => {
                            handleSetValueClick(event, cellValues);
                        }}>Set Value</Link>;
                    }
                }
            }
        },
        {
            field: 'dataOption',
            headerName: 'Aggregation Method',
            headerClassName: "header",
            minWidth: 275,
            resizable: false,
            disableColumnMenu: true,
            disableReorder: true,
            display: "flex",
            hideSortIcons: true,
            disableColumnSorting: true,
            sortable: false,
            editable: true,
            type: "singleSelect",
            valueOptions: ({ row }) => {
                let valueOptions = [];
                if (!row.required) {
                    valueOptions.push(
                        { value: "Exists", label: "Existence (Yes/No)" },
                        { value: "NumConcepts", label: "Count: Number of Concepts"},
                        { value: "NumDates", label: "Count: Number of Dates" },
                        { value: "NumEncounters", label: "Count: Number of Encounters" },
                        { value: "NumFacts", label: "Count: Number of Facts" },
                        { value: "NumProviders", label: "Count: Number of Providers" },
                        { value: "MinDate", label: "Date: First Date" },
                        { value: "MaxDate", label: "Date: Last Date" },
                    );
                }else{
                    valueOptions.push ({ value: "Value", label: "Value" });
                }

                if(row.dataType) {
                    if (row.dataType === DATATYPE.INTEGER ||
                        row.dataType === DATATYPE.FLOAT ||
                        row.dataType === DATATYPE.POSINTEGER ||
                        row.dataType === DATATYPE.POSFLOAT) {
                        valueOptions.push(
                            { value: "MinValue", label: "Calc: Minimum Value" },
                            { value: "MaxValue", label: "Calc: Maximum Value" },
                            { value: "AvgValue", label: "Calc: Average Value" },
                            { value: "MedianValue", label: "Calc: Median Value" },
                            {value: "FirstValue", label: "Calc: First Value"},
                            {value: "LastValue", label: "Calc: Last Value"},
                            {value: "NumValues", label: "Count: Number of Values"}
                        );
                    }else{
                        valueOptions.push(
                            { value: "FirstValueEnum", label: "Calc: First Value" },
                            { value: "LastValueEnum", label: "Calc: Last Value" },
                        );
                    }
                }

                return valueOptions;
            },
            valueSetter: (value, row) => {
                dispatch(handleRowAggregation({id: row.id, value: value}));
                return { ...row };
            }
        },
        {
            field: "included",
            headerName: "Actions",
            headerClassName: "header",
            width: 70,
            editable: false,
            sortable: false,
            type: "boolean",
            resizable: false,
            disableColumnMenu: true,
            disableReorder: true,
            hideSortIcons: true,
            disableColumnSorting: true,
            headerAlign: "center",
            renderCell: ({row}) => {
                if (row.required) {
                    if (row.locked) {
                        return (
                            <GridActionsCellItem
                                icon={
                                    <Tooltip title="Column is Locked">
                                        <LockIcon />
                                    </Tooltip>
                                }
                                label="Locked Column"
                            />);
                    } else {
                        if (row.display) {
                            return (
                                <GridActionsCellItem
                                    icon={
                                        <Tooltip title="Column is Exported">
                                            <CheckIcon />
                                        </Tooltip>
                                    }
                                    label="Column is Exported"
                                    onClick={(e) => {
                                        dispatch(handleRowExported({row: row, exported:false}));
                                    }}
                                />
                            );
                        } else {
                            return (
                                <GridActionsCellItem
                                    icon={
                                        <Tooltip title="Column is not Exported">
                                            <CheckBoxOutlineBlankIcon />
                                        </Tooltip>
                                    }
                                    label="Column is not Exported"
                                    onClick={(e) => {
                                        dispatch(handleRowExported({row: row, exported:true}));
                                    }}
                                />
                            );
                        }
                    }
                } else {
                    return (
                        <GridActionsCellItem
                            icon={
                                <Tooltip title="Delete Column">
                                    <DeleteIcon />
                                </Tooltip>
                            }
                            label="Delete Column"
                            onClick={(e) => {
                                dispatch(handleRowDelete({row: row}));
                            }}
                        />
                    );
                }
            }
        }
    ];

    const displayLabValues = (rowId, sdx) => {
        i2b2.authorizedTunnel.function["i2b2.CRC.view.QT.labValue.getAndShowLabValues"](sdx).then((res) => {
            dispatch(handleRowSdx({
                id: rowId, sdx: res
            }));
        });
    }
    const  handleSetValueClick = (event, cellValues) => {
        displayLabValues(cellValues.row.id, cellValues.row.sdxData);
    };

    const conceptDropHandler = (sdx, ev) => {
        let rowNum = null;
        // see if drop is on a row
        let row = ev.target.closest(".MuiDataGrid-row");
        if (row === null) {
            // see if the drop was on the header
            row = ev.target.closest(".MuiDataGrid-columnHeaders");
            if (row !== null) {
                // insert the drop at the very top (this is in-band signaling)
                rowNum = Number.NEGATIVE_INFINITY;
            } else {
                // insert to drop at the very bottom (this is in-band signaling)
                rowNum = Number.POSITIVE_INFINITY;
            }
        } else {
            // insert the drop below the currently set row
            rowNum = parseInt(row.dataset.rowindex) + 1;
        }

        // clean/retrieve sdx info
        delete sdx.renderData.tvNodeState;
        let requestData = {
            ont_max_records: 'max="1"',
            ont_synonym_records: false,
            ont_hidden_records: false,
            concept_key_value: sdx.sdxInfo.sdxKeyValue
        }
        i2b2.ajax.ONT.GetTermInfo(requestData)
            .then((xmlString) => {
                // get and populate metadata info
                let xmlparser = new XMLParser();
                let xmlDoc = xmlparser.parseFromString(xmlString);
                let concepts = xmlDoc.getElementsByTagName('ns6:concepts');
                if (concepts.length !== 0) sdx.origData.xmlOrig =  xmlparser.toString(concepts[0]);
                // metadata
                let valueMetadataList = xmlDoc.getElementsByTagName('metadataxml');
                if (valueMetadataList.length !== 0 ) {
                    let metadata = valueMetadataList[0];
                    sdx.origData.metadata = xmlparser.toString(metadata);
                    let dataType = metadata.getElementsByTagName('DataType');
                    if (dataType.length !== 0) sdx.origData.dataType = DATATYPE[dataType[0].value.toUpperCase()];
                }
            }).finally(() => {
                // insert row
                const rowId = generateTableDefRowId(sdx.sdxInfo.sdxKeyValue);
                dispatch(handleRowInsert({rowIndex: rowNum, rowId: rowId, sdx: sdx}));
                if (sdx.origData.metadata !== undefined) displayLabValues(rowId, sdx);
        });
    };

    const i2b2LibLoaded = () => {
        dispatch(updateI2b2LibLoaded());
    }

    useEffect(() => {
        if (isI2b2LibLoaded && i2b2.sdx !== undefined) {
            i2b2.sdx.AttachType("dropTrgt", "CONCPT");
            i2b2.sdx.setHandlerCustom("dropTrgt", "CONCPT", "DropHandler", conceptDropHandler);
        } else {
            window.addEventListener('I2B2_READY', i2b2LibLoaded);
        }
    }, [isI2b2LibLoaded]);

    const handleCellClick = React.useCallback(
        (params, event) => {
            if (!params.isEditable) return;
            // Ignore portal
            if (event.target.nodeType === 1 && !event.currentTarget.contains(event.target)) return;

            if (params !== undefined) {
                if (params.field === "dataOption" && params.row.required === true) {
                    event.preventDefault();
                    return;
                }
            }
            setCellModesModel((prevModel) => {
                let ret = {
                    ...Object.keys(prevModel).reduce(
                        (acc, id) => ({
                            ...acc,
                            [id]: Object.keys(prevModel[id]).reduce(
                                (acc2, field) => ({
                                    ...acc2,
                                    [field]: {mode: GridCellModes.View},
                                }),
                                {},
                            ),
                        }),
                        {},
                    ),
                    // Revert the mode of the other cells from other rows
                    ...Object.keys(prevModel).reduce(
                        (acc, id) => ({
                            ...acc,
                            [id]: Object.keys(prevModel[id]).reduce(
                                (acc2, field) => ({
                                    ...acc2,
                                    [field]: {mode: GridCellModes.View},
                                }),
                                {},
                            ),
                        }),
                        {},
                    )
                };

                return {
                    ...ret,
                    [params.id]: {
                        // Revert the mode of other cells in the same row
                        ...Object.keys(prevModel[params.id] || {}).reduce(
                            (acc, field) => ({ ...acc, [field]: { mode: GridCellModes.View } }),
                            {},
                        ),
                        [params.field]: { mode: GridCellModes.Edit },
                    },
                };
            });
        },
        [],
    );

    const handleCellModesModelChange = React.useCallback(
        (newModel) => {
            setCellModesModel(newModel);
        },
        [],
    );

    const checkEmptyName = (temp) => {
        if (temp.field === "name") {
            if (temp.value.trim().length === 0) {
                return 'missing';
            }
        }
    }

    const handleConfirmStatus = () => {
        dispatch(loadStatusConfirmed());
    };

    return (
        <div className={"DefineTable"} >

            <div id="dropTrgt">
                <p>Drag a concept onto the grid to add it to the list</p>
                <DataGrid
                    style={{background:"white"}}
                    className={"DefineTableGrid"}
                    rows={rows}
                    columns={columns}
                    showCellVerticalBorder={true}
                    hideFooterSelectedRowCount={true}
                    columnVisibilityModel={{order: false}}
                    disableColumnSelector={true}
                    cellModesModel={cellModesModel}  // causes errors when deleting a row
                    onCellModesModelChange={handleCellModesModelChange} // causes errors when deleting a row
                    onCellClick={handleCellClick}
                    onCellDoubleClick={handleCellClick}
                    initialState={{
                        sorting: {
                            sortModel: [{field:'order',sort:'asc'}]
                        }
                    }}
                    autoHeight={true}
                    hideFooter={true}
                    isCellEditable={({row, colDef}) => (!row.locked && !(row.required && colDef.field === "dataOption"))}
                    getCellClassName={checkEmptyName}
                />
            </div>

            <Stack
                spacing={2}
                direction="row"
                justifyContent="right"
                alignItems="center"
                className={"DefineTableActions"}
            >
                <Button variant="contained" onClick={()=>props.tabChanger(null,1)}>Preview Table</Button>
                <Button variant="contained" onClick={()=>props.tabChanger(null,2)}>Select Participants for Table</Button>
            </Stack>

            {statusInfo.status === "SUCCESS" && handleConfirmStatus()}
            <Dialog
                open={statusInfo.status === "FAIL"}
                onClose={handleConfirmStatus}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Data Request"}
                </DialogTitle>
                <DialogContent dividers>
                    <DialogContentText id="alert-dialog-description">
                        {statusInfo.errorMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" autoFocus onClick={handleConfirmStatus}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );


}