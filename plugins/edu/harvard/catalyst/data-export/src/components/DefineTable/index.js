import React, { useState, useEffect } from "react";

import '../../css/tableDef.scss';
import {
    DataGrid,
    GridActionsCellItem,
    GridCellModes
} from '@mui/x-data-grid';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

import Tooltip from '@mui/material/Tooltip';
import ArrowUpIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';

import { LoadTableModal} from "../LoadTableModal";
import { SaveTableModal } from "../SaveTableModal";
import {loadTable, handleRowDelete, handleRowInsert, handleRowExported, handleRowAggregation, handleRowName} from "../../reducers/loadTableSlice";
import {useDispatch, useSelector} from "react-redux";
import {updateI2b2LibLoaded} from "../../reducers/i2b2LibLoadedSlice";
import "./DefineTable.scss";
import {DATATYPE} from "../../models/TableDefinitionRow";

/* global i2b2 */

export const DefineTable = (props) => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const { rows } = useSelector((state) => state.tableDef);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [showLoad, setLoadViz] = React.useState(false);
    const handleLoadOpen = () => setLoadViz(true);
    const handleLoadClose = () => setLoadViz(false);
    const [showSave, setSaveViz] = React.useState(false);
    const handleSaveOpen = () => setSaveViz(true);
    const handleSaveClose = () => setSaveViz(false);
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
            resizable: false,
            disableColumnSorting: true,
            disableColumnMenu: false,
            renderCell: ({row}) =>  (
                <Tooltip title={row.sdxData.renderData?.moreDescriptMinor ? row.sdxData.renderData.moreDescriptMinor : "This is a required column called \""+ row.id+"\" in the database"} >
                    <span className="tabledef-cell-trucate">{row.name}</span>
                </Tooltip>
            ),
            preProcessEditCellProps: ({hasChanged, row, props}) => {
                if (hasChanged) {
                    dispatch(handleRowName({row:row, value: props.value}));
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
                        { value: "MinDate", label: "Date (First)" },
                        { value: "MaxDate", label: "Date (Most Recent)" },
                        { value: "NumFacts", label: "Count" },
                        { value: "ConceptNames", label: "All Concepts (Names/Text)" },
                        { value: "ModeConceptName", label: "Most Frequent Concept (Names/Text)"},
                        { value: "ConceptCodes", label: "All Concepts (Codes)" },
                        { value: "ModeConceptCode", label:  "Most Frequent Concept (Codes)" },
                    );
                }else{
                    valueOptions.push ({ value: "Value", label: "Value" });
                }

                if(row.dataType === DATATYPE.INTEGER ||
                    row.dataType === DATATYPE.FLOAT ||
                    row.dataType === DATATYPE.POSINTEGER ||
                    row.dataType === DATATYPE.POSFLOAT){
                    valueOptions.push(
                        { value: "MinValue", label: "Minimum Value" },
                        { value: "MaxValue", label: "Maximum Value" },
                        { value: "MedianValue", label: "Median Value" },
                        { value: "AvgValue", label: "Average Value" },
                        { value: "ModeValue", label: "Mode (Most Frequent Value)" },
                       // { value: "", label: "List of All Values"}, -- TODO: need to confirm value for this label
                    );
                }

                if(row.dataType === DATATYPE.ENUM
                || row.dataType === DATATYPE.LARGESTRING){
                    valueOptions.push(
                        { value: "ModeValue", label: "Mode (Most Frequent Value)" },
                        // { value: "", label: "List of All Values"}, -- TODO: need to confirm value for this label
                    );
                }

                return valueOptions;
            },
            preProcessEditCellProps: ({hasChanged, row, props}) => {
                if (hasChanged) {
                    dispatch(handleRowAggregation({row:row, value: props.value}));
                }
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
                let actions = [];
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

    const conceptDropHandler = (sdx, ev)  =>{
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
        // remove some unneeded data from the sdx object
        if (sdx?.renderData.tvNodeState) delete sdx.renderData.tvNodeState;

        // get the range in which we can correctly place the row
        const rowOrdering = rows.map((row)=>(row.required ? false : row.order)).filter((a)=>a);
        const rowMin = (rowOrdering.length ? Math.min(...rowOrdering) : rows.length + 1);
        const rowMax = (rowOrdering.length ? Math.max(...rowOrdering) : rows.length);
        let newRowIndex = 0;
        switch (rowNum) {
            case Number.NEGATIVE_INFINITY:
                newRowIndex = rowMin;
                break;
            case Number.POSITIVE_INFINITY:
                newRowIndex = rowMax + 1;
                break;
            default:
                newRowIndex = parseInt(rowNum) + 1;
                if (newRowIndex < rowMin) newRowIndex = rowMin;
        }

        dispatch(handleRowInsert({rowIndex: newRowIndex, sdx: sdx}));
    }

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


    return (
        <div className={"DefineTable"}>
            <LoadTableModal handleClose={handleLoadClose} open={showLoad}/>
            <SaveTableModal handleClose={handleSaveClose} open={showSave}/>

            <Stack
                spacing={2}
                direction="row"
                justifyContent="center"
                alignItems="center"
                className={"DefineTableActions"}
            >
                <Button variant="contained" onClick={handleLoadOpen}>Load Previous</Button>
                <Button variant="contained" onClick={handleSaveOpen}>Save Current</Button>
                <Button variant="contained" onClick={()=>props.tabChanger(2)}>Request Export</Button>
            </Stack>
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
                    isCellEditable={({row}) => (!row.locked)}
                />
            </div>

        </div>
    );


}