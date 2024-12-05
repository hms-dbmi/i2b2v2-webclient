import React, { useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";

import {Typography, Box, Tooltip, Button} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";

import {updateI2b2LibLoaded} from "../../reducers/i2b2LibLoadedSlice";
import {listResearcherTable} from "../../reducers/listResearcherTableSlice";

import "./ResearcherTableView.scss";

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {TreeItem} from "@mui/x-tree-view";


export const ResearcherTableView = () => {
    const dispatch = useDispatch();
    const isI2b2LibLoaded  = useSelector((state) => state.isI2b2LibLoaded);
    const { rows, isFetching } = useSelector((state) => state.researcherTable);
    const [expandedItems, setExpandedItems] = React.useState([]);

    const handleExpandedItemsChange = (event, itemIds) => {
        setExpandedItems(itemIds);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Request ID',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1
        },
        {
            field: 'description',
            headerName: 'Description',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 2,
            renderCell: (param) => {
                return (
                    <SimpleTreeView expandedItems={expandedItems} onExpandedItemsChange={handleExpandedItemsChange}>
                        <TreeItem itemId={param.row.description} label={param.row.description}>
                            {
                                param.row.requests.map((name) => <TreeItem itemId={name} label={name}/>)
                            }
                        </TreeItem>
                    </SimpleTreeView>
                );
            }
        },
        {
            field: 'dateSubmitted',
            headerName: 'Date Submitted',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1,
            valueGetter: (value) => {
                if (!value) {
                    return value;
                }

                // Format the Date object
                return value.toLocaleDateString();
            }
        },
        {
            field: 'irbNumber',
            headerName: 'IRB #',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1,
        },
        {
            field: 'actions',
            headerName: 'Action',
            headerClassName: "header",
            sortable: false,
            resizable: false,
            disableReorder: true,
            minWidth: 149,
            renderCell: (row) => {
                return (
                    <Button variant="contained" size="small" className={"actions"}>View Details</Button>
                );
            },
        }
    ];

    const i2b2LibLoaded = () => {
        dispatch(updateI2b2LibLoaded());
    }

    useEffect(() => {
        if (!isI2b2LibLoaded) {
            window.addEventListener('I2B2_READY', i2b2LibLoaded);
        }else{
            dispatch(listResearcherTable());
        }
    }, [isI2b2LibLoaded]);

    useEffect(() => {
        if (rows.length > 0) {
            const descriptions = rows.map((p) => p.description);
            setExpandedItems(descriptions);
        }
    }, [rows]);

    return (
        <Box className={"ResearcherTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography className={"title"}>
                List of Export Data Requests
            </Typography>
            <DataGrid
                style={{background:"white"}}
                className={"ResearcherTableGrid"}
                rows={rows}
                columns={columns}
                showCellVerticalBorder={true}
                disableRowSelectionOnClick
                initialState={{
                    sorting: {
                        sortModel: [{field:'id',sort:'asc'}]
                    }
                }}
                loading={isFetching || !isI2b2LibLoaded}
                slotProps={{
                    loadingOverlay: {
                        variant: 'circular-progress',
                        noRowsVariant: 'linear-progress',
                    },
                }}
                getRowHeight={() => 'auto'}
            />
        </Box>
    )
};