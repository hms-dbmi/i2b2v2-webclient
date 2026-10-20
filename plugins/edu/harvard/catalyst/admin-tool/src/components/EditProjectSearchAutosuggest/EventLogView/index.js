import React, {useState} from "react";
import './EventLogView.scss';
import {DateTime} from "luxon";
import {DataGrid, gridClasses, useGridApiRef} from "@mui/x-data-grid";

export const EventLogView = ({eventLogs, hasError}) => {
    const [paginationModel, setPaginationModel] = useState({ pageSize: 20, page: 0});

    const apiRef = useGridApiRef();

    const columns = [
        {
            field: 'eventLogType',
            headerName: 'Event Log',
            flex: 1
        },
        {
            field: 'msg',
            headerName: 'Description',
            flex: 2
        },
        {
            field: 'createDateTime',
            headerName: 'Date',
            flex: 2,
            valueFormatter: (elem) => {
                let formattedValue = "";

                if(elem.value) {
                    formattedValue = elem.value.toLocaleDateString() + " " + elem.value.toLocaleTimeString();
                }

                return formattedValue;
            }
        },
    ];

    const getRowId = (row) =>{
        return row.id;
    }

    const CustomNoRowsOverlay = () => {
        return (
            <div className={"tableListingOverlay"}>
                { !hasError && <div className={"listingStatusMsg"} >No events</div> }
                { hasError && <div className={"listingStatusMsg listingStatusErrorMsg"} >There was an error retrieving the event log</div>}
            </div>
        );
    };

    return (
        <DataGrid
            className={"EventLogView"}
            autoHeight
            rows={eventLogs}
            columns={columns}
            getRowId={getRowId}
            editMode="row"
            apiRef={apiRef}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            onSortModelChange={(model) => {
                apiRef.current.setPage(0);
            }}
            pageSizeOptions={[10, 25, 50]}
            sx={{
                [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]: {
                    outline: 'none',
                },
                [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
                    {
                        outline: 'none',
                    },
            }}
            slots={{
                noRowsOverlay: CustomNoRowsOverlay,
            }}
        />
    );
}