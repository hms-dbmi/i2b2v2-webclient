import React, {useState} from "react";
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography
} from "@mui/material";
import {useSelector} from "react-redux";
import {DataGrid, useGridApiRef} from "@mui/x-data-grid";
import "./UserProjectRolesView.scss";

export const UserProjectRolesView = ({onClose}) => {
    const userProjectRoles = useSelector((state) => state.userProjectRoles );
    const allProjects = useSelector((state) => state.allProjects );
    const [open, setOpen] = React.useState(true);
    const [paginationModel, setPaginationModel] = useState({ pageSize: 25, page: 0});
    const apiRef = useGridApiRef();

    const handleOk = () => {
        setOpen(false);
        onClose();
    };

    const columns = [
        {
            field: 'projectLabel',
            headerName: 'Project Name',
            flex: 1,
            editable: false,
            valueGetter: (param) => {
                let projectLabel = param.value;

                const filteredProject = allProjects.projects.filter(project => project.internalId === param.value);
                if(filteredProject.length > 0){
                    projectLabel = filteredProject[0].name;
                }
                return projectLabel;
            }
        },
        { field: 'roles',
            headerName: 'Roles',
            flex: 1,
            valueGetter: (param) => {
                return param.value.join(", ");
            }
        },
        {
            field: 'createDate',
            headerName: 'Date Assigned',
            type: 'date',
            width: 120,
            editable: false
        },
    ];

    const getRowId = (row) =>{
        return row.projectLabel
    }

    return (<Dialog
        className={"UserProjectRolesView"}
        open={open}
        onClose={handleOk}
        aria-labelledby="user-project-roles-dialog-title"
        aria-describedby="user-project-roles-dialog-description"
        fullWidth={true}
        maxWidth={'xl'}
        PaperProps={{
            sx: {
                minHeight: '60%',
            }
        }}
    >
        <DialogTitle id="user-project-roles-dialog-title">
            User Project Roles Details
        </DialogTitle>
        <DialogContent dividers>
            <Typography className={"UserDetail"}>User Name: {userProjectRoles.user.username}</Typography>
            <Typography className={"UserDetail"}>Full Name: {userProjectRoles.user.fullname}</Typography>

            <DataGrid
                className={"UserProjectRolesViewTable"}
                style={{background:"white"}}
                rows={userProjectRoles.projectRoles}
                columns={columns}
                apiRef={apiRef}
                getRowId={getRowId}
                disableRowSelectionOnClick
                showCellVerticalBorder={true}
                density={'compact'}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onSortModelChange={(model) => {
                    apiRef.current.setPage(0);
                }}
                pageSizeOptions={[25, 50, 100]}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleOk}>Ok</Button>
        </DialogActions>
    </Dialog>
    )
}