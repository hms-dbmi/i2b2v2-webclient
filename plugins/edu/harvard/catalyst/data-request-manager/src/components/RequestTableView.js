import React, {  useState } from "react";

import {Typography, Box, Button} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {TreeItem} from "@mui/x-tree-view";
import {RequestStatus} from "../models";


export const RequestTableView = ({rows, isLoading, isAdmin, displayDetailViewId}) => {
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0});
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
                    <SimpleTreeView defaultExpandedItems={[param.row.description]}>
                        <TreeItem itemId={param.row.description} label={param.row.description}>
                            {
                                param.row.requests.map((name, index) => {
                                    return (<TreeItem itemId={name} className={"requestLabel"} label={(index +1) + ". " + name}/>)
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
            flex: 1,
            valueGetter: (value) => {
                if (!value) {
                    return RequestStatus.statuses.UNKNOWN;
                }

                return  RequestStatus.statuses[value];
            }
        },
        {
            field: 'lastUpdated',
            headerName: 'Last Updated',
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
            field: 'actions',
            headerName: 'Action',
            headerClassName: "header",
            sortable: false,
            resizable: false,
            disableReorder: true,
            minWidth: 149,
            renderCell: (param) => {
                return (
                    <Button variant="contained" size="small" className={"actions"} onClick={() => handleDisplayDetailView(param.row.id)}>View Details</Button>
                );
            },
        }
    ];

    const handleDisplayDetailView = (id) => {
        displayDetailViewId(id);
    };

    const getColumns = () => {
        if(isAdmin){
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
                field: 'patientSize',
                headerName: 'Patient Size',
                headerClassName: "header",
                sortable: true,
                resizable: false,
                disableReorder: true,
                flex: 1,
            });
        }

        return columns;
    }
    return (
        <Box className={"ResearcherTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
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