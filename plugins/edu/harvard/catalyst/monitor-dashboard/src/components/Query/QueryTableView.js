import React, { useState } from "react";
import { useDispatch} from "react-redux";
import {DataGrid, GridActionsCellItem} from "@mui/x-data-grid";
import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
import "./QueryTableView.scss";
import {getQueryRequestDetails} from "../../reducers/queryRequestDetailsSlice";
import {QueryRequestDetailsView} from "./QueryRequestDetailsView";
import {Box, Tooltip} from "@mui/material";

export const QueryTableView = ({queries, projectIdList, isObfuscated}) => {
    const dispatch = useDispatch();
    const [paginationModel, setPaginationModel] = useState({ pageSize: 100, page: 0});
    const [showRequestDetails, setShowRequestDetails] = useState(false);

    const handleShowQueryDetails = (queryMasterId) => () => {
        dispatch(getQueryRequestDetails({queryMasterId}));
        setShowRequestDetails(true);
    }

    const columns = [
        {
            field: 'id',
            minWidth: 150,
            headerName: 'Query Master ID',
            headerClassName: "headerNumeric",
            sortable: true,
            type: 'number',
            disableReorder: true,
        },
        {
            field: 'name',
            headerName: 'Query Name',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            minWidth: 205,
            flex: 1
        },
        {
            field: 'project',
            headerName: 'Project',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
            flex: 1,
            valueGetter: (value) => {
                const projectInfo = projectIdList.find(p => p.id === value );
                console.log("projectIdList ", JSON.stringify(projectIdList));

                console.log("value is ", value);
                return projectInfo ? projectInfo.name: "";
            }
        },
        {
            field: 'username',
            headerName: 'User Name',
            headerClassName: "header",
            sortable: true,
            disableReorder: true,
            minWidth: 150,
            flex: 1
        },
        {
            field: 'startDate',
            headerName: 'Start Date',
            headerClassName: "header",
            sortable: true,
            disableReorder: true,
            minWidth: 110,
            maxWidth: 110,
            valueGetter: (value) => {
                if (!value) {
                    return value;
                }
                // Format the Date object
                const date = value.toLocaleDateString();
                const time = value.toLocaleTimeString();

                return date + " " + time;
            }
        },
        {
            field: 'runTime',
            headerName: 'Run Time',
            headerClassName: "header",
            sortable: true,
            disableReorder: true,
            valueGetter: (value) => {
                return value ? value + " secs" : "";
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: "header",
            sortable: true,
            disableReorder: true,
            minWidth: 100,
            valueGetter: (status) => {
                if (status) {
                    return status.name;
                }
                return status;
            },
            renderCell: (param) => {
                return (
                    <div className={"QueryStatus"}>
                        <div>{param.row.status.name}</div>
                    </div>
                );
            }
        },
        {
            field: 'dataRequests',
            headerName: 'Data Requests',
            headerClassName: "header",
            sortable: true,
            resizable: true,
            disableReorder: true,
            width: 85,
            valueGetter: (value) => {
                return value.length;
            }
        },
        {
            field: 'patientCount',
            headerName: 'Count',
            headerClassName: "header",
            sortable: true,
            resizable: true,
            disableReorder: true,
            minWidth: 100,
            valueGetter: (value, row) => {
                let formattedValue = value?.length > 0 ? parseInt(value) : value;
                let displayValue = formattedValue;

                if (isNaN(formattedValue) || !(value?.length > 0)) {
                    displayValue = "";
                }else if (isObfuscated && formattedValue !== -1) {
                    displayValue = row.obfuscatedPatientCountStr;
                }

                return displayValue;
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerClassName: "header",
            width: 70,
            cellClassName: 'actions',
            getActions: ({id, row}) => {
                return ([
                    <Tooltip title="View XML/SQL">
                        <GridActionsCellItem
                            icon={<TextSnippetOutlinedIcon/>}
                            label="SQL/Xml"
                            className="textPrimary"
                            onClick={handleShowQueryDetails(id)}
                            color="inherit"
                        />
                    </Tooltip>
                ]);
            },
        }
    ];

    const CustomNoRowsOverlay = () => {
        return (
            <div className={"tableListingOverlay"}>
                { queries.statusInfo.status !== "FAIL" && <div className={"listingStatusMsg"} >No queries found</div> }
                { queries.statusInfo.status === "FAIL" && <div className={"listingStatusMsg listingStatusErrorMsg"} >There was an error retrieving queries</div>}
            </div>
        );
    };

    const handleCloseRequestDetails = () => {
        console.log("closing request details");
        setShowRequestDetails(false);
    }
    return(
        <Box className={"QueryTableView"}>
            <DataGrid
                style={{background:"white"}}
                className={"QueryTableViewGrid"}
                rows={queries.queryList}
                columns={columns}
                showCellVerticalBorder={true}
                density={'compact'}
                disableRowSelectionOnClick
                initialState={{
                    sorting: {
                        sortModel: [{field:'id',sort:'desc'}]
                    }
                }}
                pageSizeOptions={[25, 50, 100]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                loading={queries.isFetching}
                slotProps={{
                    loadingOverlay: {
                        variant: 'circular-progress',
                        noRowsVariant: 'linear-progress',
                    },
                }}
                slots={{
                    noRowsOverlay: CustomNoRowsOverlay,
                }}
                getRowClassName={(params) => {
                    if (params.row.deleteDate) {
                        return 'deletedRow';
                    }
                    return '';
                }}
                getRowHeight={() => 'auto'}
            />

            {showRequestDetails && <QueryRequestDetailsView onClose={handleCloseRequestDetails}/>}

        </Box>
    )
}