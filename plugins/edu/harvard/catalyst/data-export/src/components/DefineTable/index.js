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
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

import { LoadTableModal} from "../LoadTableModal";
import { SaveTableModal } from "../SaveTableModal";
import {loadTableAction} from "../../reducers/loadTableSlice";
import {useDispatch, useSelector} from "react-redux";

import sdxDropHandler from "../../dropHandler"

export const DefineTable = (props) => {
    const dispatch = useDispatch();
    const { table } = useSelector((state) => state.dataTable);
    const allState = useSelector((state) => state.tableListing);

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
            width: 1,
            sortable: true,
            sortingOrder: "ASC",
            hideSortIcons: true,
            disableReorder: true

        },
        {
            field: 'reorder',
            headerName: "Ordering",
            width: "80",
            resizable: false,
            type: 'actions',
            getActions: ({ row }) => {
                let actions = [];
                if (row.demographic) return actions;
                if (row.order > 1) {
                    actions.push(
                        <GridActionsCellItem
                            icon={
                                <Tooltip title="Move row up">
                                    <ArrowUpIcon />
                                </Tooltip>
                            }
                            label="Move row up"
                            onClick={() => alert("up")}
                        />
                    );
                }
                actions.push(
                    <GridActionsCellItem
                        icon={
                            <Tooltip title="Move row down">
                                <ArrowDownIcon />
                            </Tooltip>
                        }
                        label="Move row down"
                        onClick={() => alert("down") }
                    />
                );
                return actions;
            }
        },
        // {
        //     field: "included",
        //     headerName: "Include",
        //     width: 70,
        //     editable: true,
        //     sortable: false,
        //     type: "boolean",
        //     resizable: false,
        //     disableColumnMenu: true,
        //     disableReorder: true,
        //     hideSortIcons: true,
        //     disableColumnSorting: true,
        //     headerAlign: "center"
        // },
        {
            field: 'name',
            headerName: 'Concept',
            minWidth: 450,
            flex:1,
            sortable: false,
            disableColumnSorting: true,
            disableColumnMenu: false,
        },
        {
            field: 'aggregation',
            headerName: 'Aggregation',
            width: 300,
            resizable: false,
            disableColumnMenu: true,
            disableReorder: true,
            display: "flex",
            hideSortIcons: true,
            disableColumnSorting: true,
            sortable: false,
//        headerAlign: "center",
            editable: true,
            type: "singleSelect",
            valueOptions: ({ row }) => {
                if (row.demographic) {
                    return ["Value"];
                } else {
                    return [
                        "Existence (Yes/No)",
                        "Date (First)",
                        "Date (Most Recent)",
                        "Count",
                        "All Concepts (Names/Text)",
                        "Most Frequent Concept (Names/Text)",
                        "All Concepts (Codes)",
                        "Most Frequent Concept (Codes)",
                        "Minimum Value",
                        "Maximum Value",
                        "Median Value",
                        "Average Value",
                        "Mode (Most Frequent Value)",
                        "List of All Values"
                    ];
                }
            }
        },
        {
            field: "included",
            headerName: "Include",
            width: 70,
            editable: true,
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
                if (row.demographic) {
                    if (row.included) {
                        return (<CheckIcon />);
                    } else {
                        return (<CloseIcon />);
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
                                alert("delete");
                                console.dir(e);
                                e.nativeEvent.preventDefault();
                            }}
                        />
                    );
                }
            }
        }
    ];

    /*React.useEffect(()=>{
        // Attach drop handler
        if (i2b2 && i2b2.sdx !== undefined) {
            i2b2.sdx.AttachType("dropTrgt", "CONCPT");
            i2b2.sdx.setHandlerCustom("dropTrgt", "CONCPT", "DropHandler", sdxDropHandler);
        }
    });*/

    const handleCellClick = React.useCallback(
        (params, event) => {
            if (!params.isEditable) return;
            // Ignore portal
            if (event.target.nodeType === 1 && !event.currentTarget.contains(event.target)) return;

            if (params !== undefined) {
                if (params.field === "aggregation" && params.row.demographic === true) {
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

    useEffect(() => {
        dispatch(loadTableAction());
    }, []);


    return (
        <div>
            <LoadTableModal handleClose={handleLoadClose} open={showLoad}/>
            <SaveTableModal handleClose={handleSaveClose} open={showSave}/>

            <Stack
                spacing={2}
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                style={{width:"76%", margin:"auto", marginBottom: "16px"}}
            >
                <Button variant="contained" onClick={handleLoadOpen}>Load Previous Definition</Button>
                <Button variant="contained" onClick={handleSaveOpen}>Save Current Definition</Button>
                <Button variant="contained" onClick={()=>props.tabChanger(2)}>Request Export With This Definition</Button>
            </Stack>
            <div id="dropTrgt" style={{ height:"60%", width: '76%', margin:"auto", background:"#077cf982", padding:"5px", borderRadius:"5px"}}>
                <p style={{fontStyle:"italic", fontWeight:"bold"}}>Drag a concept onto the grid to add it to the list</p>
                <DataGrid
                    style={{background:"white"}}
                    rows={table}
                    columns={columns}
                    showCellVerticalBorder={true}
                    hideFooterSelectedRowCount={true}
                    columnVisibilityModel={{order: false}}
                    disableColumnSelector={true}
                    cellModesModel={cellModesModel}
                    onCellModesModelChange={handleCellModesModelChange}
                    onCellClick={handleCellClick}
                    onCellDoubleClick={handleCellClick}
                    initialState={{
                        sorting: {
                            sortModel: [{field:'order',sort:'asc'}]
                        }
                    }}
                    autoHeight={true}
                    hideFooter={true}
                />
            </div>

        </div>
    );


}