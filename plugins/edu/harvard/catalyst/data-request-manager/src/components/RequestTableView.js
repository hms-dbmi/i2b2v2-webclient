import React, {  useState } from "react";

import {Typography, Box, Button} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {TreeItem} from "@mui/x-tree-view";
import "./RequestTableView.scss";

export const RequestTableView = ({rows, isLoading, isManager, displayDetailView}) => {
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0});
    const columns = [
        {
            field: 'id',
            minWidth: 120,
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
            flex: 3,
            renderCell: (param) => {
                return (
                    <SimpleTreeView defaultExpandedItems={isManager ? [] : [param.row.description]}>
                        <TreeItem itemId={param.row.description} label={param.row.description}>
                            {
                                param.row.requests.map((exportRequest, index) => {
                                    return (<TreeItem itemId={exportRequest.description} className={"requestLabel"} label={(index +1) + ". " + exportRequest.description}/>)
                                })
                            }
                        </TreeItem>
                    </SimpleTreeView>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 2
        },
        {
            field: 'lastUpdated',
            headerName: 'Last Updated',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            minWidth: 105,
            maxWidth: 105,
            valueGetter: (value) => {
                if (!value) {
                    return value;
                }
                // Format the Date object
                return value.toLocaleDateString();
            }
        },
        {
            field: 'actions',
            headerName: 'Action',
            headerClassName: "header",
            sortable: false,
            resizable: false,
            disableReorder: true,
            minWidth: 138,
            renderCell: (param) => {
                return (
                    <Button variant="contained" size="small" className={"actions"} onClick={() => handleDisplayDetailView(param.row)}>View Details</Button>
                );
            },
        }
    ];

    const handleDisplayDetailView = (requestRow) => {
        displayDetailView(requestRow);
    };

    const getColumns = () => {
        if(isManager){
            columns.splice(2, 0, {
                field: 'userId',
                headerName: 'User',
                headerClassName: "header",
                sortable: true,
                resizable: false,
                disableReorder: true,
                flex: 1,
            });
            columns.splice(3, 0, {
                field: 'patientCount',
                headerName: 'Count',
                headerClassName: "header",
                sortable: true,
                resizable: false,
                disableReorder: true,
                flex: 1,
                valueGetter: (value) => {
                    let formattedValue = value.length > 0 ? parseInt(value): "";
                    if(isNaN(formattedValue)){
                        formattedValue = value;
                    }
                    return formattedValue.toLocaleString();
                }
            });
        }

        return columns;
    }
    return (
        <Box className={"RequestTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography className={"title"}>
                List of Export Data Requests
            </Typography>
            <DataGrid
                style={{background:"white"}}
                className={"ResearcherTableGrid"}
                rows={rows}
                columns={getColumns()}
                showCellVerticalBorder={true}
                disableRowSelectionOnClick
                initialState={{
                    sorting: {
                        sortModel: [{field:'id',sort:'asc'}]
                    }
                }}
                pageSizeOptions={[5, 10, 25]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                loading={isLoading}
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