import React, { useEffect, useState } from "react";
import {useSelector, useDispatch} from "react-redux";
import {DataGrid, GridActionsCellItem} from "@mui/x-data-grid";
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

import "./QueryTableView.scss";
import {getAllQueries} from "../../reducers/queriesSlice";

export const QueryTableView = ({projectId}) => {
    const dispatch = useDispatch();
    const queries  = useSelector((state) => state.queries);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 100, page: 0});

    useEffect(() => {
        dispatch(getAllQueries({projectId}));
    }, [projectId]);

    const columns = [
        {
            field: 'id',
            minWidth: 150,
            headerName: 'Query Master ID',
            headerClassName: "header",
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
            minWidth: 210,
        },
        {
            field: 'project',
            headerName: 'Project',
            headerClassName: "header",
            sortable: true,
            resizable: false,
            disableReorder: true,
        },
        {
            field: 'username',
            headerName: 'User Name',
            headerClassName: "header",
            sortable: true,
            disableReorder: true,
            minWidth: 200,
        },
        {
            field: 'startDate',
            headerName: 'Start Date',
            headerClassName: "header",
            sortable: true,
            disableReorder: true,
            minWidth: 125,
            maxWidth: 125,
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
            minWidth: 130,
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
            minWidth: 110,
            /*valueGetter: (value) => {
                let formattedValue = value?.length > 0 ? parseInt(value) : value;
                let displayValue = formattedValue;

                if (isNaN(formattedValue) || !(value?.length > 0)) {
                    displayValue = "Not Available";
                }else{
                    if (isObfuscated) {
                        displayValue = formattedValue + decode("&plusmn;") + obfuscatedDisplayNumber;
                    }
                    if (useFloorThreshold) {
                        if (formattedValue < floorThresholdNumber) {
                            displayValue = floorThresholdText + floorThresholdNumber;
                        }
                    }
                }

                return displayValue;
            }*/
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 80,
            cellClassName: 'actions',
            getActions: ({id, row}) => {
                let infoAction = null;

                const noEditModeActions = [
                    <GridActionsCellItem
                        icon={<TextSnippetIcon/>}
                        label="SQL/Xml"
                        className="textPrimary"
                       // onClick={handleEditClick(id)}
                        color="inherit"
                    />
                ];

                return noEditModeActions;
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

    return(
        <DataGrid
            style={{background:"white"}}
            className={"QueryTableView"}
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
            getRowHeight={() => 'auto'}
        />
    )
}