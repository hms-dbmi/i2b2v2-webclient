import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {Typography, Box, Button} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";

import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import {TreeItem} from "@mui/x-tree-view";
import RefreshIcon from '@mui/icons-material/Refresh';
import {listRequestTable} from "../reducers/requestTableSlice";
import "./RequestTableView.scss";
import {decode} from "html-entities";

export const RequestTableView = ({ userInfo, displayDetailView}) => {
    const dispatch = useDispatch();
    const { rows, isFetching } = useSelector((state) => state.requestTable);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0});
    const [filterModel, setFilterModel] = useState({items: []});
    const {username, isManager, isObfuscated} = userInfo;
    const { obfuscatedDisplayNumber, useFloorThreshold, floorThresholdNumber, floorThresholdText }
        = useSelector((state) => state.configInfo);

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
            field: 'patientCount',
            headerName: 'Count',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1,
            valueGetter: (value) => {
                let formattedValue = value.length > 0 ? parseInt(value) : "";
                if (isNaN(formattedValue)) {
                    formattedValue = value;
                }
                let displayValue = formattedValue;
                if (isObfuscated) {
                    displayValue = formattedValue + decode("&plusmn;") + obfuscatedDisplayNumber;
                }
                if (useFloorThreshold) {
                    if (formattedValue < floorThresholdNumber) {
                        displayValue = floorThresholdText + floorThresholdNumber;
                    }
                }
                return displayValue;
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 2,
            valueGetter: (value) => {
                if (!value) {
                    return value;
                }
                // Format the Date object
                return value.name;
            }
        },
        {
            field: 'dateSubmitted',
            headerName: 'Date Submitted',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            minWidth: 125,
            maxWidth: 125,
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
            minWidth: 140,
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

    const clearFilterModel = () => {
        setFilterModel({items: []});
    }
    const handleRefreshRequestTable = () => {
        clearFilterModel();
        dispatch(listRequestTable({isManager, username}));
    }

    useEffect(() => {
        if (username) {
            dispatch(listRequestTable({isManager, username}));
        }
    }, [username]);

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
        }

        return columns;
    }
    return (
        <Box className={"RequestTableView"} style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography className={"title"}>
                List of Export Data Requests
                <div className={"RefreshTableIcon"}>
                    <Button onClick={handleRefreshRequestTable} variant="outlined" startIcon={<RefreshIcon />}>
                    Refresh
                </Button>
                </div>
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
                        sortModel: [{field:'id',sort:'desc'}]
                    }
                }}
                filterModel={filterModel}
                onFilterModelChange={(newFilterModel) => {
                    setFilterModel(newFilterModel);
                }}
                pageSizeOptions={[5, 10, 25]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                loading={isFetching}
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