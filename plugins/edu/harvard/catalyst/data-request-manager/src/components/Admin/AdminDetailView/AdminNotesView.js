import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import "./AdminNotesView.scss";
import {
    Box,
    Button,
    Card, CircularProgress,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
    getRequestComments,
    updateRequestComments,
    updateRequestCommentsConfirmed
} from "../../../reducers/requestCommentsSlice";


export const AdminNotesView = ({queryMasterId, queryInstanceId}) => {
    const dispatch = useDispatch();
    const {comments, isSaving, isFetching, saveStatusInfo} = useSelector((state) => state.requestComments);
    const [newNote, setNewNote] = React.useState("");
    const [isEditing, setIsEditing] = React.useState(false);

    const handleAddRequestComment = (event) => {
        dispatch(updateRequestComments({comments: newNote, queryInstanceId}));
    }

    const handleRestoreNote = (event) => {
        setNewNote(comments);
    }

    const handleEditNote = (event) => {
        setIsEditing(true);
    }

    const handleCancelEditNote = (event) => {
        setIsEditing(false);
    }

    useEffect(() => {
        dispatch(getRequestComments({queryMasterId}));
    }, []);

    useEffect(() => {
        setNewNote(comments);
    }, [comments]);

    useEffect(() => {
        if(saveStatusInfo.status === "SUCCESS"){
            setIsEditing(false);
            dispatch(updateRequestCommentsConfirmed());
        }
    }, [saveStatusInfo]);

    return (
        <Box className={"AdminNotesView"}>
            <Typography className={"RequestDetailNotesTitle"}>
                Request Comments
            </Typography>
            <Card  className={"RequestDetailNotesContent"}>
                <Grid className={"AddNotesMain"} container spacing={2}>
                    <Grid size={10}>
                        <TextField
                            className={!isEditing ? "TextReadOnlyMode" : ""}
                            multiline
                            rows={5}
                            value={newNote}
                            onChange={(event) => {
                                setNewNote(event.target.value);
                            }}
                            disabled={isSaving || isFetching}
                            inputProps={{
                                readOnly: !isEditing,
                            }}
                        />
                    </Grid>
                    <Grid  className={"AddNoteActions"} size={1}>
                        <Button variant="outlined" size={"small"} onClick={handleRestoreNote}>Restore</Button>
                        {!isEditing ? <Button variant="contained" className={"NoteBtn"} size={"small"} onClick={handleEditNote}>Edit</Button> :
                            <Button variant="outlined" className={"NoteBtn"} size={"small"} onClick={handleCancelEditNote}>Cancel</Button>
                        }
                        {isEditing && <Button variant="contained" className={"NoteBtn"} size={"small"}
                                 disabled={newNote.length === 0 || newNote === comments} onClick={handleAddRequestComment}>
                             Save {isSaving && <CircularProgress size="15px"/>}
                         </Button>
                        }
                    </Grid>
                </Grid>
            </Card>
        </Box>
    )
}