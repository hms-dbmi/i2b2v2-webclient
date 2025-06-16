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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CircularProgress from '@mui/material/CircularProgress';
import {useDispatch, useSelector} from "react-redux";
import {DATATYPE, generateTableDefRowId} from "../../models/TableDefinitionRow";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, InputAdornment,
    Link,
    MenuItem,
    Select,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";

import dayjs from 'dayjs';
import {DateModal} from "../DateModal";

import {
    handleRowDelete,
    handleRowInsert,
    handleRowExported,
    handleRowAggregation,
    handleRowName,
    handleRowSdx,
    loadStatusConfirmed,
    loadTermInfo,
} from "../../reducers/tableDefSlice";


import "./DefineTable.scss";
import {DEFAULT_TABLE_TITLE} from "../../sagas/loadTableSaga";

/* global i2b2 */

let currentDateRow = false;

export const DefineTable = (props) => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const { rows, statusInfo, labValueToDisplay, title, folderName, isFetching} = useSelector((state) => state.tableDef);
    const [cellModesModel, setCellModesModel] = React.useState({});
    const doDispSnackbar = props.dispSnackbar;
    const totalRows = React.useRef();

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
            renderCell: ({row}) =>  {
                let index = -1;
                let dupIndex = -1;
                rows.forEach(p => {
                    if(p.name.toLowerCase() === row.name.toLowerCase()){
                        index++;
                    }
                    if(p.id === row.id){
                        dupIndex = index;
                    }
                })
                const name = dupIndex > 0 ? row.name + " (" + dupIndex + ")" : row.name;
                let toolTip = row.name;
                if(row.sdxData?.renderData){
                toolTip =  row.sdxData?.renderData?.moreDescriptMinor ? row.sdxData.renderData.moreDescriptMinor : "This column was originally called \""+ row.sdxData.renderData.title+"\"";
                }

                return (
                    <Tooltip title={toolTip} >
                        { name.length ? <span className="tabledef-cell-trucate">{name}</span>  : <div className="tabledef-cell-trucate">&nbsp;</div> }
                    </Tooltip>
                )
            },
            renderEditCell: (params) => (
                <GridEditInputCell
                    {...params}
                    inputProps={{ maxLength: 200 }}
                />
            )
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
                    let func_getDateTxt = function(sdx) {
                        let ret = {txt: false, mouse: false };
                        ret.txt = "Set Date";
                        ret.mouse = "Click to set a date constraint";
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
                        let dateInfo = func_getDateTxt(cellValues.row.sdxData);
                        return (<span><Link href={`#${cellValues.row.id}`} title={txtMouseover} onClick={(event) => {
                            handleSetValueClick(event, cellValues);
                        }}>{txtLab}</Link> | <Link href={`#${cellValues.row.id}`} title={dateInfo.mouse} onClick={(event) => {
                            handleSetDateClick(event, cellValues);
                        }}>{dateInfo.txt}</Link></span>);
                    } else {
                        let dateInfo = func_getDateTxt(cellValues.row.sdxData);
                        if (labData !== undefined ) {
                            return (<span><Link href={`#${cellValues.row.id}`} onClick={(event) => {
                                handleSetValueClick(event, cellValues);
                            }}>Set Value</Link> | <Link href={`#${cellValues.row.id}`} title={dateInfo.mouse} onClick={(event) => {
                                handleSetDateClick(event, cellValues);
                            }}>{dateInfo.txt}</Link></span>);
                        } else {
                            return (<span><Link href={`#${cellValues.row.id}`} title={dateInfo.mouse} onClick={(event) => {
                                handleSetDateClick(event, cellValues);
                            }}>{dateInfo.txt}</Link></span>);
                        }
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
            editable: false,
            renderCell: ({row}) => {
                return (
                    <div className={"aggregateSelect"}>
                        {createAggregationSelect(row)}
                    </div>
                );
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

    const createAggregationSelect = (row) => {
        if(!row.required) {
            if (row.dataOptionHasError && !row.isLoadingTermInfo) {
                return (
                    <Select
                        value={row.dataOption}
                        onChange={(event) => handleUpdateAggregation({id: row.id, value: event.target.value})}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton aria-label="delete" size="small">
                                    <Tooltip title="Failed to load term info. Click icon to reload.">
                                        <WarningAmberIcon fontSize={"small"}
                                                          onClick={() => reloadTermInfo(row.id, row.sdxData)}
                                                          sx={{color: "red"}}/>
                                    </Tooltip>
                                </IconButton>
                            </InputAdornment>
                        }
                    >
                        {createAggregationSelectOptions(row)}
                    </Select>
                )
            } else if (row.isLoadingTermInfo) {
                return (
                    <Select
                        value={row.dataOption}
                        onChange={(event) => handleUpdateAggregation({id: row.id, value: event.target.value})}
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton aria-label="delete" size="small">
                                    <Tooltip title="Loading term info">
                                        <CircularProgress size="20px"/>
                                    </Tooltip>
                                </IconButton>
                            </InputAdornment>
                        }
                    >
                        {createAggregationSelectOptions(row)}
                    </Select>
                )
            }
            else {
                return (
                    <Select
                        value={row.dataOption}
                        onChange={(event) => handleUpdateAggregation({id: row.id, value: event.target.value})}
                    >
                        {createAggregationSelectOptions(row)}
                    </Select>
                )
            }
        }else{
            return (
                <div>
                    {row.dataOption}
                </div>
            )
        }
    }
    const createAggregationSelectOptions = (row) => {
        let valueOptions = [];
        if (!row.required) {
            valueOptions.push( <MenuItem value={"Exists"}>Existence (Yes/No)</MenuItem>);
            valueOptions.push( <MenuItem value={"NumConcepts"}>Count: Number of Concepts</MenuItem>);
            valueOptions.push( <MenuItem value={"NumDates"}>Count: Number of Dates</MenuItem>);
            valueOptions.push( <MenuItem value={"NumEncounters"}>Count: Number of Encounters</MenuItem>);
            valueOptions.push( <MenuItem value={"NumFacts"}>Count: Number of Facts</MenuItem>);
            valueOptions.push( <MenuItem value={"NumProviders"}>Count: Number of Providers</MenuItem>);
            valueOptions.push( <MenuItem value={"MinDate"}>Date: First Date</MenuItem>);
            valueOptions.push( <MenuItem value={"MaxDate"}>Date: Last Date</MenuItem>);
        }
        else{
            valueOptions.push( <MenuItem value={"Value"}>Value</MenuItem>);
        }

        if(row.dataType) {
            if (row.dataType === DATATYPE.INTEGER ||
                row.dataType === DATATYPE.FLOAT ||
                row.dataType === DATATYPE.POSINTEGER ||
                row.dataType === DATATYPE.POSFLOAT) {
                valueOptions.push( <MenuItem value={"MinValue"}>Calc: Minimum Value</MenuItem>);
                valueOptions.push( <MenuItem value={"MaxValue"}>Calc: Maximum Value</MenuItem>);
                valueOptions.push( <MenuItem value={"AvgValue"}>Calc: Average Value</MenuItem>);
                valueOptions.push( <MenuItem value={"MedianValue"}>Calc: Median Value</MenuItem>);
                valueOptions.push( <MenuItem value={"FirstValue"}>Calc: First Value</MenuItem>);
                valueOptions.push( <MenuItem value={"LastValue"}>Calc: Last Value</MenuItem>);
                valueOptions.push( <MenuItem value={"NumValues"}>Count: Number of Values</MenuItem>);
            }else{
                valueOptions.push( <MenuItem value={"FirstValueEnum"}>Calc: First Value</MenuItem>);
                valueOptions.push( <MenuItem value={"LastValueEnum"}>Calc: Last Value</MenuItem>);
            }
        }

        return valueOptions;
    }

    const reloadTermInfo = (rowId, sdx) => {
        dispatch(loadTermInfo({rowId: rowId, sdx: sdx, displayLabValue: false}));
    }
    const displayLabValues = (rowId, sdx, metadataXml) => {
        i2b2.authorizedTunnel.function["i2b2.CRC.view.QT.labValue.showLabValues"](sdx, metadataXml).then((res) => {
            dispatch(handleRowSdx({
                id: rowId, sdx: res
            }));
        });
    }

    const handleUpdateAggregation = (value) => {
        dispatch(handleRowAggregation(value));
    }
    const  handleSetValueClick = (event, cellValues) => {
        dispatch(loadTermInfo({rowId:cellValues.row.id, sdx: cellValues.row.sdxData, displayLabValue: true}));
    };

    const handleDateSave = () => {
        let rowId = currentDateRow.id;
        let newSdx = currentDateRow.sdxData;
        let newDateRange = {start:"", end:""}
        if (startDate) newDateRange.start = (startDate.$M + 1) + "/" + startDate.$D + "/" + startDate.$y;
        if (endDate) newDateRange.end = (endDate.$M + 1) + "/" + endDate.$D + "/" + endDate.$y;
        newSdx = {...newSdx, dateRange: newDateRange};
        dispatch(handleRowSdx({
            id: rowId, sdx: newSdx
        }));
    }
    const  handleSetDateClick = (event, cellValues) => {
        currentDateRow = cellValues.row;
        let sdx = cellValues.row.sdxData;
        if (sdx.dateRange) {
            if (sdx.dateRange.start === "") {
                setStartDate(undefined);
            } else {
                let temp = sdx.dateRange.start.split('/');
                setStartDate(dayjs(temp[2] + '-' + temp[0] + '-' + temp[1]));
            }
            if (sdx.dateRange.end === "") {
                setEndDate(undefined);
            } else {
                let temp = sdx.dateRange.end.split('/');
                setEndDate(dayjs(temp[2] + '-' + temp[0] + '-' + temp[1]));
            }
        } else {
            setStartDate(undefined);
            setEndDate(undefined);
        }
        handleDateOpen();
    };
    const [showDate, setDateViz] = React.useState(false);
    const handleDateOpen = () => setDateViz(true);
    const handleDateClose = () => setDateViz(false);
    const [startDate, setStartDate] = React.useState(undefined);
    const [endDate, setEndDate] = React.useState(undefined);


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
        // ignore if path starts with configured path
        if (i2b2.model.noDropPaths?.length) {
            for (let temp of i2b2.model.noDropPaths) {
                if (sdx.sdxInfo.sdxKeyValue.startsWith(temp)) {
                    doDispSnackbar('This term is not allowed here.');
                    return false;
                }
            }
        }

        // clean/retrieve sdx info
        delete sdx.renderData.tvNodeState;

        // Do not allow drop if we have 100 rows in the table already
        if (totalRows.current >= 100) {
            props.dispSnackbar("Max of 100 rows reached. Remove existing rows to add this concept. If you need more than 100 rows, create a separate table.");
            return false;
        }

        const rowId = sdx.sdxInfo.sdxKeyValue + '[' +( totalRows.current+1) + ']';
        dispatch(handleRowInsert({rowIndex: rowNum, rowId: rowId, sdx: sdx, hasError: false, displayLabValue: true}));
    };

    useEffect(() => {
        if (isI2b2LibLoaded && i2b2.sdx !== undefined) {
            i2b2.sdx.AttachType("dropTrgt", "CONCPT");
            i2b2.sdx.setHandlerCustom("dropTrgt", "CONCPT", "DropHandler", conceptDropHandler);
        }
    }, [isI2b2LibLoaded]);

    useEffect(() => {
        if (labValueToDisplay != null) {
            displayLabValues(labValueToDisplay.rowId, labValueToDisplay.sdx, labValueToDisplay.valueMetadataXml);
        }
    }, [labValueToDisplay]);

    const handleCellClick = React.useCallback(
        (params, event) => {
            if (!params.isEditable) return;
            // Ignore portal
            if (event.target.nodeType === 1 && !event.currentTarget.contains(event.target)) return;

            if (params) {
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

    const checkValidName = (temp) => {
        if (temp.field === "name") {
            if (temp.value.trim().length === 0) {
                return 'missing';
            }
        }
    }

    const handleConfirmStatus = () => {
        dispatch(loadStatusConfirmed());
    };

    const truncateStr = (str) => {
        const maxLength = 70;
        let truncatedStr = str;
        if(str.length > maxLength){
            truncatedStr = truncatedStr.slice(0, maxLength) + "...";
        }

        return truncatedStr;
    }

    const processRowUpdate = (newRow, previousRow) => {
        newRow.name = newRow.name.trim();
        dispatch(handleRowName({id: newRow.id, value:  newRow.name}));

        return newRow;
    };

    const onProcessRowUpdateError = (error) => {
        console.warn("Process row error: " + error);
    };

    return (
        <div className={"DefineTable"} >
            <DateModal
                handleClose={handleDateClose}
                open={showDate}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                saveUpdate={handleDateSave}
            />
            {title && title !== DEFAULT_TABLE_TITLE &&  <div className={"EditingFile"}>
                <div title={title} >
                    Table name: <b>{truncateStr(title)}</b> (editing)
                    <div className={"TitleFolderName"}>
                        Current saved folder: <b>{folderName}</b>
                    </div>
                </div>
                </div> }
            <div id="dropTrgt">
                <p>Drag a concept onto the grid to add it to the list</p>
                <DataGrid
                    style={{background:"white"}}
                    className={"DefineTableGrid"}
                    onStateChange={(e) => {
                        const rowCount = e.rows.totalRowCount;
                        totalRows.current = rowCount;
                    }}
                    rows={rows}
                    columns={columns}
                    showCellVerticalBorder={true}
                    hideFooterSelectedRowCount={true}
                    columnVisibilityModel={{order: false}}
                    disableColumnSelector={true}
                    cellModesModel={cellModesModel}
                    onCellModesModelChange={handleCellModesModelChange}
                    onCellClick={handleCellClick}
                    onCellDoubleClick={handleCellClick}
                    processRowUpdate={processRowUpdate}
                    onProcessRowUpdateError={onProcessRowUpdateError}
                    initialState={{
                        sorting: {
                            sortModel: [{field:'order',sort:'asc'}]
                        }
                    }}
                    loading={isFetching}
                    slotProps={{
                        loadingOverlay: {
                            variant: 'circular-progress',
                            noRowsVariant: 'linear-progress',
                        },
                    }}
                    autoHeight={true}
                    hideFooter={true}
                    isCellEditable={({row, colDef}) => (!row.locked && !(row.required && colDef.field === "dataOption"))}
                    getCellClassName={checkValidName}
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